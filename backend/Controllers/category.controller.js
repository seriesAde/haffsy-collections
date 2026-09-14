import mongoose from 'mongoose';
import { z } from 'zod';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';
import ApiError from '../utilities/apiErrors.js';
import { objectId } from '../utilities/validation.js';
import asyncHandler from "../utilities/asyncHandler.js";
export const getCategories = asyncHandler(async (req, res) => res.json({
    data: await Category.find().sort({
        name: 1
    })
}));
export const createCategory = asyncHandler(async (req, res) => {
    const {
        name
    } = z.object({
        name: z.string().trim().min(1).max(100)
    }).strict().parse(req.body);
    res.status(201).json({
        data: await Category.create({
            name,
            key: name.toLowerCase()
        })
    });
});
export const updateCategory = asyncHandler(async (req, res) => {
    const {
        name
    } = z.object({
        name: z.string().trim().min(1).max(100)
    }).strict().parse(req.body);
    const data = await Category.findByIdAndUpdate(objectId.parse(req.params.id), {
        name,
        key: name.toLowerCase()
    }, {
        new: true,
        runValidators: true
    });
    if (!data) throw new ApiError(404, 'Category not found.');
    res.json({
        data
    });
});
export const deleteCategory = asyncHandler(async (req, res) => {
    const id = objectId.parse(req.params.id);
    await mongoose.connection.transaction(async session => {
        const category = await Category.findByIdAndUpdate(id, {
            $inc: {
                revision: 1
            }
        }, {
            session
        });
        if (!category) throw new ApiError(404, 'Category not found.');
        if (await Product.exists({
            category: id
        }).session(session)) throw new ApiError(409, 'Reassign category products before deletion.');
        await Category.deleteOne({
            _id: id
        }, {
            session
        });
    });
    res.status(204).end();
});
