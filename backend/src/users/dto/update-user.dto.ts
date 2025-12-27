// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(3)
  kycLevel?: number; // 1: None, 2: Basic, 3: Full

  @IsString()
  @IsOptional()
  kycStatus?: string; // pending, approved, rejected
}