import { ProductCategory, ProductRegion } from './create-product.dto';
export declare class ProductQueryDto {
    category?: ProductCategory;
    region?: ProductRegion;
    search?: string;
    limit?: number;
    page?: number;
}
