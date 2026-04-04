# Subscription-management-
A full-stack Subscription Management System built with React and Node.js that automates the complete subscription lifecycle 
# 🚀 Subscription Management System – Full Plan + Duo Task Split

---

# 🧠 PROJECT OVERVIEW

This project is a full-stack Subscription Management System built using:

* Frontend: React
* Backend: Node.js + Express
* Auth: JWT
* DB: PostgreSQL 

Core Flow:
Product → Plan → Subscription → Invoice → Payment → Dashboard

---

# 🏗️ FULL PROJECT STRUCTURE

## Root

```
subscription-system/
├── client/
├── server/
├── README.md
```

---

# ⚛️ FRONTEND STRUCTURE (client)

```
client/src/
├── api/
│   └── axios.js
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── Card.jsx
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Products.jsx
│   ├── Plans.jsx
│   ├── Subscriptions.jsx
│   ├── Invoices.jsx
│   └── Payments.jsx
├── context/
│   └── AuthContext.jsx
├── routes/
│   └── ProtectedRoute.jsx
├── App.jsx
└── main.jsx
```

---

# 🚀 BACKEND STRUCTURE (server)

```
server/
├── controllers/
├── routes/
├── models/
├── middleware/
├── services/
├── config/
├── app.js
└── server.js
```

---

# 🧩 DATABASE MODELS

## User

* id
* name
* email
* password
* role

## Product

* id
* name
* price

## Plan

* id
* productId
* price
* billingCycle

## Subscription

* id
* userId
* planId
* startDate
* endDate
* status

## Invoice

* id
* subscriptionId
* amount
* tax
* total
* status

## Payment

* id
* invoiceId
* amount
* paymentDate

---

# 🔥 PHASE-WISE PLAN

## PHASE 1: Setup

* Setup React + Express
* Setup DB connection

## PHASE 2: Auth

* Signup/Login API
* JWT middleware
* Login UI

## PHASE 3: Product + Plan

* CRUD APIs
* UI pages

## PHASE 4: Subscription

* Create subscription
* Status flow

## PHASE 5: Auto Invoice (IMPORTANT)

* Create invoice on subscription

## PHASE 6: Payment

* Mark invoice paid

## PHASE 7: Dashboard

* Revenue
* Active subscriptions
* Pending invoices

---

# 👥 DUO TASK SPLIT (VERY IMPORTANT)

## 👨‍💻 DEV 1 (Backend Focus)

### Phase 1–2:

* Setup Express
* JWT Auth
* Middleware

### Phase 3:

* Product + Plan APIs

### Phase 4:

* Subscription API

### Phase 5:

* 🔥 Auto Invoice Logic (MAIN TASK)

### Phase 6:

* Payment APIs

### Phase 7:

* Dashboard APIs

---

## 👨‍💻 DEV 2 (Frontend Focus)

### Phase 1:

* Setup React + Tailwind

### Phase 2:

* Login UI
* Auth context

### Phase 3:

* Product + Plan pages

### Phase 4:

* Subscription UI

### Phase 5:

* Invoice UI

### Phase 6:

* Payment UI

### Phase 7:

* Dashboard UI (cards)

---

# 🔌 INTEGRATION STEP (IMPORTANT)

* Connect frontend to backend via Axios
* Add JWT token in headers

---

# 🎬 FINAL DEMO FLOW

1. Login
2. Create Product
3. Create Plan
4. Create Subscription
5. Auto Invoice Generated
6. Mark Payment
7. Dashboard Updates

---

# TIPS

* Focus on working flow, not just UI
* Keep backend logic strong
* Show automation clearly
* Keep UI clean and simple

---

# 🔥 BONUS 

* Auto-renew subscriptions
* Email notifications
* Discounts

---

END OF PLAN 🚀

