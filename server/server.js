/**
 * HTTP server entry — loads models/associations, tests DB, starts Express.
 */
require('dotenv').config();

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

  // Optional: await sequelize.sync({ alter: true }) — use migrations in production

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
