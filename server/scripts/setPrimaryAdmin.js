/**
 * Create or update an Admin user (password hashed by User model hooks).
 * Admins are not creatable from the app UI; use this once per environment.
 *
 * Usage:
 *   npm run set-admin -- you@example.com 'YourStrong@Pass'
 *   SET_ADMIN_EMAIL=... SET_ADMIN_PASSWORD=... npm run set-admin
 */
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { sequelize } = require('../config/db');
const { validateEnv, hasDatabaseConfig } = require('../config/validateEnv');
const { validatePasswordRules } = require('../utils/passwordPolicy');

require('../models/index');

const User = require('../models/User');

async function main() {
  const [, , emailArg, passwordArg] = process.argv;
  const email = (
    emailArg ||
    process.env.SET_ADMIN_EMAIL ||
    ''
  )
    .trim()
    .toLowerCase();
  const password = passwordArg || process.env.SET_ADMIN_PASSWORD || '';
  const name = (process.env.SET_ADMIN_NAME || 'Administrator').trim() || 'Administrator';

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.error(
      'Usage: npm run set-admin -- <email> <password>\n   or set SET_ADMIN_EMAIL and SET_ADMIN_PASSWORD in the environment.'
    );
    process.exit(1);
  }

  const pwdErrs = validatePasswordRules(password);
  if (pwdErrs.length) {
    // eslint-disable-next-line no-console
    console.error('Password policy:', pwdErrs[0]);
    process.exit(1);
  }

  validateEnv({ requireSmtp: false });
  if (!hasDatabaseConfig()) {
    // eslint-disable-next-line no-console
    console.error('Database not configured. Set DATABASE_URL or DB_* in .env');
    process.exit(1);
  }

  await sequelize.authenticate();

  const existing = await User.unscoped().findOne({ where: { email } });
  if (existing) {
    existing.name = name;
    existing.password = password;
    existing.role = 'Admin';
    await existing.save();
    // eslint-disable-next-line no-console
    console.log('Updated existing user to Admin:', email);
  } else {
    await User.create({
      name,
      email,
      password,
      role: 'Admin',
    });
    // eslint-disable-next-line no-console
    console.log('Created Admin:', email);
  }

  await sequelize.close();
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
