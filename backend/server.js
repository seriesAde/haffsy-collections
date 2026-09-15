import wishlistRoutes from './Routes/wishlist.route.js';
import categoryRoutes from './Routes/category.route.js';
import productRoutes from './Routes/product.route.js';
import stockRoutes from './Routes/stock.route.js';
import settingsRoutes from './Routes/settings.route.js';
import userRoutes from './Routes/user.route.js';
import quotationRoutes from './Routes/quotation.route.js';
import invoiceRoutes from './Routes/invoice.route.js';
import orderRoutes from './Routes/order.route.js';
import paymentRoutes from './Routes/payment.route.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { requireOrigin } from './middlewares/auth.middleware.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './Routes/auth.route.js';

import uploadRoutes from './Routes/uploads.route.js';


export function createApp(config) {
    const app = express();
    app.locals.config = config;
    app.disable('x-powered-by');
    // Account responses must not be shared by the frontend's reverse proxy.
    app.use('/api', (_req, res, next) => {
        res.set('Cache-Control', 'private, no-store');
        next();
    });
    app.use(helmet({
        crossOriginResourcePolicy: {
            policy: 'cross-origin'
        }
    }));
    app.use(cors({
        origin: config.origin,
        credentials: true
    }));
    app.use(express.json({
        limit: '1mb'
    }), cookieParser());
    app.use('/api', rateLimit({
        windowMs: 60000,
        limit: 200,
        standardHeaders: 'draft-8',
        legacyHeaders: false
    }), requireOrigin(config.origin));
    app.get('/api/health', (req, res) => res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }));
    app.use('/api/auth', authRoutes);
    
    app.use('/api/uploads', uploadRoutes);
    app.use('/api/wishlist', wishlistRoutes);
    
    app.use('/api', categoryRoutes);
    app.use('/api', productRoutes);
    app.use('/api', stockRoutes);
    app.use('/api', settingsRoutes);
    app.use('/api', userRoutes);
    app.use('/api', quotationRoutes);
    app.use('/api', invoiceRoutes);
    app.use('/api', orderRoutes);
    app.use('/api', paymentRoutes);
    app.use((req, res) => res.status(404).json({
        error: 'Endpoint not found.'
    }));
    app.use(errorHandler);
    return app;
}
