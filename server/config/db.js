/**
 * PostgreSQL connection via Sequelize.
 * Loads credentials from environment (see root .env.example).
 */
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
  override: true,
});

const { Sequelize } = require('sequelize');
const { logger } = require('../utils/logger');

const logging =
  process.env.DEBUG_SQL === 'true' ? (sql) => logger.debug(sql) : false;

const define = {
  underscored: true,
  timestamps: true,
};

/**
 * Use DATABASE_URL when set; otherwise discrete DB_* vars (avoids URL parsing if password contains @, :, etc.).
 */
function createSequelize() {
  const url = process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim();
  if (url) {
    return new Sequelize(url, {
      dialect: 'postgres',
      logging,
      define,
    });
  }

  const database = process.env.DB_NAME;
  const username = process.env.DB_USER;
  const password = process.env.DB_PASSWORD != null ? process.env.DB_PASSWORD : '';

  return new Sequelize(database, username, password, {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging,
    define,
  });
}

const sequelize = createSequelize();

/**
 * Tables expected after `npm run migrate` (no runtime sync — schema is migration-driven).
 */
const REQUIRED_TABLES = [
  'users',
  'contacts',
  'products',
  'variants',
  'taxes',
  'discounts',
  'plans',
  'quotation_templates',
  'subscriptions',
  'order_lines',
  'invoices',
  'payments',
];

/**
 * Ensure core application tables exist (PostgreSQL).
 */
async function verifyRequiredTables() {
  if (sequelize.getDialect() !== 'postgres') {
    return;
  }
  const [rows] = await sequelize.query(
    `SELECT tablename AS name FROM pg_catalog.pg_tables WHERE schemaname = 'public'`
  );
  const present = new Set(rows.map((r) => r.name));
  const missing = REQUIRED_TABLES.filter((t) => !present.has(t));
  if (missing.length > 0) {
    const err = new Error(
      `Schema incomplete — missing table(s): ${missing.join(', ')}. Run: npm run migrate`
    );
    err.code = 'SCHEMA_INCOMPLETE';
    throw err;
  }
}

/**
 * Authenticate and verify schema. Used at startup and for /health.
 */
async function testConnection() {
  await sequelize.authenticate();
  await verifyRequiredTables();
}

module.exports = { sequelize, testConnection, verifyRequiredTables };
