// src/integrations/bitrefill/bitrefill.module.ts
// Bitrefill integration module

import { Module } from '@nestjs/common';
import { BitrefillService } from './bitrefill.service';

@Module({
  providers: [BitrefillService],
  exports: [BitrefillService],
})
export class BitrefillModule {}

