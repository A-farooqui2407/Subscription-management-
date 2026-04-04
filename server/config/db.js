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
 * Test database connectivity (optional health check).
 */
async function testConnection() {
  await sequelize.authenticate();
}

module.exports = { sequelize, testConnection };
