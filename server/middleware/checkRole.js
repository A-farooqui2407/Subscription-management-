/**
 * RBAC — allow one of the given roles. Use after verifyToken.
 *
 * @param {...string} allowedRoles
 * @returns {import('express').RequestHandler}
 */
function checkRole(...allowedRoles) {
  const requiredLabel = allowedRoles.join(', ');

  return (req, res, next) => {
    if (!req.user) {
      return res.error('Authentication required', 401);
    }

    const role = req.user.role;
    if (!allowedRoles.includes(role)) {
      return res.error(`Access denied. Required role: ${requiredLabel}`, 403);
    }

    next();
  };
}

module.exports = checkRole;
