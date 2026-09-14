import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { readConfig } from '../config/env.js';
import { connectDatabase } from '../config/db.js';
import User from '../models/user.model.js';
const {
    ADMIN_NAME: name,
    ADMIN_EMAIL: email,
    ADMIN_PASSWORD: password
} = process.env;
try {
    if (!name?.trim() || !email?.includes('@') || !password || password.length < 12 || Buffer.byteLength(password) > 72) throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and a 12+ character ADMIN_PASSWORD (max 72 bytes).');
    await connectDatabase(readConfig().mongoUri);
    await User.init();
    if (await User.exists({
        email: email.toLowerCase().trim()
    })) throw new Error('An account with this email already exists. No changes made.');
    await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: await bcrypt.hash(password, 12),
        role: 'Admin'
    });
    console.log('Administrator created. Remove ADMIN_PASSWORD from .env.');
} catch (error) {
    console.error('Admin creation failed: ' + (error.name === 'Error' ? error.message : error.name));
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
