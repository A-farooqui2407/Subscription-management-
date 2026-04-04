/**
 * Express application — security headers, CORS, middleware, route mounting, global error handler.
 */
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
  override: true,
});

require('./models/index');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { sequelize } = require('./config/db');
const { getCorsOriginOption } = require('./config/validateEnv');
const { attachResponseHelpers } = require('./utils/responseHelpers');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contacts');
const productRoutes = require('./routes/products');
const taxRoutes = require('./routes/taxes');
const discountRoutes = require('./routes/discounts');
const planRoutes = require('./routes/plans');
const quotationTemplateRoutes = require('./routes/quotationTemplates');
const subscriptionRoutes = require('./routes/subscriptions');
const invoiceRoutes = require('./routes/invoices');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: getCorsOriginOption(),
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));

// res.success, res.error, res.paginated — available in all downstream handlers
app.use(attachResponseHelpers);

function skipDbCheck() {
  const v = String(process.env.SKIP_DB_CHECK || '').trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

app.get('/health', async (_req, res) => {
  if (skipDbCheck()) {
    return res.json({ status: 'ok', db: 'skipped' });
  }
  try {
    await sequelize.authenticate();
    return res.json({ status: 'ok', db: 'connected' });
  } catch {
    return res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

const API = process.env.API_PREFIX || '/api';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/contacts`, contactRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/taxes`, taxRoutes);
app.use(`${API}/discounts`, discountRoutes);
app.use(`${API}/plans`, planRoutes);
app.use(`${API}/quotation-templates`, quotationTemplateRoutes);
app.use(`${API}/subscriptions`, subscriptionRoutes);
app.use(`${API}/invoices`, invoiceRoutes);
app.use(`${API}/payments`, paymentRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);

// 404 — after all routes; before error handler
app.use((_req, res) => {
  res.error('Not found', 404);
});

// Global error handler — must be last
app.use(errorHandler);

module.exports = app;
