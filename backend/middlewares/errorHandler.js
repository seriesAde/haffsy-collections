export function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error);
    if (error.name === 'ZodError') return res.status(400).json({
        error: 'Invalid input',
        details: error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message
        }))
    });
    if (error.code === 11000) return res.status(409).json({
        error: 'A record with these unique details already exists.'
    });
    if (error.name === 'CastError') return res.status(400).json({
        error: 'Invalid identifier.'
    });
    if (error.name === 'ValidationError') return res.status(400).json({
        error: 'Invalid record.'
    });
    if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({
        error: 'Maximum file size is 10 MB.'
    });
    const status = error.status || 500;
    if (status === 500) console.error('Request failed:', error.name);
    res.status(status).json({
        error: status === 500 ? 'An unexpected server error occurred.' : error.message
    });
}
