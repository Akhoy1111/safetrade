// src/orders/pricing.service.ts
// Value-based pricing calculation service
// Prices based on user savings (45% off US retail) not cost markup

import { Injectable } from '@nestjs/common';

export interface PricingBreakdown {
  bitrefillCost: number;
  userPrice: number;
  partnerPrice: number;
  safetradeFee: number;
  safetradeMargin: number;
  userSavings: number;
  userSavingsPercent: number;
}

@Injectable()
export class PricingService {
  /**
   * Calculate value-based pricing
   * 
   * Example: Netflix Turkey 200 TRY
   * - Bitrefill cost: $8.50
   * - US retail: $22.99 (assuming Bitrefill is ~37% of retail)
   * - User price: $12.65 (45% savings = 55% of retail)
   * - Partner price: $11.39 (10% discount on user price)
   * - SafeTrade fee: $2.89 (our margin)
   * - User saves: $10.34 (45%)
   */
  calculatePrice(bitrefillCost: number, isPartner: boolean = false): PricingBreakdown {
    // Step 1: Reverse engineer US retail price
    // Bitrefill typically costs ~37% of US retail price
    const usRetailPrice = bitrefillCost / 0.37;

    // Step 2: User price (45% savings = 55% of retail)
    const userPrice = usRetailPrice * 0.55;

    // Step 3: Partner discount (10% off user price)
    const partnerPrice = isPartner ? userPrice * 0.90 : userPrice;

    // Step 4: Calculate our margin
    const safetradeFee = partnerPrice - bitrefillCost;
    const safetradeMargin = (safetradeFee / partnerPrice) * 100;

    // Step 5: User savings
    const userSavings = usRetailPrice - userPrice;
    const userSavingsPercent = 45;

    return {
      bitrefillCost: this.round(bitrefillCost, 2),
      userPrice: this.round(userPrice, 2),
      partnerPrice: this.round(partnerPrice, 2),
      safetradeFee: this.round(safetradeFee, 2),
      safetradeMargin: this.round(safetradeMargin, 1),
      userSavings: this.round(userSavings, 2),
      userSavingsPercent,
    };
  }

  /**
   * Get final price based on customer type
   */
  getFinalPrice(bitrefillCost: number, isPartner: boolean): number {
    const pricing = this.calculatePrice(bitrefillCost, isPartner);
    return isPartner ? pricing.partnerPrice : pricing.userPrice;
  }

  /**
   * Round to specified decimal places
   */
  private round(value: number, decimals: number): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}

