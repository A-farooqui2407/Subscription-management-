# API demo flow (curl)

Set variables (PowerShell):

```powershell
$BASE = "http://localhost:3000/api"
```

Or bash:

```bash
BASE=http://localhost:3000/api
```

## 1. Login

```bash
curl -s -X POST "$BASE/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@demo.subscription\",\"password\":\"Demo123!Secure\"}"
```

Copy `data.token` from the JSON response into `$TOKEN`.

## 2. Dashboard (KPIs)

```bash
curl -s "$BASE/dashboard" -H "Authorization: Bearer $TOKEN"
```

## 3. Create contact (if not using seed)

```bash
curl -s -X POST "$BASE/contacts" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" ^
  -d "{\"name\":\"New Customer\",\"email\":\"new@example.com\",\"type\":\"customer\"}"
```

## 4. Create product

```bash
curl -s -X POST "$BASE/products" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" ^
  -d "{\"name\":\"API Product\",\"productType\":\"Service\",\"salesPrice\":120,\"costPrice\":30}"
```

Save `data.id` as `PRODUCT_ID`.

## 5. Create tax (optional, for lines with tax)

```bash
curl -s -X POST "$BASE/taxes" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" ^
  -d "{\"name\":\"VAT 10\",\"percentage\":10,\"type\":\"percentage\",\"isActive\":true}"
```

Save `data.id` as `TAX_ID`.

## 6. Create plan

```bash
curl -s -X POST "$BASE/plans" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" ^
  -d "{\"name\":\"Monthly API\",\"price\":99,\"billingPeriod\":\"monthly\",\"minQty\":1,\"isActive\":true}"
```

Save `data.id` as `PLAN_ID`.

## 7. Create subscription (draft) with order lines

Replace `CUSTOMER_ID`, `PLAN_ID`, `PRODUCT_ID`, and optionally `TAX_ID`.

```bash
curl -s -X POST "$BASE/subscriptions" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" ^
  -d "{\"customerId\":\"CUSTOMER_ID\",\"planId\":\"PLAN_ID\",\"startDate\":\"2026-04-01\",\"paymentTerms\":\"Net 30\",\"orderLines\":[{\"productId\":\"PRODUCT_ID\",\"qty\":1,\"unitPrice\":99,\"taxId\":\"TAX_ID\"}]}"
```

Save `data.id` as `SUB_ID`.

## 8. Status flow until active (invoice is created on **active**)

```bash
curl -s -X PUT "$BASE/subscriptions/SUB_ID/status" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"status\":\"quotation\"}"

curl -s -X PUT "$BASE/subscriptions/SUB_ID/status" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"status\":\"confirmed\"}"

curl -s -X PUT "$BASE/subscriptions/SUB_ID/status" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"status\":\"active\"}"
```

## 9. List invoices

```bash
curl -s "$BASE/invoices" -H "Authorization: Bearer $TOKEN"
```

Save the new invoice `id` as `INV_ID`.

## 10. Confirm and pay invoice

```bash
curl -s -X PUT "$BASE/invoices/INV_ID/confirm" -H "Authorization: Bearer $TOKEN"

curl -s -X POST "$BASE/invoices/INV_ID/payments" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" ^
  -d "{\"paymentMethod\":\"card\",\"amount\":TOTAL_FROM_INVOICE,\"paymentDate\":\"2026-04-04\",\"notes\":\"Demo\"}"
```

## 11. Dashboard again

```bash
curl -s "$BASE/dashboard" -H "Authorization: Bearer $TOKEN"
```

## 12. Reports (Admin or InternalUser only)

```bash
curl -s "$BASE/dashboard/reports?page=1&limit=10" -H "Authorization: Bearer $TOKEN"
```

---

**Note:** Responses use `{ success, message, data, errors, meta }`. Use `jq` to extract fields if installed.

**After seed:** Steps 3–8 can be shortened: login → dashboard already shows active subscription, paid invoice, and revenue from the seeded payment.
