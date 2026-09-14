import { documentInput, documentCustomer } from '../services/documentInput.service.js';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import Invoice from '../models/invoice.model.js';
import Order from '../models/order.model.js';
import Payment from '../models/payment.model.js';
import { staffRoles } from "../middlewares/auth.middleware.js";
import { objectId, pagination } from '../utilities/validation.js';
import { totals } from '../services/document.service.js';
import ApiError from '../utilities/apiErrors.js';
import asyncHandler from "../utilities/asyncHandler.js";
function number(prefix) {
    return prefix + '-' + randomUUID().slice(0, 8).toUpperCase();
}
function owns(document, user) {
    return staffRoles.includes(user.role) || String(document.customer) === user.id;
}
export const getInvoices = asyncHandler(async (req, res) => {
    const {
        skip,
        limit
    } = pagination(req.query);
    const filter = staffRoles.includes(req.user.role) ? {} : {
        customer: req.user.id
    };
    res.json({
        data: await Invoice.find(filter).sort({
            createdAt: -1
        }).skip(skip).limit(limit)
    });
});
export const getInvoiceById = asyncHandler(async (req, res) => {
    const data = await Invoice.findById(objectId.parse(req.params.id));
    if (!data) throw new ApiError(404, 'Document not found.');
    if (!owns(data, req.user)) throw new ApiError(403, 'Access denied.');
    res.json({
        data
    });
});
export const createInvoice = asyncHandler(async (req, res) => {
    const input = documentInput.parse(req.body);
    const customer = await documentCustomer(input);
    let data;
    await mongoose.connection.transaction(async session => {
        [data] = await Invoice.create([{
            ...input,
            ...customer,
            ...totals(input.lines, input.taxRate),
            number: number('INV'),
            createdBy: req.user.id
        }], {
            session
        });
    });
    res.status(201).json({
        data
    });
});
export const updateInvoice = asyncHandler(async (req, res) => {
    const input = documentInput.parse(req.body);
    const id = objectId.parse(req.params.id);
    const customer = await documentCustomer(input);
    let data;
    await mongoose.connection.transaction(async session => {
        {
            const order = await Order.findOne({
                invoice: id
            }).session(session);
            if (order && (order.stage !== 'Packing' || (await Payment.exists({
                order: order.id
            }).session(session)))) throw new ApiError(409, 'Invoices with payments or dispatched orders cannot be edited.');
            if (order) {
                order.customer = customer.customer;
                order.guestContact = customer.guestContact;
                order.contact = customer.guestContact;
                await order.save({
                    session
                });
            }
        }
        data = await Invoice.findById(id).session(session);
        if (!data) throw new ApiError(404, 'Document not found.');
        Object.assign(data, {
            ...input,
            ...customer,
            ...totals(input.lines, input.taxRate)
        });
        await data.save({
            session
        });
        if (!data) throw new ApiError(404, 'Document not found.');
    });
    res.json({
        data
    });
});

export const moveInvoiceToOrder = asyncHandler(async (req, res) => {
    const id = objectId.parse(req.params.id);
    let order;
    await mongoose.connection.transaction(async session => {
        // Serialize moves of the same invoice; retain its record for PDFs and audits.
        const invoice = await Invoice.findByIdAndUpdate(id, { $inc: { __v: 1 } }, { session, new: true });
        if (!invoice) throw new ApiError(404, 'Invoice not found.');
        order = await Order.findOne({ invoice: id }).session(session);
        if (order) return;
        [order] = await Order.create([{
            invoice: invoice.id,
            invoiceSnapshot: invoice.toObject(),
            customer: invoice.customer,
            guestContact: invoice.guestContact,
            contact: invoice.guestContact,
            method: 'Pickup',
            feeConfirmed: true,
            timeline: [{ stage: 'Packing', at: new Date(), actor: req.user.id }]
        }], { session });
    });
    res.json({ data: order });
});
