// src/integrations/bitrefill/bitrefill.service.ts
// Mock Bitrefill API integration
// TODO: Replace with real Bitrefill API calls in production

import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

export interface BitrefillProduct {
  sku: string;
  name: string;
  cost: number;
  faceValue: number;
  currency: string;
  region?: string;
}

export interface BitrefillOrderResponse {
  orderId: string;
  productSku: string;
  quantity: number;
  giftCardCode: string;
  status: string;
}

@Injectable()
export class BitrefillService {
  /**
   * Mock product catalog
   * TODO: Fetch from real Bitrefill API
   */
  private readonly mockProducts: Record<string, BitrefillProduct> = {
    'netflix-turkey-200': {
      sku: 'netflix-turkey-200',
      name: 'Netflix Turkey 200 TRY',
      cost: 8.50,
      faceValue: 200,
      currency: 'TRY',
      region: 'Turkey',
    },
    'spotify-turkey-50': {
      sku: 'spotify-turkey-50',
      name: 'Spotify Turkey 50 TRY',
      cost: 2.10,
      faceValue: 50,
      currency: 'TRY',
      region: 'Turkey',
    },
    'youtube-premium-turkey-100': {
      sku: 'youtube-premium-turkey-100',
      name: 'YouTube Premium Turkey 100 TRY',
      cost: 4.25,
      faceValue: 100,
      currency: 'TRY',
      region: 'Turkey',
    },
    'steam-turkey-500': {
      sku: 'steam-turkey-500',
      name: 'Steam Turkey 500 TRY',
      cost: 21.25,
      faceValue: 500,
      currency: 'TRY',
      region: 'Turkey',
    },
    'amazon-us-50': {
      sku: 'amazon-us-50',
      name: 'Amazon.com $50 USD',
      cost: 48.50,
      faceValue: 50,
      currency: 'USD',
      region: 'United States',
    },
  };

  /**
   * Get product details by SKU
   */
  async getProduct(sku: string): Promise<BitrefillProduct | null> {
    // Simulate API delay
    await this.delay(100);

    const product = this.mockProducts[sku];

    if (!product) {
      console.warn(`⚠️  Product not found: ${sku}, returning default`);
      return {
        sku,
        name: `Product ${sku}`,
        cost: 10.00,
        faceValue: 10,
        currency: 'USD',
      };
    }

    return product;
  }

  /**
   * Place order with Bitrefill
   * TODO: Replace with real API call
   */
  async placeOrder(
    sku: string,
    quantity: number = 1,
  ): Promise<BitrefillOrderResponse> {
    // Simulate API delay (500ms)
    await this.delay(500);

    const giftCardCode = this.generateMockCode();

    console.log(`📦 Bitrefill order placed: ${sku} x${quantity}`);
    console.log(`🎁 Gift card code generated: ${giftCardCode.substring(0, 4)}...`);

    return {
      orderId: `BF-${this.generateUUID()}`,
      productSku: sku,
      quantity,
      giftCardCode,
      status: 'COMPLETED',
    };
  }

  /**
   * Generate mock gift card code
   */
  private generateMockCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if ((i + 1) % 4 === 0 && i < 15) code += '-';
    }
    return code;
  }

  /**
   * Generate UUID for mock order ID
   */
  private generateUUID(): string {
    return randomBytes(16).toString('hex').match(/.{1,4}/g)?.join('-') || '';
  }

  /**
   * Simulate async delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get all available products (mock catalog)
   */
  async getAvailableProducts(): Promise<BitrefillProduct[]> {
    return Object.values(this.mockProducts);
  }
}

