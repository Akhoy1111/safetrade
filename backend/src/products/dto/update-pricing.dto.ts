// src/products/dto/update-pricing.dto.ts
// DTO for updating product pricing

import { IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdatePricingDto {
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  bitrefillCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  usRetailPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  b2cPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  b2bPrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

