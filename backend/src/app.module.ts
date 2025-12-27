import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { PartnersModule } from './partners/partners.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { WalletsModule } from './wallets/wallets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule,
    PartnersModule,
    OrdersModule,
    ProductsModule,
    WebhooksModule,
    WalletsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
