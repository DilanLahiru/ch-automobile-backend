/**
 * Async Error Wrapper
 * Wraps async route handlers to automatically catch errors and pass them to error handler
 * Usage: router.get('/path', asyncHandler(async (req, res, next) => { ... }))
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
