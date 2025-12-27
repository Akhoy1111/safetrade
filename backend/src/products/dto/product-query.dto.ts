// src/products/dto/product-query.dto.ts
// DTO for querying/filtering products

import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory, ProductRegion } from './create-product.dto';

export class ProductQueryDto {
  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @IsEnum(ProductRegion)
  @IsOptional()
  region?: ProductRegion;

  @IsString()
  @IsOptional()
  search?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;
}

