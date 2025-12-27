# Contributing to SafeTrade Backend

Thank you for contributing! This document outlines our development standards.

---

## 🎯 Development Philosophy

1. **Business Logic First** - Code should reflect Master Plan strategy
2. **Security First** - Financial operations require extra care
3. **User Experience First** - Simplicity over complexity
4. **Documentation First** - Code without docs doesn't exist

---

## 🛠️ Development Setup

See [README.md](README.md#getting-started) for initial setup.

### Branch Strategy
```
main        # Production (protected)
develop     # Integration branch
feature/*   # New features
fix/*       # Bug fixes
hotfix/*    # Urgent production fixes
```

### Workflow
```bash
# 1. Create feature branch
git checkout -b feature/wallets-module

# 2. Make changes
# ... code ...

# 3. Commit with conventional commits
git commit -m "feat(wallets): add TON deposit monitoring"

# 4. Push and create PR
git push origin feature/wallets-module
```

---

## 📝 Coding Standards

### TypeScript Style
```typescript
// ✅ GOOD - Descriptive names
async createUserWithReferral(dto: CreateUserDto): Promise<User> {
  // ...
}

// ❌ BAD - Unclear names
async create(d: any): Promise<any> {
  // ...
}
```

### File Naming
```
✅ user.entity.ts
✅ create-user.dto.ts
✅ users.service.ts
✅ users.controller.ts

❌ User.ts
❌ CreateUser.ts
❌ userService.ts
```

### Module Structure
```
src/module-name/
├── dto/
│   ├── create-module.dto.ts
│   └── update-module.dto.ts
├── entities/
│   └── module.entity.ts
├── module.controller.ts
├── module.service.ts
└── module.module.ts
```

---

## 🧪 Testing Requirements

### Unit Tests

**Required for:**
- Business logic (services)
- Financial calculations
- Validation logic

**Example:**
```typescript
describe('UsersService', () => {
  describe('generateReferralCode', () => {
    it('should generate 8-character code', () => {
      const code = service['generateReferralCode']();
      expect(code).toHaveLength(8);
    });

    it('should not contain confusing characters', () => {
      const code = service['generateReferralCode']();
      expect(code).not.toMatch(/[01OI]/);
    });
  });
});
```

### Integration Tests

**Required for:**
- API endpoints
- Database operations
- External API integrations

---

## 📚 Documentation Standards

### Code Comments
```typescript
/**
 * Creates a new user with Telegram authentication
 * 
 * Business Rules:
 * - Telegram ID must be unique
 * - Generates unique 8-char referral code
 * - Links to referrer if code provided
 * - Default KYC level: 1 (Anonymous)
 * 
 * @param createUserDto - User registration data from Telegram
 * @returns Created user with referral code
 * @throws ConflictException if Telegram ID already exists
 */
async create(createUserDto: CreateUserDto): Promise<User> {
  // Implementation
}
```

### Complex Logic
```typescript
// Monitor hot wallet balance
// Business Rule: Maintain minimum USDT balance for Bitrefill payments
// Why: Pay Bitrefill directly with USDT-TON, no swaps needed
const minBalance = new Decimal('10000');  // $10K minimum
const currentBalance = await this.getHotWalletBalance();
if (currentBalance.lessThan(minBalance)) {
  await this.topUpFromColdStorage();
}
```

---

## 🔒 Security Guidelines

### UUID Usage (v2.1)

**Always use UUIDs for identifiers:**
```typescript
// ✅ GOOD - UUID primary keys
model User {
  id String @id @default(uuid())
  // ...
}

// ❌ BAD - Serial IDs (security risk)
model User {
  id Int @id @default(autoincrement())
  // Exposes business metrics, enables enumeration attacks
}
```

**Never expose sequential counters:**
```typescript
// ❌ BAD - Leaks order count
const orderId = await this.getNextOrderId(); // Returns 1, 2, 3...

// ✅ GOOD - Use UUID
const orderId = uuid(); // Returns "a3bb189e-8bf9-3888-9912-ace4e6543002"
```

**Use display-friendly IDs when needed:**
```typescript
// ✅ GOOD - UUID internally, friendly external reference
{
  id: "a3bb189e-8bf9-3888-9912-ace4e6543002",  // Internal UUID
  orderNumber: "ORD-2024-001234"                // Display reference
}
```

**Why UUIDs?**
- Non-guessable: Prevents enumeration attacks
- Non-sequential: Protects business intelligence
- Distributed: Can generate without coordination
- Standard: Used by Stripe, PayPal, all major financial platforms

See [ARCHITECTURE-Decision.md](docs/ARCHITECTURE-Decision.md#uuid-implementation-decision) for detailed rationale.

### Financial Operations
```typescript
// ✅ GOOD - Database transaction
async transferFunds(from: string, to: string, amount: number) {
  return this.prisma.$transaction(async (tx) => {
    // Deduct from sender
    await tx.wallet.update({
      where: { userId: from },
      data: { usdtBalance: { decrement: amount } }
    });
    
    // Add to receiver
    await tx.wallet.update({
      where: { userId: to },
      data: { usdtBalance: { increment: amount } }
    });
    
    // Log transaction
    await tx.transaction.create({ /* ... */ });
  });
}

// ❌ BAD - No transaction (race conditions)
async transferFunds(from: string, to: string, amount: number) {
  await this.walletService.deduct(from, amount);
  await this.walletService.add(to, amount);
}
```

### Input Validation
```typescript
// ✅ GOOD - DTO validation with UUID check
export class UpdateUserDto {
  @IsUUID(4)
  id: string;
  
  @IsString()
  @IsOptional()
  @Length(1, 100)
  username?: string;
}

// ✅ GOOD - Basic validation
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  telegramId: string;
}

// ❌ BAD - No validation
export class CreateUserDto {
  telegramId: any;
}
```

### Sensitive Data
```typescript
// ✅ GOOD - Validate UUID and exclude sensitive fields
async findOne(id: string) {
  // Validate UUID format to prevent injection
  if (!isUUID(id)) {
    throw new BadRequestException('Invalid user ID format');
  }
  
  return this.prisma.user.findUnique({
    where: { id },
    select: {
      id: true,        // UUID - safe to expose
      username: true,
      // Do NOT return: kycDocuments, apiKeys, wallet addresses, etc.
    }
  });
}

// ✅ GOOD - UUID validation decorator
export class GetUserDto {
  @IsUUID(4)
  id: string;
}
```

---

## 🚀 Commit Messages

Follow [Conventional Commits](https://conventionalcommits.org/):
```
feat(users): add referral code generation
fix(wallets): correct TON balance calculation
docs(readme): update installation steps
refactor(treasury): simplify hot wallet management
test(p2p): add marketplace order tests
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

---

## 📋 Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally

## Related Issues
Fixes #123
```

---

## 🐛 Bug Reports

Use GitHub Issues with this template:
```markdown
**Describe the bug**
Clear description of what's wrong

**To Reproduce**
1. Step 1
2. Step 2
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. macOS]
- Node: [e.g. 18.0.0]
- Database: [e.g. PostgreSQL 15]

**Additional context**
Any other details
```

---

## ⚡ Performance Guidelines

### Database Queries
```typescript
// ✅ GOOD - Select only needed fields
await this.prisma.user.findMany({
  select: { id: true, username: true },
  take: 20
});

// ❌ BAD - Returns everything
await this.prisma.user.findMany();
```

### Caching
```typescript
// ✅ GOOD - Cache expensive operations
@Cacheable('user', 300)  // 5 minutes
async findOne(id: string) {
  return this.prisma.user.findUnique({ where: { id } });
}
```

---

## 📞 Getting Help

- **Slack:** #dev-backend
- **Email:** dev@safetrade.io
- **Office Hours:** Mon-Fri 9AM-5PM GST

---

## 🙏 Thank You!

Every contribution makes SafeTrade better for millions of users in emerging markets.