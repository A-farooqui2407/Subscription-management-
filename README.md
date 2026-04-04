# Subscription Management — Backend API

Node.js + Express + Sequelize (PostgreSQL) API for recurring subscriptions, invoices, payments, and dashboard reporting. **This repository contains the backend only** (no React client in-tree).

## Domain model (actual)

- **User** — JWT auth; roles: `Admin`, `InternalUser`, `PortalUser`.
- **Contact** — Customers / subscribers (`customerId` on subscriptions).
- **Product** + **Variant** — Catalog (plans do **not** FK to products).
- **Tax** — Optional on **OrderLine** (tax snapshot on lines).
- **Discount** — Optional on **Subscription** (applied when status → `confirmed`).
- **Plan** — Recurring plan (price, `billingPeriod`, availability window).
- **QuotationTemplate** — Saved `productLines` JSON for quick subscription creation.
- **Subscription** — Links **Contact** + **Plan**; **OrderLine** rows link **Product** (and optional variant/tax).
- **Invoice** — Created when subscription becomes **`active`** (draft first; confirm → send → pay).
- **Payment** — Recorded against a **confirmed** invoice; marks invoice **paid**.

Relationship summary:

```
Contact → Subscription → OrderLine → Product (→ Variant, Tax)
Subscription → Plan
Subscription → Invoice → Payment
```

## Requirements

- Node.js **≥ 18**
- PostgreSQL **14+** (recommended)

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy environment file and edit values:

   ```bash
   cp .env.example .env
   ```

3. Create the database (example):

   ```sql
   CREATE DATABASE subscription_management;
   ```

4. **Schema (production-safe):** Use **versioned migrations** (e.g. [Sequelize CLI](https://sequelize.org/docs/v6/other-topics/migrations/)) to create/alter tables. Do **not** rely on `sequelize.sync({ alter: true })` in production — it can drop data and is non-deterministic across environments.

   For **local development only**, you may sync once from models if you accept the risk:

   ```js
   // NOT recommended for shared or production DBs
   await sequelize.sync();
   ```

   After changing models, add a migration that creates/updates indexes (see model `indexes` on `subscriptions`, `invoices`, `payments`).

5. Seed demo data (optional):

   ```bash
   npm run seed
   ```

   Re-run the subscription/invoice/payment part only:

   ```bash
   SEED_FORCE=1 npm run seed
   ```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes (min 16 chars) | Signing key for JWT. In **production**, must not be a placeholder string. |
| `DATABASE_URL` | One of DB options | Full Postgres URL. |
| `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` | If no `DATABASE_URL` | Discrete connection fields. |
| `CORS_ORIGIN` | **Yes in production** | Single origin or comma-separated list. Must not be `*` in production. |
| `API_PREFIX` | No | Default `/api`. |
| `PORT` | No | Default `3000`. |
| `NODE_ENV` | No | `production` enables stricter env validation. |
| `SMTP_*`, `SMTP_FROM` | Optional | Needed for password reset and invoice email. If unset, email features fail at runtime (warned in dev). |

See `.env.example` for full list.

On startup, `server/config/validateEnv.js` checks JWT and DB config; in production it **exits** if `CORS_ORIGIN` is missing or `*`, or if JWT looks like a placeholder.

## Run

```bash
npm run dev
# or
npm start
```

- Health: `GET http://localhost:3000/health`
- API base: `http://localhost:3000/api` (unless `API_PREFIX` is changed)

## Demo credentials (after `npm run seed`)

| Field | Value |
|--------|--------|
| Email | `admin@demo.subscription` |
| Password | `Demo123!Secure` |
| Role | `Admin` |

Seeded data includes:

- 3 contacts, 2 products, 2 plans  
- **SUB-DEMO-DRAFT** — draft subscription with lines (no invoice)  
- **SUB-DEMO-ACTIVE** — active subscription with **draft → confirmed → paid** invoice and one **card** payment (dashboard revenue > 0)

## API testing

- **cURL / step-by-step:** [docs/demo-api-flow.md](docs/demo-api-flow.md)
- **Postman:** import [docs/postman-subscription-demo.json](docs/postman-subscription-demo.json), set `token` after login.

## Security (Phase 10)

- **Helmet** — security headers.
- **CORS** — restricted via `CORS_ORIGIN` (dev defaults to localhost Vite + API if unset).
- **Rate limits** — stricter on `/api/auth/login`, `/signup`, password reset routes.
- **JWT** — `verifyToken` wrapped with `asyncHandler` on protected routers to avoid unhandled async errors.

## Subscription → invoice → payment (judge flow)

1. Create **Contact**, **Product**, **Plan**, **Tax** (optional).  
2. `POST /api/subscriptions` with `orderLines` (or `templateId`).  
3. `PUT /api/subscriptions/:id/status` with body `{ "status": "quotation" }` → `{ "status": "confirmed" }` → `{ "status": "active" }`.  
4. On **active**, a **draft** invoice is created automatically.  
5. `PUT /api/invoices/:id/confirm` → `POST /api/invoices/:id/payments` with `paymentMethod`, `amount`, `paymentDate`.  
6. `GET /api/dashboard` — KPIs reflect active subscriptions, revenue (sum of payments), pending confirmed invoices, overdue.

## Project layout

```
server/
  app.js              # Express app, helmet, CORS, routes
  server.js           # validateEnv, listen
  config/             # db, validateEnv
  controllers/
  routes/
  models/             # Sequelize models + index.js associations
  middleware/         # verifyToken, checkRole, errorHandler, rate limiters
  services/           # invoice, plan, discount, email
  scripts/seedDemo.js
docs/
  demo-api-flow.md
  postman-subscription-demo.json
```

## License

Private / as per repository owner.
