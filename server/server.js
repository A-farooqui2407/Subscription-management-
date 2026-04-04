/**
 * HTTP server entry — starts Express app, optional DB sync / listen port.
 */
require('dotenv').config();

const app = require('./app');
const { sequelize, testConnection } = require('./config/db');

// Import models so Sequelize registers them (associations to be wired later).
require('./models/User');
require('./models/Contact');
require('./models/Product');
require('./models/Variant');
require('./models/Tax');
require('./models/Discount');
require('./models/Plan');
require('./models/QuotationTemplate');
require('./models/Subscription');
require('./models/OrderLine');
require('./models/Invoice');
require('./models/Payment');

const PORT = process.env.PORT || 3000;

async function start() {
  // TODO: await testConnection()
  // TODO: await sequelize.sync({ alter: false }) or use migrations only
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
