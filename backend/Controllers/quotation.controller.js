import { documentInput, documentCustomer } from '../services/documentInput.service.js';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import Quotation from '../models/quotation.model.js';
import Invoice from '../models/invoice.model.js';
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
export const getQuotations = asyncHandler(async (req, res) => {
    const {
        skip,
        limit
    } = pagination(req.query);
    const filter = staffRoles.includes(req.user.role) ? {} : {
        customer: req.user.id
    };
    res.json({
        data: await Quotation.find(filter).sort({
            createdAt: -1
        }).skip(skip).limit(limit)
    });
});
export const getQuotationById = asyncHandler(async (req, res) => {
    const data = await Quotation.findById(objectId.parse(req.params.id));
    if (!data) throw new ApiError(404, 'Document not found.');
    if (!owns(data, req.user)) throw new ApiError(403, 'Access denied.');
    res.json({
        data
    });
});
export const createQuotation = asyncHandler(async (req, res) => {
    const input = documentInput.parse(req.body);
    const customer = await documentCustomer(input);
    let data;
    await mongoose.connection.transaction(async session => {
        [data] = await Quotation.create([{
            ...input,
            ...customer,
            ...totals(input.lines, input.taxRate),
            number: number('QUO'),
            createdBy: req.user.id
        }], {
            session
        });
    });
    res.status(201).json({
        data
    });
});
export const updateQuotation = asyncHandler(async (req, res) => {
    const input = documentInput.parse(req.body);
    const id = objectId.parse(req.params.id);
    const customer = await documentCustomer(input);
    let data;
    await mongoose.connection.transaction(async session => {
        if (await Invoice.exists({
            quotation: id
        }).session(session)) throw new ApiError(409, 'Converted quotations cannot be edited.');
        data = await Quotation.findById(id).session(session);
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
export const convertQuotation = asyncHandler(async (req, res) => {
    const id = objectId.parse(req.params.id);
    let invoice;
    await mongoose.connection.transaction(async session => {
        const quote = await Quotation.findById(id).session(session);
        if (!quote) throw new ApiError(404, 'Quotation not found.');
        if (await Invoice.exists({
            quotation: id
        }).session(session)) throw new ApiError(409, 'Quotation already converted.');
        const {
            customer,
            customerName,
            guestContact,
            lines,
            amount,
            subtotal,
            tax,
            taxRate,
            currency,
            due,
            notes
        } = quote;
        [invoice] = await Invoice.create([{
            customer,
            customerName,
            guestContact,
            lines,
            amount,
            subtotal,
            tax,
            taxRate,
            currency,
            due,
            notes,
            quotation: id,
            number: number('INV'),
            createdBy: req.user.id
        }], {
            session
        });
        quote.status = 'Accepted';
        await quote.save({
            session
        });
    });
    res.status(201).json({
        data: invoice
    });
});
