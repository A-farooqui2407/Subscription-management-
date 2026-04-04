/**
 * PostgreSQL connection via Sequelize.
 * Loads credentials from environment (see root .env.example).
 */
require('dotenv').config();

const { Sequelize } = require('sequelize');

// TODO: instantiate with DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (or DATABASE_URL)
const sequelize = new Sequelize(
  process.env.DATABASE_URL ||
    `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

/**
 * Test database connectivity (optional health check).
 */
async function testConnection() {
  // TODO: await sequelize.authenticate()
}

module.exports = { sequelize, testConnection };
