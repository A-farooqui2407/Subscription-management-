/**
 * Startup validation for required environment variables.
 * SMTP is optional: warns in development if unset; optional strict check for production email features.
 */
const PLACEHOLDER_SECRETS = ['change-me-in-production', 'changeme'];

function hasDatabaseConfig() {
  const url = process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim();
  if (url) return true;
  const host = process.env.DB_HOST && String(process.env.DB_HOST).trim();
  const name = process.env.DB_NAME && String(process.env.DB_NAME).trim();
  const user = process.env.DB_USER && String(process.env.DB_USER).trim();
  return Boolean(host && name && user);
}

/**
 * @param {{ requireSmtp?: boolean }} [options]
 */
function validateEnv(options = {}) {
  const { requireSmtp = false } = options;
  const isProd = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  const jwt = process.env.JWT_SECRET && String(process.env.JWT_SECRET).trim();
  if (!jwt || jwt.length < 16) {
    errors.push('JWT_SECRET must be set and at least 16 characters long.');
  } else if (PLACEHOLDER_SECRETS.some((p) => jwt.toLowerCase().includes(p))) {
    warnings.push('JWT_SECRET looks like a placeholder; use a strong random value in production.');
    if (isProd) {
      errors.push('JWT_SECRET must not use a known placeholder in production.');
    }
  }

  if (!hasDatabaseConfig()) {
    errors.push('Database not configured: set DATABASE_URL or DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD.');
  }

  if (isProd) {
    const cors = process.env.CORS_ORIGIN && String(process.env.CORS_ORIGIN).trim();
    if (!cors || cors === '*') {
      errors.push('CORS_ORIGIN must be set to an explicit origin (not *) in production.');
    }
  } else if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
    warnings.push(
      'CORS_ORIGIN not set or is * — using default dev origins. Set CORS_ORIGIN for stricter local testing.'
    );
  }

  if (requireSmtp || isProd) {
    const smtpHost = process.env.SMTP_HOST && String(process.env.SMTP_HOST).trim();
    if (!smtpHost) {
      if (requireSmtp) {
        errors.push('SMTP_HOST is required for this operation.');
      } else {
        warnings.push(
          'SMTP not configured — password reset and invoice email will fail until SMTP_HOST (and related vars) are set.'
        );
      }
    }
  }

  warnings.forEach((w) => {
    // eslint-disable-next-line no-console
    console.warn(`[env] ${w}`);
  });

  if (errors.length > 0) {
    // eslint-disable-next-line no-console
    console.error('[env] Configuration errors:\n', errors.map((e) => `  - ${e}`).join('\n'));
    if (isProd) {
      process.exit(1);
    }
  }
}

/**
 * CORS origin(s): single URL, comma-separated list, or default dev list when unset (non-production only).
 * @returns {boolean | string | string[]}
 */
function getCorsOriginOption() {
  const raw = process.env.CORS_ORIGIN && String(process.env.CORS_ORIGIN).trim();
  const isProd = process.env.NODE_ENV === 'production';

  if (!raw || raw === '*') {
    if (isProd) {
      return false;
    }
    return ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
  }

  if (raw.includes(',')) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }

  return raw;
}

module.exports = {
  validateEnv,
  getCorsOriginOption,
  hasDatabaseConfig,
};
