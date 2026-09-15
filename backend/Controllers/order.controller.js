import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import Product from '../models/product.model.js';
import StockMovement from '../models/stockMovement.model.js';
import Invoice from '../models/invoice.model.js';
import Order from '../models/order.model.js';
import Payment from '../models/payment.model.js';
import User from '../models/user.model.js';
import Settings from '../models/settings.model.js';
import { staffRoles } from "../middlewares/auth.middleware.js";
import { objectId, money, pagination } from '../utilities/validation.js';
import { totals, canTransition } from '../services/document.service.js';
import ApiError from '../utilities/apiErrors.js';
import asyncHandler from "../utilities/asyncHandler.js";
import { paymentSummary } from '../services/payment.service.js';
function number(prefix) {
    return prefix + '-' + randomUUID().slice(0, 8).toUpperCase();
}
function owns(document, user) {
    return staffRoles.includes(user.role) || String(document.customer) === user.id;
}
async function getOrder(req) {
    const order = await Order.findById(objectId.parse(req.params.id));
    if (!order) throw new ApiError(404, 'Order not found.');
    if (!owns(order, req.user) && !(req.user.role === 'Delivery Rider' && String(order.rider) === req.user.id)) throw new ApiError(403, 'Access denied.');
    return order;
}
export const checkout = asyncHandler(async (req, res) => {
    const input = z.object({
        items: z.array(z.object({
            product: objectId,
            quantity: z.number().int().min(1).max(1000000)
        }).strict()).min(1).max(100),
        method: z.enum(['Delivery', 'Pickup']),
        location: z.string().trim().max(1000).default(''),
        contact: z.object({
            name: z.string().trim().min(1).max(100),
            phone: z.string().trim().min(5).max(40),
            email: z.email().max(254).optional()
        }).strict().optional()
    }).strict().parse(req.body);
    if (input.method === 'Delivery' && !input.location) throw new ApiError(400, 'Delivery address is required.');
    if (new Set(input.items.map(i => i.product)).size !== input.items.length) throw new ApiError(400, 'Combine duplicate product lines.');
    if (!req.user && !input.contact) throw new ApiError(400, 'Enter your name and phone number to order as a guest.');
    const contact = input.contact || { name: req.user.name, phone: req.user.phone, email: req.user.email };
    const guestContact = req.user ? undefined : contact;
    let order;
    let receipt;
    await mongoose.connection.transaction(async session => {
        const settings = (await Settings.findOne({
            key: 'business'
        }).session(session)) || new Settings();
        const lines = [];
        for (const item of input.items) {
            const product = await Product.findOneAndUpdate({
                _id: item.product,
                active: true,
                stock: {
                    $gte: item.quantity
                }
            }, {
                $inc: {
                    stock: -item.quantity
                }
            }, {
                new: true,
                session
            });
            if (!product) throw new ApiError(409, 'A product is unavailable in the requested quantity.');
            lines.push({
                product: product.id,
                name: product.name,
                quantity: item.quantity,
                price: product.price
            });
            await StockMovement.create([{
                product: product.id,
                quantity: -item.quantity,
                type: 'out',
                reason: 'Storefront checkout',
                guestCheckout: !req.user,
                actor: req.user?.id
            }], {
                session
            });
        }
        const [invoice] = await Invoice.create([{
            number: number('INV'),
            customer: req.user?.id,
            guestContact,
            customerName: contact.name,
            lines,
            ...totals(lines, settings.taxRate),
            taxRate: settings.taxRate,
            currency: settings.currency,
            due: new Date(),
            createdBy: req.user?.id
        }], {
            session
        });
        [order] = await Order.create([{
            invoice: invoice.id,
            invoiceSnapshot: {
                number: invoice.number,
                customer: invoice.customer,
                guestContact: invoice.guestContact,
                customerName: invoice.customerName,
                lines: invoice.lines,
                amount: invoice.amount,
                subtotal: invoice.subtotal,
                tax: invoice.tax,
                taxRate: invoice.taxRate,
                currency: invoice.currency,
                due: invoice.due,
                notes: invoice.notes,
                status: invoice.status,
                createdBy: invoice.createdBy,
                quotation: invoice.quotation
            },
            customer: req.user?.id,
            guestContact,
            contact,
            method: input.method,
            location: input.location,
            feeConfirmed: input.method === 'Pickup',
            timeline: [{
                stage: 'Packing',
                at: new Date(),
                actor: req.user?.id
            }]
        }], {
            session
        });
        receipt = { number: invoice.number, amount: invoice.amount, currency: invoice.currency, method: order.method };
    });
    res.status(201).json({
        data: order,
        receipt
    });
});
export const getOrders = asyncHandler(async (req, res) => {
    const {
        skip,
        limit
    } = pagination(req.query);
    const scope = z.enum(['all', 'pending', 'paid', 'collected']).default('all').parse(req.query.scope ?? 'all');
    const filter = staffRoles.includes(req.user.role) ? {} : req.user.role === 'Delivery Rider' ? {
        rider: req.user.id
    } : {
        customer: req.user.id
    };
    const orders = await Order.find(filter).populate('invoice').populate('rider', 'name phone').sort({
            createdAt: -1
        });
    const payments = await Payment.find({ order: { $in: orders.map(order => order.id) } });
    const rows = orders.map(order => {
        const invoice = order.invoice || order.invoiceSnapshot || null;
        const payment = paymentSummary(order, invoice, payments.filter(payment => String(payment.order) === order.id));
        return {
            ...order.toJSON(),
            invoice: order.invoice || null,
            invoiceSnapshot: order.invoiceSnapshot || null,
            ...payment
        };
    });
    const visible = rows.filter(order => {
        if (scope === 'pending') return !['Collected', 'Received'].includes(order.stage) && order.paymentStatus !== 'Paid';
        if (scope === 'paid') return order.paymentStatus === 'Paid' && !['Collected', 'Received'].includes(order.stage);
        if (scope === 'collected') return ['Collected', 'Received'].includes(order.stage);
        return true;
    });
    res.json({
        data: visible.slice(skip, skip + limit)
    });
});
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await getOrder(req);
    await order.populate('rider', 'name phone');
    const payments = await Payment.find({
        order: order.id
    });
    const invoice = await Invoice.findById(order.invoice) || order.invoiceSnapshot || null;
    res.json({
        data: {
            order,
            invoice,
            payments,
            ...paymentSummary(order, invoice, payments)
        }
    });
});
export const updateFulfillment = asyncHandler(async (req, res) => {
    const input = z.object({
        method: z.enum(['Delivery', 'Pickup']),
        location: z.string().trim().max(1000).default(''),
        deliveryFee: money,
        rider: objectId.nullable().default(null),
        manualRider: z.object({ name: z.string().trim().min(1).max(100), phone: z.string().trim().min(5).max(40) }).strict().nullable().default(null)
    }).strict().parse(req.body);
    if (input.method === 'Delivery' && !input.location) throw new ApiError(400, 'Delivery address is required.');
    if (input.rider && input.manualRider) throw new ApiError(400, 'Choose one rider source.');
    if (input.rider && !(await User.exists({
        _id: input.rider,
        role: 'Delivery Rider',
        active: true
    }))) throw new ApiError(400, 'Choose an active delivery rider.');
    const data = await Order.findOneAndUpdate({
        _id: objectId.parse(req.params.id),
        stage: 'Packing'
    }, {
        ...input,
        feeConfirmed: true,
        ...(input.method === 'Pickup' ? {
            location: '',
            deliveryFee: 0,
            rider: null,
            manualRider: null
        } : {})
    }, {
        new: true,
        runValidators: true
    });
    if (!data) throw new ApiError(409, 'Only packing orders can change fulfillment.');
    res.json({
        data
    });
});
export const updateOrderStage = asyncHandler(async (req, res) => {
    const order = await getOrder(req);
    const {
        stage
    } = z.object({
        stage: z.string()
    }).strict().parse(req.body);
    if (req.user.role === 'Customer' && (order.method !== 'Delivery' || stage !== 'Received' || !['Sent out', 'Received'].includes(order.stage))) throw new ApiError(403, 'You can only confirm receipt of a dispatched delivery.');
    // Retrying an already completed transition must not append another event.
    if (stage === order.stage) {
        res.json({ data: order });
        return;
    }
    if (!canTransition(order.method, order.stage, stage)) throw new ApiError(409, 'Invalid next order stage.');
    if (stage === 'Sent out' && !order.rider && !(order.manualRider?.name && order.manualRider?.phone)) throw new ApiError(409, 'Select a rider and save fulfillment before marking this order Sent out.');
    const data = await Order.findOneAndUpdate({
        _id: order.id,
        stage: order.stage
    }, {
        $set: {
            stage
        },
        $push: {
            timeline: {
                stage,
                at: new Date(),
                actor: req.user.id
            }
        }
    }, {
        new: true
    });
    if (!data) throw new ApiError(409, 'Order changed. Refresh and retry.');
    res.json({
        data
    });
});
