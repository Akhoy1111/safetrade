// src/partners/dto/create-partner.dto.ts
// DTO for creating a new B2B partner

import { IsString, IsNotEmpty, IsOptional, IsUrl, IsNumber, Min, Length } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  name: string;

  @IsUrl()
  @IsOptional()
  webhookUrl?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minBalance?: number; // Default: 1000
}

