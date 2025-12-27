"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../database");
const crypto_1 = require("crypto");
let WalletsService = class WalletsService {
    async getWallet(userId) {
        const [user] = await database_1.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.id, userId))
            .limit(1);
        if (!user) {
            throw new common_1.NotFoundException(`User ${userId} not found`);
        }
        const [existingWallet] = await database_1.db
            .select()
            .from(database_1.wallets)
            .where((0, drizzle_orm_1.eq)(database_1.wallets.userId, userId))
            .limit(1);
        if (existingWallet) {
            return existingWallet;
        }
        return this.createWallet(userId);
    }
    async createWallet(userId) {
        const [user] = await database_1.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.id, userId))
            .limit(1);
        if (!user) {
            throw new common_1.NotFoundException(`User ${userId} not found`);
        }
        const [existing] = await database_1.db
            .select()
            .from(database_1.wallets)
            .where((0, drizzle_orm_1.eq)(database_1.wallets.userId, userId))
            .limit(1);
        if (existing) {
            throw new common_1.BadRequestException('Wallet already exists for this user');
        }
        const tonAddress = this.generateMockTonAddress();
        const [wallet] = await database_1.db
            .insert(database_1.wallets)
            .values({
            userId,
            tonAddress,
            tonMnemonic: null,
            usdtBalance: '0',
            lockedBalance: '0',
        })
            .returning();
        console.log(`💰 Wallet created for user ${userId}`);
        console.log(`   TON Address: ${tonAddress.substring(0, 10)}...`);
        return wallet;
    }
    async getBalance(userId) {
        const wallet = await this.getWallet(userId);
        const available = parseFloat(wallet.usdtBalance);
        const locked = parseFloat(wallet.lockedBalance);
        return {
            available,
            locked,
            total: available + locked,
        };
    }
    async hasBalance(userId, amount) {
        const balance = await this.getBalance(userId);
        return balance.available >= amount;
    }
    async addBalance(userId, amount, description, txHash) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
        const wallet = await this.getWallet(userId);
        const currentBalance = parseFloat(wallet.usdtBalance);
        const newBalance = currentBalance + amount;
        const [updatedWallet] = await database_1.db
            .update(database_1.wallets)
            .set({
            usdtBalance: newBalance.toString(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.wallets.userId, userId))
            .returning();
        await database_1.db.insert(database_1.transactions).values({
            userId,
            type: 'deposit',
            amount: amount.toString(),
            currency: 'USDT',
            status: 'COMPLETED',
            txHash: txHash || null,
            metadata: {
                description: description || 'Wallet deposit',
                walletId: wallet.id,
                previousBalance: currentBalance,
                newBalance: newBalance,
            },
        });
        console.log(`💰 Wallet deposit: +$${amount.toFixed(2)} for user ${userId}`);
        console.log(`   ${description || 'No description'}`);
        console.log(`   New balance: $${newBalance.toFixed(2)}`);
        return updatedWallet;
    }
    async deductBalance(userId, amount, description, orderId) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
        const wallet = await this.getWallet(userId);
        const currentBalance = parseFloat(wallet.usdtBalance);
        if (currentBalance < amount) {
            throw new common_1.BadRequestException(`Insufficient balance. Available: $${currentBalance.toFixed(2)}, Required: $${amount.toFixed(2)}`);
        }
        const newBalance = currentBalance - amount;
        const [updatedWallet] = await database_1.db
            .update(database_1.wallets)
            .set({
            usdtBalance: newBalance.toString(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.wallets.userId, userId))
            .returning();
        const transactionType = orderId ? 'order_payment' : 'withdrawal';
        await database_1.db.insert(database_1.transactions).values({
            userId,
            type: transactionType,
            amount: amount.toString(),
            currency: 'USDT',
            status: 'COMPLETED',
            txHash: null,
            metadata: {
                description: description || 'Wallet withdrawal',
                walletId: wallet.id,
                orderId: orderId || null,
                previousBalance: currentBalance,
                newBalance: newBalance,
            },
        });
        console.log(`💳 Wallet deduction: -$${amount.toFixed(2)} for user ${userId}`);
        console.log(`   ${description || 'No description'}`);
        console.log(`   New balance: $${newBalance.toFixed(2)}`);
        return updatedWallet;
    }
    async lockBalance(userId, amount) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be positive');
        }
        const wallet = await this.getWallet(userId);
        const currentBalance = parseFloat(wallet.usdtBalance);
        const currentLocked = parseFloat(wallet.lockedBalance);
        if (currentBalance < amount) {
            throw new common_1.BadRequestException('Insufficient balance to lock');
        }
        const [updatedWallet] = await database_1.db
            .update(database_1.wallets)
            .set({
            usdtBalance: (currentBalance - amount).toString(),
            lockedBalance: (currentLocked + amount).toString(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.wallets.userId, userId))
            .returning();
        console.log(`🔒 Balance locked: $${amount.toFixed(2)} for user ${userId}`);
        return updatedWallet;
    }
    async unlockBalance(userId, amount) {
        const wallet = await this.getWallet(userId);
        const currentBalance = parseFloat(wallet.usdtBalance);
        const currentLocked = parseFloat(wallet.lockedBalance);
        if (currentLocked < amount) {
            throw new common_1.BadRequestException('Insufficient locked balance');
        }
        const [updatedWallet] = await database_1.db
            .update(database_1.wallets)
            .set({
            usdtBalance: (currentBalance + amount).toString(),
            lockedBalance: (currentLocked - amount).toString(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.wallets.userId, userId))
            .returning();
        console.log(`🔓 Balance unlocked: $${amount.toFixed(2)} for user ${userId}`);
        return updatedWallet;
    }
    async releaseLocked(userId, amount) {
        const wallet = await this.getWallet(userId);
        const currentLocked = parseFloat(wallet.lockedBalance);
        if (currentLocked < amount) {
            throw new common_1.BadRequestException('Insufficient locked balance to release');
        }
        const [updatedWallet] = await database_1.db
            .update(database_1.wallets)
            .set({
            lockedBalance: (currentLocked - amount).toString(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.wallets.userId, userId))
            .returning();
        console.log(`✅ Locked balance released: $${amount.toFixed(2)} for user ${userId}`);
        return updatedWallet;
    }
    async findById(walletId) {
        const [wallet] = await database_1.db
            .select()
            .from(database_1.wallets)
            .where((0, drizzle_orm_1.eq)(database_1.wallets.id, walletId))
            .limit(1);
        if (!wallet) {
            throw new common_1.NotFoundException(`Wallet ${walletId} not found`);
        }
        return wallet;
    }
    async findAll(limit = 20, offset = 0) {
        return database_1.db
            .select()
            .from(database_1.wallets)
            .limit(limit)
            .offset(offset);
    }
    async getTransactions(userId, limit = 20, offset = 0) {
        const [user] = await database_1.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.id, userId))
            .limit(1);
        if (!user) {
            throw new common_1.NotFoundException(`User ${userId} not found`);
        }
        return database_1.db
            .select()
            .from(database_1.transactions)
            .where((0, drizzle_orm_1.eq)(database_1.transactions.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(database_1.transactions.createdAt))
            .limit(limit)
            .offset(offset);
    }
    generateMockTonAddress() {
        const bytes = (0, crypto_1.randomBytes)(32);
        const base64 = bytes.toString('base64').replace(/[+/=]/g, '');
        return `EQ${base64.substring(0, 46)}`;
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)()
], WalletsService);
//# sourceMappingURL=wallets.service.js.map