// src/partners/dto/update-partner.dto.ts
// DTO for updating partner information

import { PartialType } from '@nestjs/mapped-types';
import { CreatePartnerDto } from './create-partner.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

