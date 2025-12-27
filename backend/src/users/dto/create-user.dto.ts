// src/users/dto/create-user.dto.ts
import { IsString, IsOptional, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  telegramId: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  username?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  lastName?: string;

  @IsString()
  @IsOptional()
  @Length(6, 20)
  referredByCode?: string; // Referral code of person who invited them
}