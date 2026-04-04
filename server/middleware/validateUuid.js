/**
 * Reject non-UUID path params before hitting controllers.
 */
const { validate: isUuid } = require('uuid');

function validateUuid(...paramNames) {
  return (req, res, next) => {
    for (const param of paramNames) {
      const val = req.params[param];
      if (val && !isUuid(val)) {
        return res.error(`Invalid UUID format for param: ${param}`, 400);
      }
    }
    next();
  };
}

module.exports = validateUuid;
