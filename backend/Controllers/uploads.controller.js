import { detectMime } from '../middlewares/upload.middleware.js';
import Upload from '../models/upload.model.js';
import { authenticateRequest, staffRoles } from '../middlewares/auth.middleware.js';
import { objectId } from '../utilities/validation.js';
import ApiError from '../utilities/apiErrors.js';
import asyncHandler from "../utilities/asyncHandler.js";
export const uploadFile = asyncHandler(async (req, res) => {
    const purpose = req.params.purpose;
    if (!['product', 'payment'].includes(purpose)) throw new ApiError(400, 'Invalid upload purpose.');
    if (purpose === 'product' && !staffRoles.includes(req.user.role)) throw new ApiError(403, 'Staff access required.');
    if (!req.file) throw new ApiError(400, 'Choose a file.');
    const mime = detectMime(req.file.buffer);
    if (!mime || purpose === 'product' && mime === 'application/pdf') throw new ApiError(400, 'Unsupported file contents.');
    const data = await Upload.create({
        purpose,
        owner: req.user.id,
        name: req.file.originalname.slice(0, 150),
        size: req.file.size,
        mime,
        data: req.file.buffer
    });
    res.status(201).json({
        data: {
            id: data.id,
            name: data.name,
            mime,
            url: '/api/uploads/' + data.id
        }
    });
});
export const authorizeFile = asyncHandler(async (req, res, next) => {
    const data = await Upload.findById(objectId.parse(req.params.id)).select('+data');
    if (!data) throw new ApiError(404, 'File not found.');
    req.upload = data;
    if (data.purpose === 'product') return next();
    await authenticateRequest(req);
    if (!staffRoles.includes(req.user.role) && String(data.owner) !== req.user.id) throw new ApiError(403, 'File access denied.');
    next();
});
export const sendFile = asyncHandler((req, res) => {
    const file = req.upload;
    res.set('Content-Type', file.mime).set('Cache-Control', file.purpose === 'product' ? 'public, max-age=3600' : 'private, no-store').set('Content-Disposition', file.mime === 'application/pdf' ? 'attachment; filename="evidence.pdf"' : 'inline').send(file.data);
});
