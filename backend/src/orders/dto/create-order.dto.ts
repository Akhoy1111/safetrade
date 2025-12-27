// src/orders/dto/create-order.dto.ts
// DTO for creating a gift card order (B2B or B2C)

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  ValidateIf,
  Length,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  productSku: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  quantity?: number = 1;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.userId) // Required if userId is not provided
  partnerId?: string;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.partnerId) // Required if partnerId is not provided
  userId?: string;

  // Custom validation: Either partnerId OR userId must be provided (not both)
  static validate(dto: CreateOrderDto): { valid: boolean; error?: string } {
    if (dto.partnerId && dto.userId) {
      return {
        valid: false,
        error: 'Cannot specify both partnerId and userId. Choose one.',
      };
    }

    if (!dto.partnerId && !dto.userId) {
      return {
        valid: false,
        error: 'Either partnerId or userId is required.',
      };
    }

    return { valid: true };
  }
}

