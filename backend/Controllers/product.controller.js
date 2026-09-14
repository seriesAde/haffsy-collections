import mongoose from 'mongoose';
import { z } from 'zod';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import StockMovement from '../models/stockMovement.model.js';
import Upload from '../models/upload.model.js';
import ApiError from '../utilities/apiErrors.js';
import { objectId, money, count, pagination, literalSearch } from '../utilities/validation.js';
import asyncHandler from "../utilities/asyncHandler.js";
import { staffRoles } from '../middlewares/auth.middleware.js';
const productInput = z.object({
    name: z.string().trim().min(1).max(150),
    sku: z.string().trim().min(1).max(80).regex(/^[a-z0-9_-]+$/i).transform(v => v.toUpperCase()),
    category: objectId,
    description: z.string().max(5000).default(''),
    price: money,
    cost: money.default(0),
    stock: count.default(0),
    reorder: count.default(0),
    supplier: z.string().max(200).default(''),
    barcode: z.string().max(100).default(''),
    images: z.array(objectId).max(6).default([])
}).strict();
async function validateReferences(input, session) {
    if (input.category && !(await Category.findByIdAndUpdate(input.category, {
        $inc: {
            revision: 1
        }
    }, {
        session
    }))) throw new ApiError(400, 'Category not found.');
    if (input.images && (await Upload.countDocuments({
        _id: {
            $in: input.images
        },
        purpose: 'product'
    }).session(session)) !== new Set(input.images).size) throw new ApiError(400, 'Invalid product image.');
}
export const getProducts = asyncHandler(async (req, res) => {
    const {
        skip,
        limit,
        page
    } = pagination(req.query);
    const filter = {
        active: true
    };
    const availability = z.enum(['available', 'unavailable', 'all']).default('available').parse(req.query.availability);
    if (availability !== 'available') {
        if (!req.user || !staffRoles.includes(req.user.role)) throw new ApiError(403, 'Staff access required to view unavailable products.');
        if (availability === 'all') delete filter.active;
        else filter.active = false;
    }
    if (req.query.q) filter.name = {
        $regex: literalSearch(req.query.q),
        $options: 'i'
    };
    if (req.query.category) filter.category = objectId.parse(req.query.category);
    if (req.query.inStock === 'true') filter.stock = {
        $gt: 0
    };
    if (req.query.min !== undefined || req.query.max !== undefined) {
        filter.price = {};
        if (req.query.min !== undefined) filter.price.$gte = money.parse(Number(req.query.min));
        if (req.query.max !== undefined) filter.price.$lte = money.parse(Number(req.query.max));
    }
    const sort = {
        low: {
            price: 1
        },
        high: {
            price: -1
        },
        name: {
            name: 1
        }
    }[req.query.sort] || {
        createdAt: -1
    };
    const [data, total] = await Promise.all([Product.find(filter).populate('category', 'name').populate('images', 'name mime').sort(sort).skip(skip).limit(limit), Product.countDocuments(filter)]);
    res.json({
        data,
        total,
        page,
        limit
    });
});
export const getProductById = asyncHandler(async (req, res) => {
    const data = await Product.findOne({
        _id: objectId.parse(req.params.id),
        active: true
    }).populate('category', 'name').populate('images', 'name mime');
    if (!data) throw new ApiError(404, 'Product not found.');
    res.json({
        data
    });
});
export const createProduct = asyncHandler(async (req, res) => {
    const input = productInput.parse(req.body);
    let data;
    await mongoose.connection.transaction(async session => {
        await validateReferences(input, session);
        [data] = await Product.create([input], {
            session
        });
        if (input.stock) await StockMovement.create([{
            product: data.id,
            quantity: input.stock,
            type: 'in',
            reason: 'Opening stock',
            actor: req.user.id
        }], {
            session
        });
    });
    res.status(201).json({
        data
    });
});
export const updateProduct = asyncHandler(async (req, res) => {
    const input = productInput.omit({
        stock: true
    }).partial().parse(req.body);
    const id = objectId.parse(req.params.id);
    let data;
    await mongoose.connection.transaction(async session => {
        await validateReferences(input, session);
        data = await Product.findByIdAndUpdate(id, input, {
            session,
            new: true,
            runValidators: true
        });
        if (!data) throw new ApiError(404, 'Product not found.');
    });
    res.json({
        data
    });
});
export const archiveProduct = asyncHandler(async (req, res) => {
    const data = await Product.findByIdAndUpdate(objectId.parse(req.params.id), {
        active: false
    });
    if (!data) throw new ApiError(404, 'Product not found.');
    res.status(204).end();
});

export const setProductAvailability = asyncHandler(async (req, res) => {
    const { active } = z.object({ active: z.boolean() }).strict().parse(req.body);
    const data = await Product.findByIdAndUpdate(objectId.parse(req.params.id), { active }, { new: true, runValidators: true });
    if (!data) throw new ApiError(404, 'Product not found.');
    res.json({ data });
});
