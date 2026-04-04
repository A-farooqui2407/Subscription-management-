/**
 * Consistent API JSON envelope: { success, message, data, errors, meta }
 */

function success(res, data, message = 'Success', statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    message,
    data: data !== undefined ? data : null,
    errors: null,
    meta: null,
  });
}

function error(res, message, statusCode = 400, errors = null) {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors: errors !== undefined ? errors : null,
    meta: null,
  });
}

function paginated(res, data, total, page, limit) {
  const totalPages = limit > 0 ? Math.ceil(Number(total) / Number(limit)) : 0;
  res.status(200).json({
    success: true,
    message: 'Success',
    data,
    errors: null,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  });
}

/**
 * Attaches res.success, res.error, res.paginated for use in route handlers.
 */
function attachResponseHelpers(_req, res, next) {
  res.success = (data, message = 'Success', statusCode = 200) => {
    success(res, data, message, statusCode);
  };
  res.error = (message, statusCode = 400, errors = null) => {
    error(res, message, statusCode, errors);
  };
  res.paginated = (data, total, page, limit) => {
    paginated(res, data, total, page, limit);
  };
  next();
}

module.exports = {
  success,
  error,
  paginated,
  attachResponseHelpers,
};
