// src/wallets/dto/deposit.dto.ts
// DTO for depositing to a wallet

import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  txHash?: string; // For tracking TON blockchain deposits
}

