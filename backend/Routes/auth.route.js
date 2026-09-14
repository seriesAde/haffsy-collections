import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { register, login, logout, getProfile, updateProfile } from '../Controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
const router = Router();
router.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false
}));
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getProfile);
router.patch('/me', protect, updateProfile);
export default router;
