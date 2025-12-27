import { type ProductPricing } from '../database';
import { CreateProductDto } from './dto/create-product.dto';
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
export declare class ProductsService {
    findAll(query: ProductQueryDto): Promise<{
        products: ProductPricing[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findBySku(sku: string): Promise<ProductPricing>;
    getCategories(): Promise<{
        category: string;
        count: number;
    }[]>;
    calculatePrice(bitrefillCost: number, usRetailPrice: number | null, channel?: PricingChannel): PricingCalculation;
    createProduct(dto: CreateProductDto): Promise<ProductPricing>;
    updatePricing(sku: string, dto: UpdatePricingDto): Promise<ProductPricing>;
    syncFromBitrefill(): Promise<{
        synced: number;
        message: string;
    }>;
    private round;
}
export {};
