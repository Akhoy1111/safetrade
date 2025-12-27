"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../database");
let ProductsService = class ProductsService {
    async findAll(query) {
        const { category, region, search, page = 1, limit = 20 } = query;
        const offset = (page - 1) * limit;
        const conditions = [];
        if (category) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.productPricing.category, category));
        }
        if (region) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.productPricing.region, region));
        }
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(database_1.productPricing.productName, `%${search}%`), (0, drizzle_orm_1.ilike)(database_1.productPricing.productSku, `%${search}%`)));
        }
        conditions.push((0, drizzle_orm_1.eq)(database_1.productPricing.isActive, true));
        const where = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const products = await database_1.db
            .select()
            .from(database_1.productPricing)
            .where(where)
            .orderBy((0, drizzle_orm_1.desc)(database_1.productPricing.createdAt))
            .limit(limit)
            .offset(offset);
        const [{ count }] = await database_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(database_1.productPricing)
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
    async findBySku(sku) {
        const [product] = await database_1.db
            .select()
            .from(database_1.productPricing)
            .where((0, drizzle_orm_1.eq)(database_1.productPricing.productSku, sku))
            .limit(1);
        if (!product) {
            throw new common_1.NotFoundException(`Product with SKU ${sku} not found`);
        }
        return product;
    }
    async getCategories() {
        const results = await database_1.db
            .select({
            category: database_1.productPricing.category,
            count: (0, drizzle_orm_1.sql) `count(*)`,
        })
            .from(database_1.productPricing)
            .where((0, drizzle_orm_1.eq)(database_1.productPricing.isActive, true))
            .groupBy(database_1.productPricing.category)
            .orderBy((0, drizzle_orm_1.sql) `count(*) DESC`);
        return results.map((r) => ({
            category: r.category || 'uncategorized',
            count: Number(r.count),
        }));
    }
    calculatePrice(bitrefillCost, usRetailPrice, channel = 'b2c') {
        const retailPrice = usRetailPrice || bitrefillCost / 0.37;
        const b2cPrice = retailPrice * 0.55;
        const b2bPrice = retailPrice * 0.50;
        const price = channel === 'b2c' ? b2cPrice : b2bPrice;
        const minimumPrice = bitrefillCost * 1.1;
        const finalPrice = Math.max(price, minimumPrice);
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
    async createProduct(dto) {
        const existing = await database_1.db
            .select()
            .from(database_1.productPricing)
            .where((0, drizzle_orm_1.eq)(database_1.productPricing.productSku, dto.productSku))
            .limit(1);
        if (existing.length > 0) {
            throw new common_1.BadRequestException(`Product with SKU ${dto.productSku} already exists`);
        }
        const usRetailPrice = dto.usRetailPrice || dto.bitrefillCost / 0.37;
        const b2cPricing = this.calculatePrice(dto.bitrefillCost, usRetailPrice, 'b2c');
        const b2bPricing = this.calculatePrice(dto.bitrefillCost, usRetailPrice, 'b2b');
        const [product] = await database_1.db
            .insert(database_1.productPricing)
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
    async updatePricing(sku, dto) {
        const existing = await this.findBySku(sku);
        const updates = {
            updatedAt: new Date().toISOString(),
        };
        if (dto.bitrefillCost !== undefined) {
            updates.bitrefillCost = dto.bitrefillCost.toString();
        }
        if (dto.usRetailPrice !== undefined) {
            updates.usRetailPrice = dto.usRetailPrice.toString();
        }
        if (dto.bitrefillCost || dto.usRetailPrice) {
            const newCost = dto.bitrefillCost || parseFloat(existing.bitrefillCost);
            const newRetail = dto.usRetailPrice || parseFloat(existing.usRetailPrice || '0');
            const b2cPricing = this.calculatePrice(newCost, newRetail, 'b2c');
            const b2bPricing = this.calculatePrice(newCost, newRetail, 'b2b');
            updates.b2cPrice = b2cPricing.price.toString();
            updates.b2bPrice = b2bPricing.price.toString();
            updates.marginPercent = b2cPricing.marginPercent.toString();
        }
        if (dto.b2cPrice !== undefined) {
            updates.b2cPrice = dto.b2cPrice.toString();
        }
        if (dto.b2bPrice !== undefined) {
            updates.b2bPrice = dto.b2bPrice.toString();
        }
        if (dto.isActive !== undefined) {
            updates.isActive = dto.isActive;
        }
        const [product] = await database_1.db
            .update(database_1.productPricing)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(database_1.productPricing.productSku, sku))
            .returning();
        console.log(`📝 Pricing updated for ${sku}`);
        console.log(`   B2C: $${product.b2cPrice}, B2B: $${product.b2bPrice}`);
        return product;
    }
    async syncFromBitrefill() {
        console.log('🔄 Bitrefill sync triggered...');
        return {
            synced: 0,
            message: 'Bitrefill sync not yet implemented. Waiting for API credentials.',
        };
    }
    round(value, decimals) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)()
], ProductsService);
//# sourceMappingURL=products.service.js.map