// src/wallets/wallets.service.ts
// Wallets service - B2C user USDT balance management

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { db, wallets, users, transactions, type Wallet, type Transaction } from '../database';
import { randomBytes } from 'crypto';

@Injectable()
export class WalletsService {
  /**
   * Get wallet by user ID (auto-create if doesn't exist)
   */
  async getWallet(userId: string): Promise<Wallet> {
    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Try to find existing wallet
    const [existingWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    if (existingWallet) {
      return existingWallet;
    }

    // Auto-create wallet for user
    return this.createWallet(userId);
  }

  /**
   * Create wallet for user
   */
  async createWallet(userId: string): Promise<Wallet> {
    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Check if wallet already exists
    const [existing] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    if (existing) {
      throw new BadRequestException('Wallet already exists for this user');
    }

    // Generate mock TON address (in production, use real TON SDK)
    const tonAddress = this.generateMockTonAddress();

    // Create wallet
    const [wallet] = await db
      .insert(wallets)
      .values({
        userId,
        tonAddress,
        tonMnemonic: null, // Would be encrypted in production
        usdtBalance: '0',
        lockedBalance: '0',
      })
      .returning();

    console.log(`💰 Wallet created for user ${userId}`);
    console.log(`   TON Address: ${tonAddress.substring(0, 10)}...`);

    return wallet;
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string): Promise<{
    available: number;
    locked: number;
    total: number;
  }> {
    const wallet = await this.getWallet(userId);
    const available = parseFloat(wallet.usdtBalance);
    const locked = parseFloat(wallet.lockedBalance);

    return {
      available,
      locked,
      total: available + locked,
    };
  }

  /**
   * Check if user has sufficient balance
   */
  async hasBalance(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance.available >= amount;
  }

  /**
   * Add balance to wallet (deposit)
   */
  async addBalance(
    userId: string,
    amount: number,
    description?: string,
    txHash?: string,
  ): Promise<Wallet> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.getWallet(userId);
    const currentBalance = parseFloat(wallet.usdtBalance);
    const newBalance = currentBalance + amount;

    const [updatedWallet] = await db
      .update(wallets)
      .set({
        usdtBalance: newBalance.toString(),
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId))
      .returning();

    // Log transaction
    await db.insert(transactions).values({
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

  /**
   * Deduct balance from wallet (payment)
   */
  async deductBalance(
    userId: string,
    amount: number,
    description?: string,
    orderId?: string,
  ): Promise<Wallet> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.getWallet(userId);
    const currentBalance = parseFloat(wallet.usdtBalance);

    if (currentBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: $${currentBalance.toFixed(2)}, Required: $${amount.toFixed(2)}`,
      );
    }

    const newBalance = currentBalance - amount;

    const [updatedWallet] = await db
      .update(wallets)
      .set({
        usdtBalance: newBalance.toString(),
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId))
      .returning();

    // Log transaction
    const transactionType = orderId ? 'order_payment' : 'withdrawal';
    await db.insert(transactions).values({
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

  /**
   * Lock balance (for pending orders)
   */
  async lockBalance(userId: string, amount: number): Promise<Wallet> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.getWallet(userId);
    const currentBalance = parseFloat(wallet.usdtBalance);
    const currentLocked = parseFloat(wallet.lockedBalance);

    if (currentBalance < amount) {
      throw new BadRequestException('Insufficient balance to lock');
    }

    const [updatedWallet] = await db
      .update(wallets)
      .set({
        usdtBalance: (currentBalance - amount).toString(),
        lockedBalance: (currentLocked + amount).toString(),
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId))
      .returning();

    console.log(`🔒 Balance locked: $${amount.toFixed(2)} for user ${userId}`);

    return updatedWallet;
  }

  /**
   * Unlock balance (release from pending)
   */
  async unlockBalance(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getWallet(userId);
    const currentBalance = parseFloat(wallet.usdtBalance);
    const currentLocked = parseFloat(wallet.lockedBalance);

    if (currentLocked < amount) {
      throw new BadRequestException('Insufficient locked balance');
    }

    const [updatedWallet] = await db
      .update(wallets)
      .set({
        usdtBalance: (currentBalance + amount).toString(),
        lockedBalance: (currentLocked - amount).toString(),
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId))
      .returning();

    console.log(`🔓 Balance unlocked: $${amount.toFixed(2)} for user ${userId}`);

    return updatedWallet;
  }

  /**
   * Release locked balance (after successful order)
   */
  async releaseLocked(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getWallet(userId);
    const currentLocked = parseFloat(wallet.lockedBalance);

    if (currentLocked < amount) {
      throw new BadRequestException('Insufficient locked balance to release');
    }

    const [updatedWallet] = await db
      .update(wallets)
      .set({
        lockedBalance: (currentLocked - amount).toString(),
        updatedAt: new Date(),
      })
      .where(eq(wallets.userId, userId))
      .returning();

    console.log(`✅ Locked balance released: $${amount.toFixed(2)} for user ${userId}`);

    return updatedWallet;
  }

  /**
   * Find wallet by ID
   */
  async findById(walletId: string): Promise<Wallet> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.id, walletId))
      .limit(1);

    if (!wallet) {
      throw new NotFoundException(`Wallet ${walletId} not found`);
    }

    return wallet;
  }

  /**
   * Get all wallets (admin)
   */
  async findAll(limit: number = 20, offset: number = 0): Promise<Wallet[]> {
    return db
      .select()
      .from(wallets)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get user's transaction history
   */
  async getTransactions(userId: string, limit: number = 20, offset: number = 0): Promise<Transaction[]> {
    // Verify user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Generate mock TON address
   * TODO: Replace with real TON SDK in production
   */
  private generateMockTonAddress(): string {
    const bytes = randomBytes(32);
    const base64 = bytes.toString('base64').replace(/[+/=]/g, '');
    return `EQ${base64.substring(0, 46)}`;
  }
}

