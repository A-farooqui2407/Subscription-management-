/**
 * HTTP server entry — validates env, loads models/associations, tests DB, starts Express.
 */
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
  override: true,
});

const { validateEnv } = require('./config/validateEnv');
validateEnv();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

function skipDbCheck() {
  const v = String(process.env.SKIP_DB_CHECK || '').trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

function listen() {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

async function start() {
  if (skipDbCheck()) {
    // eslint-disable-next-line no-console
    console.warn(
      '[SKIP_DB_CHECK] Starting without PostgreSQL verification — not recommended for real use.'
    );
    listen();
    return;
  }

  try {
    await testConnection();
    // eslint-disable-next-line no-console
    console.log('Database connected successfully');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Database connection failed:', err.message);
    if (err.code) {
      // eslint-disable-next-line no-console
      console.error('Database error code:', err.code);
    }
    if (process.env.NODE_ENV !== 'production' && err.stack) {
      // eslint-disable-next-line no-console
      console.error(err.stack);
    }
    process.exit(1);
  }

  listen();
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});

module.exports = { start };
