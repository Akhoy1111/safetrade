// src/products/dto/create-product.dto.ts
// DTO for creating a new product in the catalog

import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Length,
} from 'class-validator';

export enum ProductCategory {
  STREAMING = 'streaming',
  GAMING = 'gaming',
  APP_STORE = 'app_store',
  ESIM = 'esim',
  VPN = 'vpn',
  SOFTWARE = 'software',
  RETAIL = 'retail',
}

export enum ProductRegion {
  TURKEY = 'turkey',
  US = 'us',
  EU = 'eu',
  GLOBAL = 'global',
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  productSku: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  productName: string;

  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

  @IsEnum(ProductRegion)
  @IsOptional()
  region?: ProductRegion;

  @IsNumber()
  @Min(0.01)
  bitrefillCost: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  usRetailPrice?: number;
}

