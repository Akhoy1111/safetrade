import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductPricing } from '../database';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: ProductQueryDto): Promise<{
        products: ProductPricing[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getCategories(): Promise<{
        category: string;
        count: number;
    }[]>;
    findBySku(sku: string): Promise<ProductPricing>;
    create(createProductDto: CreateProductDto): Promise<ProductPricing>;
    updatePricing(sku: string, updatePricingDto: UpdatePricingDto): Promise<ProductPricing>;
    syncFromBitrefill(): Promise<{
        synced: number;
        message: string;
    }>;
}
