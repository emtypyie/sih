import { logger } from "../utils/logger.js";

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal server error";

  if (statusCode >= 500) {
    logger.error(err);
  } else {
    logger.warn(`${statusCode} - ${message} - ${req.method} ${req.path}`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}
