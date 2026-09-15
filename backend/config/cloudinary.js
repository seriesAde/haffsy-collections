import ApiError from '../utilities/apiErrors.js';

export function cloudinaryConfig(env = process.env) {
    const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = env.CLOUDINARY_API_SECRET?.trim();
    if (!cloudName || !apiKey || !apiSecret) {
        throw new ApiError(503, 'Media uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env.');
    }
    return { cloudName, apiKey, apiSecret };
}
