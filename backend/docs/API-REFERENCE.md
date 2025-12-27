# SafeTrade API Reference

> Base URL: `http://localhost:3000/api`

---

## Table of Contents

- [Users](#users)
- [Partners](#partners)
- [Products](#products)
- [Orders](#orders)
- [Wallets](#wallets)
- [Webhooks](#webhooks)

---

## Users

B2C Telegram Mini App users.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get user by ID |
| GET | `/users/telegram/:telegramId` | Get user by Telegram ID |
| PATCH | `/users/:id` | Update user |

### Example: Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

## Partners

B2B API partners with prepaid credit.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/partners` | List all partners |
| POST | `/partners` | Create partner |
| GET | `/partners/:id` | Get partner by ID |
| PATCH | `/partners/:id` | Update partner |
| GET | `/partners/:id/balance` | Get partner balance |
| POST | `/partners/:id/credit` | Add credit to partner |
| POST | `/partners/:id/debit` | Deduct credit from partner |

### Example: Add Partner Credit
```bash
curl -X POST http://localhost:3000/api/partners/{id}/credit \
  -H "Content-Type: application/json" \
  -d '{"amount": 500, "description": "Initial deposit"}'
```

---

## Products

Gift card product catalog with value-based pricing.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products (with filtering) |
| GET | `/products/categories` | List available categories |
| GET | `/products/:sku` | Get product by SKU |
| POST | `/products` | Create product (admin) |
| PATCH | `/products/:sku/pricing` | Update product pricing |
| POST | `/products/sync` | Trigger Bitrefill sync |

### Query Parameters (GET /products)

| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category (streaming, gaming, etc.) |
| region | string | Filter by region (turkey, us, global) |
| search | string | Search by name or SKU |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

### Example: List Turkey Streaming Products
```bash
curl "http://localhost:3000/api/products?category=streaming&region=turkey"
```

---

## Orders

Gift card orders for B2B partners and B2C users.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List all orders (paginated) |
| POST | `/orders` | Create order |
| GET | `/orders/:id` | Get order by ID |
| GET | `/orders/partner/:partnerId` | Get partner's orders |
| GET | `/orders/user/:userId` | Get user's orders |
| PATCH | `/orders/:id/status` | Update order status |
| POST | `/orders/:id/refund` | Refund order |

### Create Order DTO

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productSku | string | ✅ | Product SKU from catalog |
| quantity | number | ❌ | Quantity (default: 1) |
| partnerId | UUID | ❌* | For B2B orders |
| userId | UUID | ❌* | For B2C orders |

*Either `partnerId` OR `userId` is required, not both.

### Example: Create B2B Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productSku": "netflix-turkey-200",
    "quantity": 1,
    "partnerId": "7aea149c-097a-4f90-bdbb-8ffe226011a1"
  }'
```

### Example: Create B2C Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "productSku": "spotify-turkey-50",
    "quantity": 1,
    "userId": "37d793c8-b5a1-4885-9871-849c99dec672"
  }'
```

---

## Wallets

B2C user USDT wallet management on TON blockchain.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallets` | List all wallets (admin) |
| GET | `/wallets/user/:userId` | Get or create wallet for user |
| GET | `/wallets/user/:userId/balance` | Get wallet balance |
| POST | `/wallets/user/:userId/deposit` | Deposit to wallet |
| POST | `/wallets/user/:userId/withdraw` | Withdraw from wallet |
| GET | `/wallets/:id` | Get wallet by ID |

### Deposit/Withdraw DTO

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | ✅ | Amount in USDT (min: 0.01) |
| description | string | ❌ | Transaction description |
| txHash | string | ❌ | Blockchain transaction hash |

### Example: Deposit to Wallet
```bash
curl -X POST http://localhost:3000/api/wallets/user/{userId}/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 50, "description": "USDT deposit"}'
```

### Balance Response
```json
{
  "available": 50.00,
  "locked": 0.00,
  "total": 50.00,
  "formatted": {
    "available": "$50.00",
    "locked": "$0.00",
    "total": "$50.00"
  }
}
```

---

## Webhooks

Webhook delivery tracking and retry system for B2B partners.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webhooks` | List all webhook deliveries |
| GET | `/webhooks/stats` | Get delivery statistics |
| GET | `/webhooks/failed` | List failed deliveries |
| GET | `/webhooks/pending` | List pending deliveries |
| GET | `/webhooks/partner/:partnerId` | Partner's webhook history |
| GET | `/webhooks/:id` | Get delivery by ID |
| POST | `/webhooks/:id/retry` | Manually retry a webhook |

### Webhook Event Types

| Event | Trigger | Payload Includes |
|-------|---------|------------------|
| order.created | Order created | orderId, productSku, status |
| order.completed | Order fulfilled | giftCardCode, paidAmount |
| order.failed | Order failed | status, error |
| order.refunded | Order refunded | status |

### Example: Get Webhook Stats
```bash
curl http://localhost:3000/api/webhooks/stats

# Response
{
  "total": 5,
  "delivered": 3,
  "failed": 1,
  "pending": 1
}
```

### Webhook Payload (order.completed)
```json
{
  "event": "order.completed",
  "orderId": "uuid-here",
  "productSku": "netflix-turkey-200",
  "productName": "Netflix Turkey 200 TRY Gift Card",
  "giftCardCode": "XXXX-XXXX-XXXX",
  "paidAmount": "12.64",
  "status": "COMPLETED",
  "timestamp": "2025-12-27T13:33:46.000Z"
}
```

### Retry Logic

1. Initial attempt - immediate
2. Retry 1 - after 1 minute
3. Retry 2 - after 5 minutes
4. Retry 3 - after 30 minutes
5. Marked as failed after 4 attempts

---

## Response Formats

### Success (Single Item)
```json
{
  "id": "uuid",
  "field": "value",
  "createdAt": "2025-12-27T..."
}
```

### Success (List with Pagination)
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### Error
```json
{
  "statusCode": 400,
  "message": "Description of the error",
  "error": "Bad Request"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

---

## Order Statuses

| Status | Description |
|--------|-------------|
| PENDING | Order created, awaiting processing |
| PROCESSING | Order being fulfilled |
| COMPLETED | Gift card delivered |
| FAILED | Fulfillment failed |
| REFUNDED | Order refunded |

---

*Last Updated: December 27, 2025*

