/**
 * Shared password strength rules for signup / reset / admin user create.
 */
function validatePasswordRules(password) {
  const errors = [];
  if (typeof password !== 'string') {
    errors.push('Password is required');
    return errors;
  }
  if (password.length <= 8) {
    errors.push('Password must be longer than 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain a special character');
  }
  return errors;
}

module.exports = { validatePasswordRules };
