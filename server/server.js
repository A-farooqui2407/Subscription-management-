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

async function start() {
  if (skipDbCheck()) {
    // eslint-disable-next-line no-console
    console.log('[demo] SKIP_DB_CHECK is set — PostgreSQL not checked at startup.');
  } else {
    try {
      await testConnection();
      // eslint-disable-next-line no-console
      console.log('Database connection OK');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Database connection failed:', err.message);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }

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
