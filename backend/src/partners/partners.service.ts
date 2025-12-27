// src/partners/partners.service.ts
// Partners service - B2B partner management with prepaid credit system

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db, partners, type Partner } from '../database';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PartnersService {
  /**
   * Generate API key with format: sk_live_<uuid>
   */
  private generateApiKey(): string {
    const uuid = randomUUID();
    return `sk_live_${uuid}`;
  }

  /**
   * Create a new partner with API key
   */
  async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    // Generate unique API key
    const apiKey = this.generateApiKey();

    // Create partner
    const [newPartner] = await db
      .insert(partners)
      .values({
        name: createPartnerDto.name,
        apiKey,
        webhookUrl: createPartnerDto.webhookUrl || null,
        creditBalance: '0',
        isActive: true,
      })
      .returning();

    return newPartner;
  }

  /**
   * Find all partners
   */
  async findAll(): Promise<Partner[]> {
    return db.select().from(partners);
  }

  /**
   * Find partner by ID
   */
  async findOne(id: string): Promise<Partner> {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.id, id))
      .limit(1);

    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }

    return partner;
  }

  /**
   * Find partner by API key (for authentication)
   */
  async findByApiKey(apiKey: string): Promise<Partner> {
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.apiKey, apiKey))
      .limit(1);

    if (!partner) {
      throw new NotFoundException('Invalid API key');
    }

    if (!partner.isActive) {
      throw new BadRequestException('Partner account is inactive');
    }

    return partner;
  }

  /**
   * Update partner details
   */
  async update(id: string, updatePartnerDto: UpdatePartnerDto): Promise<Partner> {
    // Check if partner exists
    await this.findOne(id);

    const [updatedPartner] = await db
      .update(partners)
      .set({
        ...updatePartnerDto,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, id))
      .returning();

    return updatedPartner;
  }

  /**
   * Delete partner
   */
  async remove(id: string): Promise<Partner> {
    await this.findOne(id);

    const [deletedPartner] = await db
      .delete(partners)
      .where(eq(partners.id, id))
      .returning();

    return deletedPartner;
  }

  /**
   * Add credit to partner balance
   * Used when partner deposits USDT
   */
  async addCredit(
    id: string,
    amount: number,
    description?: string,
  ): Promise<{ partner: Partner; newBalance: string; lowBalanceWarning: boolean }> {
    const partner = await this.findOne(id);

    // Calculate new balance
    const currentBalance = parseFloat(partner.creditBalance);
    const newBalance = (currentBalance + amount).toFixed(6);

    // Update balance
    const [updatedPartner] = await db
      .update(partners)
      .set({
        creditBalance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, id))
      .returning();

    console.log(`✅ Partner ${partner.name}: Added $${amount} credit. New balance: $${newBalance}`);

    return {
      partner: updatedPartner,
      newBalance,
      lowBalanceWarning: false,
    };
  }

  /**
   * Deduct credit from partner balance
   * Used when partner creates an order
   * 
   * CRITICAL: Prevents negative balances
   */
  async deductCredit(
    id: string,
    amount: number,
    description?: string,
  ): Promise<{ partner: Partner; newBalance: string; lowBalanceWarning: boolean }> {
    const partner = await this.findOne(id);

    // Check if partner has sufficient balance
    const currentBalance = parseFloat(partner.creditBalance);
    
    if (currentBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Current: $${currentBalance.toFixed(2)}, Required: $${amount.toFixed(2)}`,
      );
    }

    // Calculate new balance
    const newBalance = (currentBalance - amount).toFixed(6);

    // Update balance
    const [updatedPartner] = await db
      .update(partners)
      .set({
        creditBalance: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, id))
      .returning();

    // Check if balance is low (default threshold: $1000)
    const minBalance = 1000;
    const lowBalanceWarning = parseFloat(newBalance) < minBalance;

    if (lowBalanceWarning) {
      console.warn(`⚠️  Partner ${partner.name}: Low balance! Current: $${newBalance}, Minimum: $${minBalance}`);
    }

    console.log(`💳 Partner ${partner.name}: Deducted $${amount}. New balance: $${newBalance}`);

    return {
      partner: updatedPartner,
      newBalance,
      lowBalanceWarning,
    };
  }

  /**
   * Check current balance
   */
  async checkBalance(id: string): Promise<{ balance: string; balanceFloat: number }> {
    const partner = await this.findOne(id);
    
    return {
      balance: partner.creditBalance,
      balanceFloat: parseFloat(partner.creditBalance),
    };
  }

  /**
   * Check if partner has sufficient balance
   */
  async hasBalance(id: string, requiredAmount: number): Promise<boolean> {
    const partner = await this.findOne(id);
    const currentBalance = parseFloat(partner.creditBalance);
    
    return currentBalance >= requiredAmount;
  }
}

