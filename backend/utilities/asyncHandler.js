const asyncHandler = handler => (req, res, next) => {
    return Promise.resolve().then(() => handler(req, res, next)).catch(next);
};
export default asyncHandler;
