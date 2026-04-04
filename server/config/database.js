/**
 * Sequelize CLI config (migrations). Runtime app uses config/db.js.
 */
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  override: true,
});


function buildDatabaseUrl() {
  const raw = process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim();
  if (raw) return raw;
  const u = encodeURIComponent(process.env.DB_USER || '');
  const p = encodeURIComponent(process.env.DB_PASSWORD != null ? process.env.DB_PASSWORD : '');
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 5432;
  const name = process.env.DB_NAME || '';
  return `postgres://${u}:${p}@${host}:${port}/${name}`;
}

const url = buildDatabaseUrl();

const common = {
  url,
  dialect: 'postgres',
  define: {
    underscored: true,
    timestamps: true,
  },
};

module.exports = {
  development: { ...common },
  test: { ...common, url: process.env.TEST_DATABASE_URL || url },
  production: { ...common },
};
