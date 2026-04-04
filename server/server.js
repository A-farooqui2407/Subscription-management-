/**
 * HTTP server entry — validates env, loads models/associations, tests DB, starts Express.
 */
require('dotenv').config();

const { validateEnv } = require('./config/validateEnv');
validateEnv();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await testConnection();
    // eslint-disable-next-line no-console
    console.log('Database connection OK');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Database connection failed:', err.message);
    // Continue so API can still run once DB is configured; remove this block to fail fast.
  }

  // Production: use versioned migrations (e.g. sequelize-cli) — never rely on sync({ alter: true }).

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});

module.exports = { start };
