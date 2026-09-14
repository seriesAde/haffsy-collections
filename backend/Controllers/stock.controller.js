import mongoose from 'mongoose';
import { z } from 'zod';
import Product from '../models/product.model.js';
import StockMovement from '../models/stockMovement.model.js';
import ApiError from '../utilities/apiErrors.js';
import { objectId, pagination } from '../utilities/validation.js';
import asyncHandler from "../utilities/asyncHandler.js";
export const adjustStock = asyncHandler(async (req, res) => {
    const input = z.object({
        product: objectId,
        quantity: z.number().int().min(-1000000).max(1000000).refine(n => n !== 0),
        reason: z.string().trim().min(1).max(500)
    }).strict().parse(req.body);
    let data;
    await mongoose.connection.transaction(async session => {
        const product = await Product.findOneAndUpdate({
            _id: input.product,
            active: true,
            stock: {
                $gte: Math.max(0, -input.quantity),
                $lte: 1000000 - Math.max(0, input.quantity)
            }
        }, {
            $inc: {
                stock: input.quantity
            }
        }, {
            session,
            new: true
        });
        if (!product) throw new ApiError(409, 'Product unavailable or adjustment exceeds stock limits.');
        [data] = await StockMovement.create([{
            ...input,
            type: 'adjustment',
            actor: req.user.id
        }], {
            session
        });
    });
    res.status(201).json({
        data
    });
});
export const getStockMovements = asyncHandler(async (req, res) => {
    const {
        skip,
        limit
    } = pagination(req.query);
    const filter = req.query.product ? {
        product: objectId.parse(req.query.product)
    } : {};
    res.json({
        data: await StockMovement.find(filter).populate('product', 'name sku').populate('actor', 'name').sort({
            createdAt: -1
        }).skip(skip).limit(limit)
    });
});
