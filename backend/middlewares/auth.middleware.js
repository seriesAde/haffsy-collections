import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utilities/apiErrors.js';
import asyncHandler from '../utilities/asyncHandler.js';
export const staffRoles = ['Admin', 'Manager', 'Staff'];

// Private uploads authenticate after their metadata determines access requirements.
export const authenticateRequest = async req => {
    const token = req.cookies.session;
    if (!token) throw new ApiError(401, 'Please sign in.');
    let payload;
    try {
        payload = jwt.verify(token, req.app.locals.config.jwtSecret, {
            algorithms: ['HS256'],
            issuer: 'haf-siyy-api',
            audience: 'haf-siyy-web'
        });
    } catch {
        throw new ApiError(401, 'Session expired. Please sign in again.');
    }
    const user = await User.findById(payload.sub);
    if (!user || !user.active) throw new ApiError(401, 'Account is unavailable.');
    req.user = user;
};
export const protect = asyncHandler(async (req, res, next) => {
    await authenticateRequest(req);
    next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
    if (req.cookies.session) await authenticateRequest(req);
    next();
});
export const authorize = (...allowed) => (req, res, next) => {
    if (!allowed.includes(req.user.role)) throw new ApiError(403, 'You do not have permission for this action.');
    next();
};
export const requireOrigin = origin => (req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('origin') !== origin) {
        throw new ApiError(403, 'Request origin is not allowed.');
    }
    next();
};
