import { Router } from 'express';
import { getUsers, createUser, updateUser, deactivateUser } from "../Controllers/user.controller.js";
import { protect, authorize } from '../middlewares/auth.middleware.js';
const router = Router();
router.get('/users', protect, authorize('Admin', 'Manager'), getUsers);
router.post('/users', protect, authorize('Admin'), createUser);
router.patch('/users/:id', protect, authorize('Admin'), updateUser);
router.delete('/users/:id', protect, authorize('Admin'), deactivateUser);
export default router;
