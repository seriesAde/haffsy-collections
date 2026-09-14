import { z } from 'zod';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { objectId, pagination } from '../utilities/validation.js';
import ApiError from '../utilities/apiErrors.js';
import asyncHandler from "../utilities/asyncHandler.js";
const userInput = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.email().transform(v => v.toLowerCase().trim()),
    phone: z.string().max(40).default(''),
    address: z.string().max(500).default(''),
    role: z.enum(['Customer', 'Admin', 'Manager', 'Staff', 'Delivery Rider']),
    active: z.boolean().default(true)
}).strict();
export const getUsers = asyncHandler(async (req, res) => {
    const {
        skip,
        limit
    } = pagination(req.query);
    res.json({
        data: await User.find().sort({
            name: 1
        }).skip(skip).limit(limit)
    });
});
export const createUser = asyncHandler(async (req, res) => {
    const input = userInput.extend({
        password: z.string().min(10).refine(v => Buffer.byteLength(v) <= 72)
    }).parse(req.body);
    const {
        password,
        ...fields
    } = input;
    res.status(201).json({
        data: await User.create({
            ...fields,
            passwordHash: await bcrypt.hash(password, 12)
        })
    });
});
export const updateUser = asyncHandler(async (req, res) => {
    const id = objectId.parse(req.params.id);
    const input = userInput.partial().parse(req.body);
    if (id === req.user.id && (input.active === false || input.role && input.role !== 'Admin')) throw new ApiError(409, 'You cannot remove your own administrator access.');
    const data = await User.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true
    });
    if (!data) throw new ApiError(404, 'User not found.');
    res.json({
        data
    });
});
export const deactivateUser = asyncHandler(async (req, res) => {
    const id = objectId.parse(req.params.id);
    if (id === req.user.id) throw new ApiError(409, 'You cannot deactivate yourself.');
    const data = await User.findByIdAndUpdate(id, {
        active: false
    });
    if (!data) throw new ApiError(404, 'User not found.');
    res.status(204).end();
});
