// src/orders/orders.module.ts
// Orders module - Revenue engine

import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PricingService } from './pricing.service';
import { PartnersModule } from '../partners/partners.module';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { WalletsModule } from '../wallets/wallets.module';
import { BitrefillModule } from '../integrations/bitrefill/bitrefill.module';

@Module({
  imports: [
    PartnersModule,
    UsersModule,
    ProductsModule,
    WebhooksModule,
    WalletsModule,
    BitrefillModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PricingService],
  exports: [OrdersService, PricingService],
})
export class OrdersModule {}

