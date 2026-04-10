/**
 * Global error handler middleware.
 * Catches unhandled errors and returns a clean JSON response.
 */
const errorHandler = (err, req, res, _next) => {
  console.error('❌ Unhandled error:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error:   process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
};

module.exports = errorHandler;
