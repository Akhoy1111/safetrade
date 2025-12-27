# SafeTrade Database Schema

**Version:** 2.1 (UUID Security Update)  
**Last Updated:** December 13, 2025

---

## Overview

SafeTrade uses PostgreSQL with Prisma ORM. The schema has been simplified to a **USDT-only architecture** - no Lightning Network, no BTC balances, no treasury rebalancing.

**Key Decisions:** 
- Bitrefill accepts USDT directly on TON, eliminating the need for Lightning infrastructure and swaps
- **UUIDs for all primary keys** - non-guessable, non-enumerable identifiers for security

---

## Schema Changes

### v2.0 Changes (December 13, 2025)

**Removed:**
- ❌ `Wallet.btcBalance` - No BTC needed
- ❌ `Wallet.type` - Only TON wallets now
- ❌ `TreasuryRebalancing` table - No rebalancing needed
- ❌ `GiftCardPurchase.lightningInvoice` - Replaced with `paymentTxHash`

**Changed:**
- ✅ `Wallet` now has single `usdtBalance` only
- ✅ `Wallet` unique constraint changed from `(userId, type)` to `(userId)` - one wallet per user
- ✅ `GiftCardPurchase.paymentTxHash` tracks USDT-TON payments directly to Bitrefill

### v2.1 Changes (December 13, 2025)

**Security Enhancement:**
- ✅ **All primary keys use UUIDs** instead of serial IDs
- ✅ **All foreign keys reference UUIDs**
- ✅ Non-guessable, non-enumerable identifiers
- ✅ Protection against IDOR attacks and business intelligence leakage

---

## Core Tables

### User

Stores Telegram user information, KYC status, and referral data.

```prisma
model User {
  id              String   @id @default(uuid())
  telegramId      String   @unique
  username        String?
  firstName       String?
  lastName        String?
  kycLevel        Int      @default(1)  // 1=Anonymous, 2=Basic, 3=Full
  kycStatus       String?               // pending, approved, rejected
  referralCode    String   @unique      // 8-char unique code
  referredBy      String?               // User ID who referred them
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  wallets              Wallet[]
  transactions         Transaction[]
  p2pOrdersCreated     P2POrder[]
  p2pOrdersAccepted    P2POrder[]
  giftCardPurchases    GiftCardPurchase[]
}
```

**Key Fields:**
- `kycLevel`: 1 = Anonymous ($500/month limit), 2 = Basic ($5K/month), 3 = Full ($50K/month)
- `referralCode`: Unique 8-character code (e.g., `XJ8K9P2L`)
- `referredBy`: Links to referring user's ID

---

### Wallet

**SIMPLIFIED:** USDT balance only, no BTC, no type field.

```prisma
model Wallet {
  id              String   @id @default(uuid())
  userId          String
  address         String?               // TON blockchain address
  usdtBalance     Decimal  @default(0) @db.Decimal(18, 8)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@unique([userId])  // One wallet per user
}
```

**Changes from v1.0:**
- ❌ Removed: `btcBalance` (no BTC needed)
- ❌ Removed: `type` field (only TON wallets)
- ✅ Changed: Unique constraint from `(userId, type)` to `(userId)`

---

### Transaction

Audit trail for all money movements.

```prisma
model Transaction {
  id              String   @id @default(uuid())
  userId          String
  type            String   // DEPOSIT, WITHDRAWAL, GIFT_CARD, P2P_BUY, P2P_SELL
  amount          Decimal  @db.Decimal(18, 8)
  currency        String   // USDT (primary currency)
  status          String   @default("PENDING") // PENDING, COMPLETED, FAILED
  txHash          String?  // Blockchain transaction hash
  metadata        Json?    // Flexible field for extra info
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
  @@index([status])
}
```

**Note:** `SWAP` transaction type removed (no swaps needed).

---

### GiftCardPurchase

Tracks Bitrefill gift card orders with USDT-TON direct payments.

```prisma
model GiftCardPurchase {
  id              String   @id @default(uuid())
  userId          String
  merchant        String   // amazon-usa, netflix, uber, etc.
  productName     String?
  faceValue       Decimal  @db.Decimal(18, 2)
  paidAmount      Decimal  @db.Decimal(18, 8) // User paid in USDT
  currency        String   @default("USD")
  giftCardCode    String?
  giftCardPin     String?
  redemptionUrl   String?
  externalOrderId String?  // Bitrefill order ID
  paymentTxHash   String?  // USDT-TON transaction hash (direct payment)
  status          String   @default("PENDING") // PENDING, COMPLETED, FAILED
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
}
```

**Changes from v1.0:**
- ❌ Removed: `lightningInvoice` field
- ✅ Added: `paymentTxHash` - tracks USDT-TON payment directly to Bitrefill

---

### P2POrder

Marketplace for USDT/fiat trading (deferred to future phase).

```prisma
model P2POrder {
  id              String   @id @default(uuid())
  creatorId       String
  acceptorId      String?
  type            String   // BUY, SELL
  assetAmount     Decimal  @db.Decimal(18, 8)
  assetCurrency   String   // USDT (primary), BTC (future support)
  fiatAmount      Decimal  @db.Decimal(18, 2)
  fiatCurrency    String   // RUB, BRL, TRY, etc.
  rate            Decimal  @db.Decimal(18, 4)
  paymentMethod   String?
  paymentDetails  String?
  status          String   @default("OPEN")
  escrowTxHash    String?  // TON smart contract tx
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  completedAt     DateTime?
  
  creator         User     @relation("OrderCreator", fields: [creatorId], references: [id])
  acceptor        User?    @relation("OrderAcceptor", fields: [acceptorId], references: [id])
  
  @@index([status, createdAt])
  @@index([assetCurrency, fiatCurrency])
}
```

