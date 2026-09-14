import { Router } from 'express';
import { getSettings, updateSettings } from "../Controllers/settings.controller.js";
import { protect, authorize } from '../middlewares/auth.middleware.js';
const router = Router();
router.get('/settings', getSettings);
router.patch('/settings', protect, authorize('Admin'), updateSettings);
export default router;
