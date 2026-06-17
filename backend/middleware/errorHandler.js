/**
 * Centralized error handler. Keeps internal error details out of
 * production responses while still logging them server-side.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    message: err.message || 'Something went wrong',
    ...(isProd ? {} : { stack: err.stack }),
  });
}

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
