import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getWishlist, addWishlistItem, removeWishlistItem } from '../Controllers/wishlist.controller.js';
const router = Router();
router.get('/', protect, getWishlist);
router.put('/:product', protect, addWishlistItem);
router.delete('/:product', protect, removeWishlistItem);
export default router;
