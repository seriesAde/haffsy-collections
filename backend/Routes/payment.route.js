import { Router } from 'express';
import { recordPayment, reviewPayment } from "../Controllers/payment.controller.js";
import { protect, authorize } from '../middlewares/auth.middleware.js';
const router = Router();
router.post('/orders/:id/payments', protect, recordPayment);
router.post('/payments/:id/review', protect, authorize('Admin', 'Manager'), reviewPayment);
export default router;
