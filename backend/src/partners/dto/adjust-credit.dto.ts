// src/partners/dto/adjust-credit.dto.ts
// DTO for adding or deducting partner credit balance

import { IsNumber, IsOptional, IsString, Min, Length } from 'class-validator';

export class AdjustCreditDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;
}

