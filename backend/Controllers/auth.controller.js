import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utilities/apiErrors.js';
import asyncHandler from "../utilities/asyncHandler.js";
const password = z.string().min(8).refine(v => Buffer.byteLength(v, 'utf8') <= 72, 'Password must be at most 72 UTF-8 bytes.');
const credentials = z.object({
    email: z.email().max(254).transform(v => v.toLowerCase().trim()),
    password
});
function cookieOptions(config) {
    return {
        httpOnly: true,
        secure: config.production,
        // Vercel and Render are different sites; allow HTTPS session cookies across them.
        sameSite: config.production ? "none" : "lax",
        path: "/",
        maxAge: 8 * 60 * 60 * 1000
    };
}
function session(req, res, user) {
    const config = req.app.locals.config;
    const token = jwt.sign({}, config.jwtSecret, {
        subject: String(user.id),
        expiresIn: "8h",
        issuer: "haf-siyy-api",
        audience: "haf-siyy-web"
    });
    res.cookie("session", token, cookieOptions(config));
}
export const register = asyncHandler(async (req, res) => {
    const input = credentials.extend({
        name: z.string().trim().min(1).max(100)
    }).strict().parse(req.body);
    const user = await User.create({
        name: input.name,
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 12),
        role: 'Customer'
    });
    session(req, res, user);
    res.status(201).json({
        user
    });
});
export const login = asyncHandler(async (req, res) => {
    const input = credentials.parse(req.body);
    const user = await User.findOne({
        email: input.email
    }).select('+passwordHash');
    if (!user || !user.active || !(await bcrypt.compare(input.password, user.passwordHash))) throw new ApiError(401, 'Invalid email or password.');
    user.lastLogin = new Date();
    await user.save();
    session(req, res, user);
    res.json({
        user
    });
});
export const logout = asyncHandler((req, res) => {
    res.clearCookie('session', {
        ...cookieOptions(req.app.locals.config),
        maxAge: undefined
    });
    res.status(204).end();
});
export const getProfile = asyncHandler((req, res) => res.json({
    user: req.user
}));
export const updateProfile = asyncHandler(async (req, res) => {
    const input = z.object({
        name: z.string().trim().min(1).max(100),
        phone: z.string().max(40),
        address: z.string().max(500)
    }).partial().strict().parse(req.body);
    Object.assign(req.user, input);
    await req.user.save();
    res.json({
        user: req.user
    });
});
