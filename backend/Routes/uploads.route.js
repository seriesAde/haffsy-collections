import { Router } from 'express';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { uploadFile, authorizeFile, sendFile } from '../Controllers/uploads.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
const router = Router();
router.post('/:purpose', protect, uploadSingle, uploadFile);
router.get('/:id', authorizeFile, sendFile);
export default router;
