import { z } from 'zod';
import { objectId, money } from '../utilities/validation.js';
import User from '../models/user.model.js';
import ApiError from '../utilities/apiErrors.js';

export const documentInput = z.object({
    customer: objectId.optional(),
    guestContact: z.object({
        name: z.string().trim().min(1).max(100),
        phone: z.string().trim().min(5).max(40),
        email: z.preprocess(value => value === '' ? undefined : value, z.email().max(254).optional())
    }).strict().optional(),
    lines: z.array(z.object({
        product: objectId.optional(),
        name: z.string().trim().min(1).max(200),
        quantity: z.number().int().min(1).max(1000000),
        price: money
    }).strict()).min(1).max(100),
    due: z.iso.date(),
    notes: z.string().max(5000).default(''),
    taxRate: z.number().min(0).max(100),
    currency: z.enum(['NGN', 'USD', 'GBP', 'EUR'])
}).strict().refine(input => Boolean(input.customer) !== Boolean(input.guestContact), {
    message: 'Choose a registered customer or enter a guest name and phone.', path: ['guestContact']
});

export async function documentCustomer(input) {
    if (!input.customer) return { customer: null, customerName: input.guestContact.name, guestContact: input.guestContact };
    const customer = await User.findById(input.customer);
    if (!customer) throw new ApiError(400, 'Customer not found.');
    return { customer: customer.id, customerName: customer.name, guestContact: undefined };
}
