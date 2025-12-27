// src/partners/partners.module.ts
// Partners module for B2B API integration

import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';

@Module({
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}

