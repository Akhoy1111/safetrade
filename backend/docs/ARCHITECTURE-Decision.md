# SafeTrade Architecture Documentation

**Version:** 2.0 (Simplified Architecture)  
**Last Updated:** December 13, 2025  
**Status:** Phase 1 - Development

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Scalability Strategy](#scalability-strategy)
7. [Technology Decisions](#technology-decisions)

---

## System Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    USER LAYER                           │
│         (Telegram Mini App - React + TON Connect)       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY                           │
│              (NestJS REST API + Guards)                 │
└─────────────────────────────────────────────────────────┘
                            ↓
┌──────────────┬──────────────┬──────────────┬────────────┐
│    Users     │   Wallets    │   Treasury   │ Gift Cards │
│    Module    │   Module     │   Module     │   Module   │
└──────────────┴──────────────┴──────────────┴────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  DATA LAYER                             │
│     PostgreSQL + Prisma ORM + Redis Cache               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌──────────────┬──────────────────────────────────────────┐
│ TON Blockchain│  External APIs                          │
│ (USDT Deposits)│  (Bitrefill - USDT-TON payments)      │
└──────────────┴──────────────────────────────────────────┘
```

### Key Design Principle: "Simplified USDT-Only Architecture"

**User Perspective:**
- Deposit USDT-TON (familiar stablecoin)
- See balance in USDT
- Buy gift cards with one click

**Backend Reality:**
- Single USDT pool (no dual pools needed!)
- Pay Bitrefill directly with USDT-TON
- No swaps, no rebalancing, no Lightning complexity
- Simpler, faster, cheaper operations

**Why:** Bitrefill accepts USDT directly on TON, eliminating the need for Lightning Network, BTC balances, and swap services. This significantly simplifies our architecture while maintaining all functionality.

---

## Architecture Principles

### 1. Separation of Concerns

Each module has **one responsibility**:
```
Users Module      → Authentication, profiles, KYC
Wallets Module    → TON deposits/withdrawals (USDT only)
Treasury Module   → Hot wallet management (USDT only)
Gift Cards Module → Spending via Bitrefill (USDT-TON direct)
P2P Module        → Marketplace for USDT/fiat (future)
Compliance Module → KYC, AML, sanctions
```

**Benefit:** Easy to test, debug, and scale independently.

### 2. Database as Source of Truth

**NOT using blockchain tokens for balances:**
```typescript
// ❌ BAD - Token issuance (regulatory nightmare)
await tonContract.mint(user.address, amount);

// ✅ GOOD - Database ledger (simple, compliant)
await prisma.wallet.update({
  where: { userId },
  data: { usdtBalance: { increment: amount } }
});
```

**Why:**
- Faster (no blockchain confirmation delays)
- Cheaper (no gas fees)
- Simpler compliance (BSP license, not token issuer)
- Easier to audit (SQL queries, not blockchain explorers)

### 3. Fail-Safe Financial Operations

**Every money movement uses database transactions:**
```typescript
// All or nothing - no partial transfers
await prisma.$transaction(async (tx) => {
  await tx.wallet.update({ /* deduct from sender */ });
  await tx.wallet.update({ /* add to receiver */ });
  await tx.transaction.create({ /* log movement */ });
});
```

**Why:** Prevents race conditions, ensures data integrity.

### 4. Security in Layers
```
Layer 1: Input Validation (DTOs + class-validator)
Layer 2: Authentication (JWT + Telegram auth)
Layer 3: Authorization (Guards + role checks)
Layer 4: Rate Limiting (prevent abuse)
Layer 5: Audit Logging (every action tracked)
```

---

## Component Architecture

### Users Module

**Responsibilities:**
- Telegram authentication (no passwords!)
- User profiles
- KYC level management (Anonymous → Basic → Full)
- Referral system

**Key Files:**
```
users/
├── dto/
│   ├── create-user.dto.ts      # Validation for registration
│   └── update-user.dto.ts      # Validation for updates
├── entities/
│   └── user.entity.ts          # User model wrapper
├── users.controller.ts         # HTTP endpoints
├── users.service.ts            # Business logic
└── users.module.ts             # Module definition
```

**Critical Business Logic:**
```typescript
// Referral code generation
// Format: 8 chars, uppercase, no confusing characters (0,O,I,1)
generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  // ... generates unique code
}
```

### Wallets Module (Phase 1)

**Responsibilities:**
- Generate TON deposit addresses
- Monitor TON blockchain for USDT deposits
- Track USDT balances only (no BTC needed)

**Architecture:**
```
┌──────────────────────┐
│   Wallets Module     │
├──────────────────────┤
│ • TON Wallet Service │ → TonWeb library
│ • Balance Tracker    │ → Database updates
└──────────────────────┘
```

**Deposit Flow:**
```
1. User requests deposit address
2. Generate unique TON address
3. User sends USDT-TON to address
4. Blockchain monitor detects deposit
5. Update database USDT balance
6. Notify user (WebSocket/Telegram)
```

### Treasury Module (Phase 1)

**Responsibilities:**
- Maintain USDT hot wallet for Bitrefill payments
- Monitor hot wallet balance
- Top up from cold storage when needed
- Track payment transactions

**Why Single USDT Pool?**
```
Simplified Approach (Current):
User buys $50 gift card
→ Pay Bitrefill directly with USDT-TON
→ Instant payment, no swaps needed
→ No Lightning infrastructure required
→ Lower fees, simpler operations

Benefits:
✅ No swap fees (0.5-1% saved per transaction)
✅ No rebalancing complexity
✅ No Lightning node management
✅ Faster payments (direct TON transaction)
✅ Simpler codebase
```

**Hot Wallet Management:**
```typescript
// Monitor hot wallet balance
async checkHotWalletBalance() {
  const balance = await this.tonService.getBalance(hotWalletAddress);
  if (balance < MIN_BALANCE) {
    // Top up from cold storage
    await this.transferFromColdStorage(TOP_UP_AMOUNT);
  }
}
```

### Gift Cards Module (Phase 1)

**Responsibilities:**
- Fetch Bitrefill catalog
- Process gift card purchases
- Pay Bitrefill directly with USDT-TON
- Deliver codes to users
- Handle refunds/errors

**Purchase Flow:**
```
1. User selects "$50 Amazon"
2. Backend creates Bitrefill order
3. Pay Bitrefill directly with USDT-TON from hot wallet
4. Bitrefill delivers gift card code (5-30s)
5. Deduct $51 from user (2% markup)
6. Return code to user
```

---

## Data Flow

### User Registration Flow
```
┌─────────┐    1. Telegram Auth     ┌──────────────┐
│ Telegram│ ────────────────────────>│   Frontend   │
│   App   │                          │  (Mini App)  │
└─────────┘                          └──────────────┘
                                            │
                                            │ 2. POST /users
                                            │    {telegramId, username}
                                            ↓
                                     ┌──────────────┐
                                     │ Users Module │
                                     └──────────────┘
                                            │
                                            │ 3. Check if exists
                                            │ 4. Generate referral code
                                            │ 5. Link to referrer (if code provided)
                                            ↓
                                     ┌──────────────┐
                                     │  PostgreSQL  │
                                     │ INSERT User  │
                                     └──────────────┘
                                            │
                                            │ 6. Return user + code
                                            ↓
                                     ┌──────────────┐
                                     │   Frontend   │
                                     │ Show balance │
                                     └──────────────┘
```

### Gift Card Purchase Flow
```
User → Frontend → API → Gift Cards Module → Bitrefill
                  ↓
            Wallets Module (deduct user balance)
                  ↓
           Treasury Module (pay from hot wallet)
                  ↓
      USDT-TON Payment (direct to Bitrefill)
                  ↓
         Update Database
                  ↓
         Return Code to User
```

---

## Security Architecture

### Authentication Strategy

**Phase 1:** Telegram-based authentication
```typescript
// User proves ownership via Telegram
// No passwords to leak!
async validateTelegramAuth(initData: string): Promise<User> {
  const hash = this.computeTelegramHash(initData);
  if (hash !== expectedHash) throw new UnauthorizedException();
  
  const telegramId = this.extractTelegramId(initData);
  return this.usersService.findByTelegramId(telegramId);
}
```

**Phase 2:** JWT tokens for API auth
```typescript
// After Telegram auth, issue JWT
const token = this.jwtService.sign({
  userId: user.id,
  telegramId: user.telegramId,
  kycLevel: user.kycLevel
});
```

### Hot Wallet Security

**Limits:**
- Maximum $50,000 in hot wallets
- Daily withdrawal limit: $10,000
- Multi-sig required for >$10,000 single tx

**Cold Storage:**
- 90%+ of funds in offline wallets
- Manual process for cold → hot transfers
- Requires 2-of-3 key signatures

### Compliance Integration

**Sanctions Screening:**
```typescript
@Injectable()
export class ComplianceService {
  async screenUser(user: User): Promise<ScreeningResult> {
    // Check OFAC, EU, UN sanctions lists
    const result = await this.chainalysisClient.screen({
      telegramId: user.telegramId,
      // Never send: real name, ID docs (privacy!)
    });
    
    if (result.isBlocked) {
      await this.usersService.suspendAccount(user.id);
    }
    return result;
  }
}
```

---

## Scalability Strategy

### Vertical Scaling (Phase 1)

**Current:** Single VPS (Hetzner CPX31)
- 4 vCPU, 8GB RAM
- Handles 5,000-10,000 users
- Cost: ~$40/month

### Horizontal Scaling (Phase 2)

**When:** 25,000+ users, $5M+ monthly volume

**Architecture:**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  API Server  │  │  API Server  │  │  API Server  │
│  Instance 1  │  │  Instance 2  │  │  Instance 3  │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                  ┌────────────────┐
                  │  Load Balancer │
                  └────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │     Redis    │  │    Queue     │
│   Primary    │  │    Cluster   │  │   Workers    │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Database Optimization

**Phase 1:** Single PostgreSQL instance
**Phase 2:** Read replicas for heavy queries
**Phase 3:** Sharding by user_id (if >100M users)

### Caching Strategy
```typescript
// Cache expensive operations
@Cacheable('bitrefill-catalog', 3600)  // 1 hour
async getCatalog(): Promise<Product[]> {
  return this.bitrefillClient.fetchProducts();
}

// Invalidate on updates
@CacheEvict('user-balance')
async updateBalance(userId: string, amount: number) {
  // ...
}
```

---

## Technology Decisions

### Why NestJS?

**Pros:**
- ✅ Enterprise-grade architecture
- ✅ Built-in dependency injection
- ✅ Modular design (perfect for our phases)
- ✅ TypeScript native (type safety)
- ✅ Great for financial apps (testability)

**Cons:**
- ⚠️ Steeper learning curve than Express
- ⚠️ More boilerplate

**Decision:** Worth it for long-term maintainability.

### Why PostgreSQL?

**Pros:**
- ✅ ACID compliance (critical for finance)
- ✅ JSON support (flexible schemas)
- ✅ Proven at scale
- ✅ Great tooling (Prisma, pgAdmin)

**Cons:**
- ⚠️ More complex than MongoDB

**Decision:** Data integrity > developer convenience.

### Why Prisma ORM?

**Pros:**
- ✅ Type-safe queries
- ✅ Auto-generated client
- ✅ Great migration system
- ✅ Introspection (database → code)

**Cons:**
- ⚠️ Not as flexible as raw SQL

**Decision:** Developer productivity + safety.

### Why TON Blockchain?

**Pros:**
- ✅ Telegram integration (500M users)
- ✅ USDT widely held in Russia/CIS
- ✅ Fast & cheap transactions
- ✅ Growing ecosystem

**Cons:**
- ⚠️ Newer blockchain (less battle-tested)

**Decision:** Strategic - our users are already on Telegram.

### Why USDT-TON Direct Payments?

**Pros:**
- ✅ Bitrefill accepts USDT directly on TON
- ✅ No Lightning infrastructure needed
- ✅ No swap fees or delays
- ✅ Simpler architecture
- ✅ Lower operational costs

**Cons:**
- ⚠️ Limited to Bitrefill (but that's our primary use case)

**Decision:** Simplified architecture with direct USDT-TON payments eliminates Lightning complexity while maintaining all functionality.

---

## Future Architecture (Phase 3)

### Microservices Migration

**When:** 100,000+ users, multiple teams

**Current Monolith:**
```
safetrade-backend (all modules together)
```

**Future Microservices:**
```
├── auth-service       (Users, authentication)
├── wallet-service     (Deposits, withdrawals)
├── treasury-service   (Hot wallet management)
├── payment-service    (Gift cards, USDT-TON payments)
├── compliance-service (KYC, AML)
└── api-gateway        (Routes to services)
```

**Why Not Now:**
- Premature optimization kills startups
- Build monolith first, split later when pain is real
- 10,000 users ≠ need for microservices

---

## Monitoring & Observability

### Metrics to Track

**Business Metrics:**
- Total users
- Monthly active users
- Transaction volume (USD)
- Revenue per user
- KYC conversion rate

**Technical Metrics:**
- API response time (p50, p95, p99)
- Database query time
- Error rate (%)
- Hot wallet USDT balance
- Payment success rate

**Tools (Phase 2):**
- Sentry (error tracking)
- Datadog (metrics, APM)
- LogRocket (session replay)

---

## Disaster Recovery

### Backup Strategy

**Database:**
- Automated daily backups (7-day retention)
- Point-in-time recovery (1-hour granularity)
- Geo-replicated backups (different region)

**Hot Wallets:**
- Private keys in encrypted vault
- Multi-sig setup (2-of-3 keys required)
- Regular key rotation (quarterly)

**Recovery Time Objectives:**
- RTO (Recovery Time): 4 hours
- RPO (Recovery Point): 1 hour max data loss

---

---

## Architecture Changes (v2.0)

### What Changed?

**Removed:**
- ❌ Lightning Network integration
- ❌ BTC balance tracking
- ❌ Treasury rebalancing system
- ❌ FixedFloat swap integration
- ❌ Daily rebalancing cron jobs

**Why?**
Bitrefill accepts USDT directly on TON network, eliminating the need for:
- Lightning infrastructure (Breez SDK, node management)
- USDT↔BTC swaps (FixedFloat integration)
- Dual-pool treasury management
- Daily rebalancing jobs

**Result:**
- Simpler codebase (2-3 weeks of development saved)
- Lower fees (no swap fees per transaction)
- Faster payments (direct TON transactions)
- Reduced operational complexity

**Questions?** See [DATABASE.md](DATABASE.md) for schema details or [ADRs](adr/) for specific decisions.

---

## UUID Implementation Decision

### Context

SafeTrade is a financial platform handling sensitive user data, transactions, and partner integrations. Our identifier strategy has significant security implications.

### The Problem with Serial IDs

Traditional auto-incrementing serial IDs (1, 2, 3, 4...) create multiple security vulnerabilities:

**Information Leakage:**
```sql
-- Serial IDs expose business metrics
User ID: 45,892  → "They have ~45K users"
Order ID: 1,523  → "Only 1,523 orders processed"
Partner ID: 7    → "Only 7 partners onboarded"
```

**Security Vulnerabilities:**
- **Enumeration Attacks:** Attackers can iterate through IDs (try user_id=1, 2, 3...) to discover all resources
- **IDOR (Insecure Direct Object Reference):** Predictable IDs make it easier to access unauthorized resources
- **Competitive Intelligence:** Competitors can estimate transaction volumes, user growth rates
- **Partner/User Tracking:** External parties can track growth by periodically checking highest ID

### The UUID Solution

**Decision:** Use UUIDs (Universally Unique Identifiers) v4 for all primary keys.

**Implementation:**
```typescript
// Drizzle ORM schema with UUIDs
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),  // UUID v4
  // ...other fields
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),  // UUID v4
  userId: uuid('user_id').references(() => users.id),
  // ...other fields
});
```

### Security Benefits

**Non-Enumerable:**
- UUID space: 2^128 possible values (340 undecillion combinations)
- Impossible to guess or enumerate resources
- Example: `a3bb189e-8bf9-3888-9912-ace4e6543002`

**Non-Guessable:**
- Cryptographically random generation
- No patterns to exploit
- Each ID is effectively impossible to predict

**IDOR Attack Prevention:**
- Even if authorization is misconfigured, attackers cannot guess valid IDs
- Adds defense-in-depth security layer

**Business Intelligence Protection:**
- Competitors cannot estimate metrics from IDs
- Transaction volumes remain private
- User growth rates stay confidential

### Industry Standards

**Financial Systems Best Practice:**
- Stripe API: Uses UUIDs for all resources
- PayPal: Uses non-sequential identifiers
- Banks: Never expose sequential account numbers externally
- Payment processors: Industry standard for secure identifiers

**Regulatory Compliance:**
- PCI-DSS: Recommends non-sequential identifiers for cardholder data
- GDPR: UUIDs support data minimization principles
- SOC 2: Security controls benefit from non-guessable IDs

### Trade-offs & Considerations

**Advantages:**
- ✅ **Security:** Non-enumerable, non-guessable
- ✅ **Privacy:** Business metrics protected
- ✅ **Distributed:** Can generate IDs without coordination
- ✅ **Collision-free:** Effectively zero probability of duplicates
- ✅ **Industry standard:** Proven in financial systems

**Disadvantages:**
- ⚠️ **Storage:** 16 bytes vs 4-8 bytes for integers (marginal cost)
- ⚠️ **Indexing:** Slightly slower than integers (negligible at our scale)
- ⚠️ **Readability:** Less human-friendly than sequential numbers

**Mitigation:**
- Use indexed UUID columns (PostgreSQL handles this efficiently)
- Add human-friendly references where needed (e.g., order numbers: `ORD-2024-001234`)
- PostgreSQL `gen_random_uuid()` is cryptographically secure

### Migration from v2.0 to v2.1

**Schema Changes:**
```sql
-- Old (v2.0): Serial IDs
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id VARCHAR(50)
);

-- New (v2.1): UUIDs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id VARCHAR(50)
);
```

**API Impact:**
- All ID parameters now accept UUID strings
- Example: `GET /users/a3bb189e-8bf9-3888-9912-ace4e6543002`
- Partners must update integrations to handle UUID format

### Implementation Status

**v2.1 Implementation:**
- ✅ Database schema designed with UUIDs
- ✅ Drizzle ORM configured for UUID primary keys
- ✅ All foreign key references use UUIDs
- ✅ Documentation updated with UUID rationale
- 🔄 Migration scripts pending (Phase 1 development)

### References

- [OWASP: Insecure Direct Object References](https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control)
- [RFC 4122: UUID Specification](https://www.ietf.org/rfc/rfc4122.txt)
- [PostgreSQL UUID Type Documentation](https://www.postgresql.org/docs/current/datatype-uuid.html)
- SafeTrade Master Plan v2.1 (December 13, 2025)

**Decision Date:** December 13, 2025  
**Status:** Approved  
**Stakeholders:** Architecture team, Security team  
**Review Date:** After Phase 1 launch