**Note:** P2P marketplace is deferred to a future phase. Schema is ready but not implemented.

---

## Removed Tables

### TreasuryRebalancing (REMOVED)

This table tracked daily USDT↔BTC swaps for rebalancing. **No longer needed** because:
- We pay Bitrefill directly with USDT-TON
- No swaps required
- No rebalancing needed

**Old Schema (v1.0):**
```prisma
model TreasuryRebalancing {
  id              String   @id @default(uuid())
  usdtBefore      Decimal  @db.Decimal(18, 8)
  btcBefore       Decimal  @db.Decimal(18, 8)
  usdtAfter       Decimal  @db.Decimal(18, 8)
  btcAfter        Decimal  @db.Decimal(18, 8)
  swapAmount      Decimal  @db.Decimal(18, 8)
  swapDirection   String   // USDT_TO_BTC, BTC_TO_USDT
  swapProvider    String   // FIXEDFLOAT, etc.
  swapId          String?
  executedAt      DateTime @default(now())
}
```

---

## Migration History

### Initial Schema (2025-12-11)
- Created all core tables
- Included Lightning/BTC support
- Used UUID primary keys from the start

### v2.0: Simplified Architecture (2025-12-13)
- **Migration:** `20251213120000_remove_lightning_btc_simplify`
- Removed `Wallet.btcBalance` and `Wallet.type`
- Removed `TreasuryRebalancing` table
- Renamed `GiftCardPurchase.lightningInvoice` → `paymentTxHash`
- Updated unique constraints

### v2.1: UUID Documentation (2025-12-13)
- **No migration needed** - UUIDs were used from the start
- Documented UUID security rationale
- Updated all documentation to emphasize UUID benefits
- Added security guidelines for UUID usage

---

## Database Operations

### View Schema
```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Create Migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Apply Migrations
```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

### Reset Database (⚠️ WARNING: Deletes all data)
```bash
npx prisma migrate reset
```

---

## Data Types

### Decimal Precision

All monetary values use `DECIMAL(18, 8)`:
- **18 total digits**
- **8 decimal places**
- Prevents floating-point errors
- Supports very large amounts

**Examples:**
- `1234567890.12345678` ✅
- `0.00000001` ✅ (1 satoshi equivalent)
- `999999999999.99999999` ✅

### UUID Identifiers (v2.1 Security Update)

All primary keys use `String` with `@default(uuid())`:
- **UUID v4 format**: `a3bb189e-8bf9-3888-9912-ace4e6543002`
- **Globally unique**: 2^128 possible values (340 undecillion combinations)
- **Non-sequential**: Cannot be guessed or enumerated
- **Security benefits**:
  - Prevents enumeration attacks (can't iterate through IDs)
  - Prevents IDOR vulnerabilities (can't guess valid IDs)
  - Protects business intelligence (competitors can't estimate volumes)
  - Industry standard for financial systems (Stripe, PayPal, banks)

**Why UUIDs instead of Serial IDs?**

Serial IDs expose sensitive information:
```typescript
// ❌ BAD: Serial IDs leak business data
User ID: 45,892  → "They have ~45K users"
Order ID: 1,523  → "Only 1,523 orders processed"

// ✅ GOOD: UUIDs protect privacy
User ID: "a3bb189e-8bf9-3888-9912-ace4e6543002"
Order ID: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

See [ARCHITECTURE-Decision.md](ARCHITECTURE-Decision.md#uuid-implementation-decision) for detailed rationale.

---

## Indexes

### Performance Indexes

```sql
-- User lookups
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- Wallet
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- Transaction queries
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- P2P Orders
CREATE INDEX "P2POrder_status_createdAt_idx" ON "P2POrder"("status", "createdAt");
CREATE INDEX "P2POrder_assetCurrency_fiatCurrency_idx" ON "P2POrder"("assetCurrency", "fiatCurrency");

-- Gift Cards
CREATE INDEX "GiftCardPurchase_userId_createdAt_idx" ON "GiftCardPurchase"("userId", "createdAt");
```

---

## Relationships

### User → Wallet
- **One-to-One**: Each user has exactly one wallet
- **Foreign Key**: `Wallet.userId` → `User.id`

### User → Transactions
- **One-to-Many**: User can have many transactions
- **Foreign Key**: `Transaction.userId` → `User.id`

### User → GiftCardPurchases
- **One-to-Many**: User can have many gift card purchases
- **Foreign Key**: `GiftCardPurchase.userId` → `User.id`

### User → P2POrders
- **One-to-Many**: User can create/accept many P2P orders
- **Foreign Keys**: `P2POrder.creatorId` and `P2POrder.acceptorId` → `User.id`

---

## Best Practices

### 1. Always Use Transactions

```typescript
// ✅ GOOD - Atomic operations
await prisma.$transaction(async (tx) => {
  await tx.wallet.update({ /* deduct */ });
  await tx.transaction.create({ /* log */ });
});

// ❌ BAD - Race conditions possible
await prisma.wallet.update({ /* deduct */ });
await prisma.transaction.create({ /* log */ });
```

### 2. Use Decimal for Money

```typescript
// ✅ GOOD
import { Decimal } from '@prisma/client/runtime/library';
const amount = new Decimal('50.00');

// ❌ BAD - Floating point errors
const amount = 50.00;
```

### 3. Index Foreign Keys

All foreign key relationships are automatically indexed by Prisma.

---

## Questions?

See [ARCHITECTURE.md](ARCHITECTURE.md) for system design or [ADRs](adr/) for specific decisions.

