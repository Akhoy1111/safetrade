# SafeTrade Backend

> **Dual-chain crypto spending platform for emerging markets**

[![License](https://img.shields.io/badge/license-BSP-blue.svg)](LICENSE)
[![NestJS](https://img.shields.io/badge/nestjs-10.0-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/prisma-5.0-green.svg)](https://prisma.io/)

## 🎯 Overview

SafeTrade enables users in emerging markets (Russia, CIS, Brazil, Turkey, MENA) to deposit crypto and spend globally through integrated rails:

- **Gift Cards** - 5,000+ brands via Bitrefill (Phase 1) - Pay directly with USDT-TON
- **Crypto Cards** - Visa/Mastercard via FluxGateTech (Phase 2)
- **P2P Marketplace** - USDT/fiat trading (Future)

### The Problem We Solve
- 🚫 Payment sanctions (Russia post-2022)
- 💰 High inflation & capital controls
- 🔒 Financial exclusion in emerging markets
- 💳 No access to international payment cards

### Our Solution
Users deposit familiar USDT on TON blockchain → Spend globally via Bitrefill (direct USDT-TON payments, no swaps needed).

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Framework: NestJS (Node.js + TypeScript)
- Database: PostgreSQL 15
  - **Secure UUID-based identifiers** (non-guessable, non-enumerable)
- ORM: Prisma 5
- Cache: Redis
- Queue: BullMQ

**Blockchain:**
- Deposits: TON blockchain (USDT-TON)
- Payments: Direct USDT-TON to Bitrefill

**APIs:**
- Gift Cards: Bitrefill (USDT-TON payments)
- Cards: Paywings / NymCard (Phase 2)

### Project Structure
```
backend/
├── src/
│   ├── users/              # User management, Telegram auth, KYC
│   ├── wallets/            # TON wallet operations (USDT only)
│   ├── treasury/           # Hot wallet management (USDT only)
│   ├── gift-cards/         # Bitrefill integration (USDT-TON direct)
│   ├── p2p/                # Marketplace for USDT/fiat trading (future)
│   ├── compliance/         # KYC, AML, sanctions screening
│   └── prisma/             # Database client (global module)
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Migration history
├── docs/                   # Architecture documentation
└── docker-compose.yml      # PostgreSQL + Redis
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker Desktop** ([Download](https://docker.com/))
- **Git** ([Download](https://git-scm.com/))

### Installation
```bash
# 1. Clone repository
git clone https://github.com/safetrade/backend.git
cd backend

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Start database (PostgreSQL + Redis)
docker-compose up -d

# 5. Run database migrations
npx prisma migrate dev

# 6. Generate Prisma Client
npx prisma generate

# 7. Start development server
npm run start:dev
```

**Server starts at:** `http://localhost:3000`

---

## 📡 API Endpoints

### Users Module

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/users` | Create user (Telegram registration) | None |
| GET | `/users` | List users (paginated) | Admin |
| GET | `/users/:id` | Get user by ID | User/Admin |
| GET | `/users/telegram/:telegramId` | Find by Telegram ID | Internal |
| PATCH | `/users/:id` | Update user (KYC) | User/Admin |
| DELETE | `/users/:id` | Delete user | Admin |

**Example Request:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": "123456789",
    "username": "john_doe",
    "firstName": "John"
  }'
```

**Example Response:**
```json
{
  "id": "cm4qw8x7y0000...",
  "telegramId": "123456789",
  "username": "john_doe",
  "firstName": "John",
  "lastName": null,
  "kycLevel": 1,
  "referralCode": "XJ8K9P2L",
  "createdAt": "2025-12-12T10:30:00.000Z"
}
```

**📚 Full API Documentation:** `http://localhost:3000/api-docs` (Swagger UI)

---

## 💼 Business Logic

### KYC Levels

| Level | Name | Requirements | Limits | Features |
|-------|------|--------------|--------|----------|
| 1 | Anonymous | Telegram only | $500/month | Gift cards only |
| 2 | Basic | Email + Phone | $5,000/month | Gift cards |
| 3 | Full | ID + Address | $50,000/month | All features + Cards |

### Referral System

- Each user gets unique 8-character code (e.g., `XJ8K9P2L`)
- Format: Uppercase alphanumeric, no confusing chars (O, 0, I, 1)
- Referrer earns: 10% of referee's first purchase
- Tracked via `User.referredBy` field

### Treasury Management

**Simplified Single-Pool Architecture:**
- **Hot Wallet:** USDT-TON for Bitrefill payments
- **Cold Storage:** Majority of funds in offline wallets
- **No Rebalancing Needed:** Pay Bitrefill directly with USDT-TON

**Benefits:**
- No swap fees (0.5-1% saved per transaction)
- No Lightning infrastructure required
- Simpler operations and codebase
- Faster payments (direct TON transactions)

**Security:**
- **UUID-based identifiers:** Non-guessable IDs prevent enumeration attacks
- Hot wallet limit: $50,000 maximum
- Rest stored in cold wallets (manual access)
- Multi-sig for transfers >$10,000

---

## 🗄️ Database

### Schema Overview

**Core Tables:**
- `User` - Telegram users, KYC, referrals
- `Wallet` - USDT balances per user (BTC removed)
- `Transaction` - All money movements (audit trail)
- `P2POrder` - Marketplace buy/sell orders (future)
- `GiftCardPurchase` - Bitrefill orders (USDT-TON payments)

**View Database:**
```bash
npx prisma studio
# Opens at http://localhost:5555
```

**Create Migration:**
```bash
npx prisma migrate dev --name your_migration_name
```

**Reset Database (WARNING: Deletes all data):**
```bash
npx prisma migrate reset
```

---

## 🧪 Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Building for Production
```bash
npm run build
```

### Linting & Formatting
```bash
# Lint code
npm run lint

# Format code
npm run format
```

---

## 🚢 Deployment

### Docker Production Build
```bash
# Build image
docker build -t safetrade-backend .

# Run container
docker run -p 3000:3000 --env-file .env safetrade-backend
```

### Environment Variables

See `.env.example` for all required variables.

**Critical Variables:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/safetrade"
REDIS_URL="redis://localhost:6379"
TON_API_KEY="your_ton_api_key"
BITREFILL_API_KEY="your_bitrefill_key"
```

---

## 📅 Roadmap

### Phase 1 - Gift Cards MVP (Months 1-6) 🔄 IN PROGRESS

- [x] Users Module (Telegram auth, KYC, referrals)
- [ ] Wallets Module (TON deposits, USDT only)
- [ ] Treasury Module (hot wallet management)
- [ ] Gift Cards Module (Bitrefill integration, USDT-TON direct)
- [ ] P2P Marketplace (USDT trading - deferred)
- [ ] Compliance Module (KYC, AML, sanctions)

**Target:** 2,000 users, $300K monthly volume

### Phase 2 - Crypto Cards (Months 6-12)

- [ ] Card issuer integration (Paywings or NymCard)
- [ ] FluxGateTech FZCO activation
- [ ] EMI banking setup (Bankera or Xapo)
- [ ] Card top-up flows
- [ ] Card management UI

**Target:** 7,500 users, $1M monthly volume

### Phase 3 - Scale (Year 2+)

- [ ] Geographic expansion (more countries)
- [ ] Mobile apps (iOS, Android)
- [ ] Additional blockchains (Solana, Polygon)
- [ ] B2B partnerships
- [ ] API for developers

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

**Quick Rules:**
- Write tests for new features
- Follow NestJS best practices
- Document complex business logic
- Use conventional commits

---

## 📖 Documentation

- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Database:** [docs/DATABASE.md](docs/DATABASE.md)
- **ADRs:** [docs/adr/](docs/adr/)
- **API Docs:** http://localhost:3000/api-docs (when running)

---

## 📜 License

Licensed under El Salvador BSP (Bitcoin Service Provider) license.

**Legal Entities:**
- SafeTrade SRL (El Salvador) - BSP License Active
- FluxGateTech FZCO (UAE) - PSP Tech License Active

---

## 👥 Team

**Founder & Developer:** [Your Name]

**Built with:** ❤️ and ☕ in Abu Dhabi

---

## 📞 Support

- **Telegram:** @safetrade_support
- **Email:** support@safetrade.io
- **Issues:** GitHub Issues

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Backend framework
- [Prisma](https://prisma.io/) - Database ORM
- [Bitrefill](https://bitrefill.com/) - Gift card provider (USDT-TON payments)
- [TON](https://ton.org/) - Blockchain infrastructure

---

**Built for financial freedom in emerging markets.** 🌍