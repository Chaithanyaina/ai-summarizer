// backend/middleware/errorMiddleware.js
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Show stack trace only in development environment
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { errorHandler };