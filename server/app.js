/**
 * Express application — middleware, route mounting, CORS, global error handler.
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { attachResponseHelpers } = require('./utils/responseHelpers');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contacts');
const productRoutes = require('./routes/productRoutes');
const taxRoutes = require('./routes/taxRoutes');
const discountRoutes = require('./routes/discountRoutes');
const planRoutes = require('./routes/planRoutes');
const quotationTemplateRoutes = require('./routes/quotationTemplateRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// TODO: tighten CORS (origin whitelist from env) for production
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json());

// res.success, res.error, res.paginated — available in all downstream handlers
app.use(attachResponseHelpers);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
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
