import Wishlist from '../models/wishlist.model.js';
import Product from '../models/product.model.js';
import { objectId } from '../utilities/validation.js';
import asyncHandler from '../utilities/asyncHandler.js';
import ApiError from '../utilities/apiErrors.js';

export const getWishlist = asyncHandler(async (req, res) => {
    const rows = await Wishlist.find({ user: req.user.id }).select('product').lean();
    res.json({ data: rows.map(row => String(row.product)) });
});
export const addWishlistItem = asyncHandler(async (req, res) => {
    const product = objectId.parse(req.params.product);
    if (!await Product.exists({ _id: product, active: true })) throw new ApiError(404, 'Product is unavailable.');
    try {
        await Wishlist.updateOne({ user: req.user.id, product }, { $setOnInsert: { user: req.user.id, product } }, { upsert: true });
    } catch (error) {
        if (error.code !== 11000) throw error;
    }
    res.json({ success: true });
});
export const removeWishlistItem = asyncHandler(async (req, res) => {
    await Wishlist.deleteOne({ user: req.user.id, product: objectId.parse(req.params.product) });
    res.json({ success: true });
});
