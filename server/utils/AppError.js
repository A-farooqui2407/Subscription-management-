/**
 * HTTP-shaped error for services (handled by middleware/errorHandler.js).
 */
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

module.exports = AppError;
