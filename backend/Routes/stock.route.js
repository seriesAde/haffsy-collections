import { Router } from 'express';
import { adjustStock, getStockMovements } from "../Controllers/stock.controller.js";
import { protect, authorize, staffRoles } from '../middlewares/auth.middleware.js';
const router = Router();
const staff = authorize(...staffRoles);
router.post('/stock-adjustments', protect, staff, adjustStock);
router.get('/stock-movements', protect, staff, getStockMovements);
export default router;
