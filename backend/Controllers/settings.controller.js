import { z } from 'zod';
import Settings from '../models/settings.model.js';
import asyncHandler from "../utilities/asyncHandler.js";
export const getSettings = asyncHandler(async (req, res) => res.json({
    data: (await Settings.findOne({
        key: 'business'
    })) || new Settings()
}));
export const updateSettings = asyncHandler(async (req, res) => {
    const input = z.object({
        name: z.string().trim().min(1).max(150),
        email: z.email(),
        phone: z.string().max(40),
        address: z.string().max(500),
        city: z.string().max(150),
        currency: z.enum(['NGN', 'USD', 'GBP', 'EUR']),
        taxRate: z.number().min(0).max(100)
    }).partial().strict().parse(req.body);
    const data = await Settings.findOneAndUpdate({
        key: 'business'
    }, {
        $set: input
    }, {
        new: true,
        upsert: true,
        runValidators: true
    });
    res.json({
        data
    });
});
