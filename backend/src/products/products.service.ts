// src/products/products.service.ts
// Products service - Catalog management and value-based pricing

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, or, ilike, sql, desc } from 'drizzle-orm';
import { db, productPricing, type ProductPricing } from '../database';
import { CreateProductDto, ProductCategory, ProductRegion } from './dto/create-product.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { ProductQueryDto } from './dto/product-query.dto';

export interface PricingCalculation {
  price: number;
  margin: number;
  marginPercent: number;
  userSavings: number;
  userSavingsPercent: number;
}

type PricingChannel = 'b2c' | 'b2b';

@Injectable()
export class ProductsService {
  /**
   * Find all products with filtering and pagination
   */
  async findAll(query: ProductQueryDto): Promise<{
    products: ProductPricing[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { category, region, search, page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    // Build filter conditions
    const conditions: any[] = [];

    if (category) {
      conditions.push(eq(productPricing.category, category));
    }

    if (region) {
      conditions.push(eq(productPricing.region, region));
    }

    if (search) {
      conditions.push(
        or(
          ilike(productPricing.productName, `%${search}%`),
          ilike(productPricing.productSku, `%${search}%`),
        ),
      );
    }

    // Default: only active products
    conditions.push(eq(productPricing.isActive, true));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Get products with pagination
    const products = await db
      .select()
      .from(productPricing)
      .where(where)
      .orderBy(desc(productPricing.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(productPricing)
      .where(where);

    const totalPages = Math.ceil(Number(count) / limit);

    return {
      products,
      total: Number(count),
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string): Promise<ProductPricing> {
    const [product] = await db
      .select()
      .from(productPricing)
      .where(eq(productPricing.productSku, sku))
      .limit(1);

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }

    return product;
  }

  /**
   * Get list of available categories
   */
  async getCategories(): Promise<{ category: string; count: number }[]> {
    const results = await db
      .select({
        category: productPricing.category,
        count: sql<number>`count(*)`,
      })
      .from(productPricing)
      .where(eq(productPricing.isActive, true))
      .groupBy(productPricing.category)
      .orderBy(sql`count(*) DESC`);

    return results.map((r) => ({
      category: r.category || 'uncategorized',
      count: Number(r.count),
    }));
  }

  /**
   * Calculate value-based pricing
   * 
   * Pricing strategy (from Master Plan v3.0):
   * - B2C: User saves 45% (pays 55% of US retail)
   * - B2B: Partner gets 50% of retail (more discount for volume)
   * - Floor: Minimum 10% margin over Bitrefill cost
   * 
   * Example: Netflix Turkey 200 TRY
   * - Bitrefill cost: $8.50
   * - US retail: $22.99
   * - B2C price: $12.64 (45% savings)
   * - B2B price: $11.50 (50% discount)
   * - SafeTrade margin: ~35% for B2C, ~26% for B2B
   */
  calculatePrice(
    bitrefillCost: number,
    usRetailPrice: number | null,
    channel: PricingChannel = 'b2c',
  ): PricingCalculation {
    // If no US retail price provided, estimate from cost
    // Assumption: Bitrefill costs ~37% of US retail
    const retailPrice = usRetailPrice || bitrefillCost / 0.37;

    // Calculate base prices
    const b2cPrice = retailPrice * 0.55; // User saves 45%
    const b2bPrice = retailPrice * 0.50; // Partner gets more discount

    const price = channel === 'b2c' ? b2cPrice : b2bPrice;

    // Apply minimum margin floor (10% over cost)
    const minimumPrice = bitrefillCost * 1.1;
    const finalPrice = Math.max(price, minimumPrice);

    // Calculate metrics
    const margin = finalPrice - bitrefillCost;
    const marginPercent = (margin / finalPrice) * 100;
    const userSavings = retailPrice - finalPrice;
    const userSavingsPercent = (userSavings / retailPrice) * 100;

    return {
      price: this.round(finalPrice, 2),
      margin: this.round(margin, 2),
      marginPercent: this.round(marginPercent, 1),
      userSavings: this.round(userSavings, 2),
      userSavingsPercent: this.round(userSavingsPercent, 1),
    };
  }

  /**
   * Create product in catalog
   */
  async createProduct(dto: CreateProductDto): Promise<ProductPricing> {
    // Check if SKU already exists
    const existing = await db
      .select()
      .from(productPricing)
      .where(eq(productPricing.productSku, dto.productSku))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException(`Product with SKU ${dto.productSku} already exists`);
    }

    // Calculate US retail price if not provided
    const usRetailPrice = dto.usRetailPrice || dto.bitrefillCost / 0.37;

    // Calculate B2C and B2B prices
    const b2cPricing = this.calculatePrice(dto.bitrefillCost, usRetailPrice, 'b2c');
    const b2bPricing = this.calculatePrice(dto.bitrefillCost, usRetailPrice, 'b2b');

    // Create product
    const [product] = await db
      .insert(productPricing)
      .values({
        productSku: dto.productSku,
        productName: dto.productName,
        category: dto.category || null,
        region: dto.region || null,
        bitrefillCost: dto.bitrefillCost.toString(),
        usRetailPrice: this.round(usRetailPrice, 2).toString(),
        b2cPrice: b2cPricing.price.toString(),
        b2bPrice: b2bPricing.price.toString(),
        marginPercent: b2cPricing.marginPercent.toString(),
        isActive: true,
        lastSynced: null,
      })
      .returning();

    console.log(`✅ Product created: ${product.productSku}`);
    console.log(`   B2C price: $${product.b2cPrice} (${b2cPricing.userSavingsPercent}% savings)`);
    console.log(`   B2B price: $${product.b2bPrice}`);
    console.log(`   Margin: ${product.marginPercent}%`);

    return product;
  }

  /**
   * Update product pricing
   */
  async updatePricing(sku: string, dto: UpdatePricingDto): Promise<ProductPricing> {
    // Get existing product
    const existing = await this.findBySku(sku);

    // Prepare update values
    const updates: Record<string, string | boolean> = {
      updatedAt: new Date().toISOString(),
    };

    // Update cost if provided
    if (dto.bitrefillCost !== undefined) {
      updates.bitrefillCost = dto.bitrefillCost.toString();
    }

    // Update retail price if provided
    if (dto.usRetailPrice !== undefined) {
      updates.usRetailPrice = dto.usRetailPrice.toString();
    }

    // Recalculate prices if cost or retail changed
    if (dto.bitrefillCost || dto.usRetailPrice) {
      const newCost = dto.bitrefillCost || parseFloat(existing.bitrefillCost);
      const newRetail = dto.usRetailPrice || parseFloat(existing.usRetailPrice || '0');

      const b2cPricing = this.calculatePrice(newCost, newRetail, 'b2c');
      const b2bPricing = this.calculatePrice(newCost, newRetail, 'b2b');

      updates.b2cPrice = b2cPricing.price.toString();
      updates.b2bPrice = b2bPricing.price.toString();
      updates.marginPercent = b2cPricing.marginPercent.toString();
    }

    // Manual price overrides (if provided)
    if (dto.b2cPrice !== undefined) {
      updates.b2cPrice = dto.b2cPrice.toString();
    }

    if (dto.b2bPrice !== undefined) {
      updates.b2bPrice = dto.b2bPrice.toString();
    }

    // Update active status
    if (dto.isActive !== undefined) {
      updates.isActive = dto.isActive;
    }

    // Execute update
    const [product] = await db
      .update(productPricing)
      .set(updates)
      .where(eq(productPricing.productSku, sku))
      .returning();

    console.log(`📝 Pricing updated for ${sku}`);
    console.log(`   B2C: $${product.b2cPrice}, B2B: $${product.b2bPrice}`);

    return product;
  }

  /**
   * Sync products from Bitrefill API
   * TODO: Implement real Bitrefill API integration
   */
  async syncFromBitrefill(): Promise<{ synced: number; message: string }> {
    console.log('🔄 Bitrefill sync triggered...');
    
    // Placeholder for future implementation
    // This will:
    // 1. Fetch catalog from Bitrefill API
    // 2. Update costs for existing products
    // 3. Add new products
    // 4. Mark discontinued products as inactive
    // 5. Update lastSynced timestamp

    return {
      synced: 0,
      message: 'Bitrefill sync not yet implemented. Waiting for API credentials.',
    };
  }

  /**
   * Round to specified decimal places
   */
  private round(value: number, decimals: number): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}

