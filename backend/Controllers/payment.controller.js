import { z } from 'zod';
import Order from '../models/order.model.js';
import Invoice from '../models/invoice.model.js';
import Payment from '../models/payment.model.js';
import Upload from '../models/upload.model.js';
import { staffRoles } from "../middlewares/auth.middleware.js";
import { objectId, money } from '../utilities/validation.js';
import ApiError from '../utilities/apiErrors.js';
import asyncHandler from "../utilities/asyncHandler.js";
import { paymentSummary } from '../services/payment.service.js';
function owns(document, user) {
    return staffRoles.includes(user.role) || String(document.customer) === user.id;
}
async function getOrder(req) {
    const order = await Order.findById(objectId.parse(req.params.id));
    if (!order) throw new ApiError(404, 'Order not found.');
    if (!owns(order, req.user) && !(req.user.role === 'Delivery Rider' && String(order.rider) === req.user.id)) throw new ApiError(403, 'Access denied.');
    return order;
}
export const recordPayment = asyncHandler(async (req, res) => {
    const order = await getOrder(req);
    if (req.user.role === 'Delivery Rider') throw new ApiError(403, 'Payment access denied.');
    const input = z.object({
        amount: money.refine(n => n > 0),
        method: z.enum(['Cash', 'Transfer']),
        evidence: objectId
    }).strict().parse(req.body);
    if (!(await Upload.exists({
        _id: input.evidence,
        purpose: 'payment',
        owner: req.user.id
    }))) throw new ApiError(400, 'Invalid evidence file.');
    res.status(201).json({
        data: await Payment.create({
            ...input,
            order: order.id,
            recordedBy: req.user.id,
            status: req.user.role === 'Admin' ? 'Verified' : 'Pending',
            ...(req.user.role === 'Admin' ? { reviewedBy: req.user.id } : {})
        })
    });
});
export const reviewPayment = asyncHandler(async (req, res) => {
    const {
        status
    } = z.object({
        status: z.enum(['Verified', 'Rejected'])
    }).strict().parse(req.body);
    const data = await Payment.findOneAndUpdate({
        _id: objectId.parse(req.params.id),
        status: 'Pending'
    }, {
        status,
        reviewedBy: req.user.id
    }, {
        new: true
    });
    if (!data) throw new ApiError(409, 'Payment missing or already reviewed.');
    if (status === 'Verified') {
        const order = await Order.findById(data.order);
        if (order && order.invoice) {
            const invoice = await Invoice.findById(order.invoice);
            if (invoice) {
                const payments = await Payment.find({ order: order.id });
                const completed = paymentSummary(order, invoice, payments);
                if (completed.paymentStatus === 'Paid') {
                    await Invoice.findByIdAndUpdate(invoice.id, {
                        $set: {
                            status: 'Paid'
                        }
                    }, { new: true });
                    await Order.findByIdAndUpdate(order.id, {
                        $set: {
                            'invoiceSnapshot.status': 'Paid'
                        }
                    }, { new: true });
                }
            }
        }
    }
    res.json({
        data
    });
});
