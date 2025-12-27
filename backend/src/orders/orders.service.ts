// src/orders/orders.service.ts
// Orders service - Revenue engine connecting Partners → Products → Bitrefill → Gift Cards

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { db, orders, type Order } from '../database';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './dto/update-order-status.dto';
import { PartnersService } from '../partners/partners.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { WalletsService } from '../wallets/wallets.service';
import { BitrefillService } from '../integrations/bitrefill/bitrefill.service';
import { PricingService } from './pricing.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly webhooksService: WebhooksService,
    private readonly walletsService: WalletsService,
    private readonly bitrefillService: BitrefillService,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * Create order - Complete business flow
   * Partner/User → Validate → Fetch from Catalog → Price → Deduct → Bitrefill → Webhook
   */
  async create(createOrderDto: CreateOrderDto, apiKey?: string): Promise<Order> {
    // Step 1: Validate DTO (either partnerId OR userId)
    const validation = CreateOrderDto.validate(createOrderDto);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const isB2B = !!createOrderDto.partnerId;
    const isB2C = !!createOrderDto.userId;

    let partner: any = null;
    let user: any = null;

    // Step 2: Validate partner OR user exists
    if (isB2B) {
      partner = await this.partnersService.findOne(createOrderDto.partnerId!);

      // Step 2b: Validate API key matches partner (if provided)
      if (apiKey) {
        const partnerByKey = await this.partnersService.findByApiKey(apiKey);
        if (partnerByKey.id !== partner.id) {
          throw new BadRequestException('API key does not match partner');
        }
      }
    } else if (isB2C) {
      user = await this.usersService.findOne(createOrderDto.userId!);
    }

    // Step 3: Fetch product from catalog
    const catalogProduct = await this.productsService.findBySku(createOrderDto.productSku);
    
    // Check if product is active
    if (!catalogProduct.isActive) {
      throw new BadRequestException(`Product ${createOrderDto.productSku} is not available`);
    }

    // Step 4: Determine pricing from catalog
    const quantity = createOrderDto.quantity || 1;
    const unitPrice = isB2B 
      ? parseFloat(catalogProduct.b2bPrice)
      : parseFloat(catalogProduct.b2cPrice);
    const totalPrice = unitPrice * quantity;
    const costPrice = parseFloat(catalogProduct.bitrefillCost) * quantity;
    const margin = totalPrice - costPrice;
    const marginPercent = (margin / totalPrice) * 100;

    console.log(`💰 Order pricing for ${catalogProduct.productName}:`);
    console.log(`   Catalog SKU: ${catalogProduct.productSku}`);
    console.log(`   Category: ${catalogProduct.category}, Region: ${catalogProduct.region}`);
    console.log(`   Unit price: $${unitPrice} × ${quantity}`);
    console.log(`   Total price: $${totalPrice.toFixed(2)}`);
    console.log(`   Cost: $${costPrice.toFixed(2)}`);
    console.log(`   Margin: $${margin.toFixed(2)} (${marginPercent.toFixed(1)}%)`);

    // Step 5: Check balance
    if (isB2B) {
      const hasBalance = await this.partnersService.hasBalance(partner!.id, totalPrice);
      if (!hasBalance) {
        throw new BadRequestException(
          `Insufficient partner balance. Required: $${totalPrice.toFixed(2)}`,
        );
      }
    } else if (isB2C) {
      const hasBalance = await this.walletsService.hasBalance(user!.id, totalPrice);
      if (!hasBalance) {
        const walletBalance = await this.walletsService.getBalance(user!.id);
        throw new BadRequestException(
          `Insufficient wallet balance. Available: $${walletBalance.available.toFixed(2)}, Required: $${totalPrice.toFixed(2)}`,
        );
      }
    }

    // Step 6: Deduct balance atomically and create order
    let newOrder!: Order; // Use definite assignment assertion

    if (isB2B) {
      await this.partnersService.deductCredit(
        partner!.id,
        totalPrice,
        `Order: ${catalogProduct.productName} x${quantity}`,
      );
      console.log(`💳 Deducted $${totalPrice} from partner ${partner!.name}`);

      // Step 7: Create B2B order record (status: PENDING)
      const [order] = await db
        .insert(orders)
        .values({
          partnerId: createOrderDto.partnerId,
          userId: null,
          productSku: catalogProduct.productSku,
          productName: catalogProduct.productName,
          faceValue: totalPrice.toString(),
          costAmount: costPrice.toString(),
          paidAmount: totalPrice.toString(),
          status: OrderStatus.PENDING,
          giftCardCode: null,
        })
        .returning();

      newOrder = order;
      console.log(`📝 Order created: ${newOrder.id} (${OrderStatus.PENDING})`);
    } else if (isB2C) {
      // Step 7: Create B2C order first to get orderId
      const [pendingOrder] = await db
        .insert(orders)
        .values({
          partnerId: null,
          userId: createOrderDto.userId,
          productSku: catalogProduct.productSku,
          productName: catalogProduct.productName,
          faceValue: totalPrice.toString(),
          costAmount: costPrice.toString(),
          paidAmount: totalPrice.toString(),
          status: OrderStatus.PENDING,
          giftCardCode: null,
        })
        .returning();

      console.log(`📝 Order created: ${pendingOrder.id} (${OrderStatus.PENDING})`);

      // Now deduct from wallet with orderId for transaction logging
      await this.walletsService.deductBalance(
        user!.id,
        totalPrice,
        `Order ${pendingOrder.id}: ${catalogProduct.productName} x${quantity}`,
        pendingOrder.id,
      );
      console.log(`💳 Deducted $${totalPrice} from user wallet`);

      newOrder = pendingOrder;
    }

    try {
      // Step 8: Place order with Bitrefill (async)
      const [updatedOrder] = await db
        .update(orders)
        .set({ status: OrderStatus.PROCESSING })
        .where(eq(orders.id, newOrder.id))
        .returning();

      const bitrefillOrder = await this.bitrefillService.placeOrder(
        catalogProduct.productSku,
        quantity,
      );

      // Step 9: Update order with gift card code (status: COMPLETED)
      const [completedOrder] = await db
        .update(orders)
        .set({
          status: OrderStatus.COMPLETED,
          giftCardCode: bitrefillOrder.giftCardCode,
          externalOrderId: bitrefillOrder.orderId,
          deliveredAt: new Date(),
        })
        .where(eq(orders.id, newOrder.id))
        .returning();

      console.log(`✅ Order completed: ${completedOrder.id}`);
      console.log(`🎁 Gift card ready (code hidden for security)`);

      // Step 10: Send webhook to partner (if B2B)
      if (isB2B && partner) {
        await this.webhooksService.sendOrderWebhook(completedOrder, partner);
      }

      // Step 11: Return completed order
      return completedOrder;
    } catch (error) {
      // If Bitrefill fails, mark order as failed and refund
      console.error(`❌ Order failed:`, error.message);

      await db
        .update(orders)
        .set({ status: OrderStatus.FAILED })
        .where(eq(orders.id, newOrder.id));

      // Refund the balance
      if (isB2B) {
        await this.partnersService.addCredit(
          partner!.id,
          totalPrice,
          `Refund for failed order ${newOrder.id}`,
        );
      }

      if (isB2B && partner) {
        await this.webhooksService.sendOrderWebhook(newOrder, partner, 'order.failed');
      }

      throw new BadRequestException(`Order failed: ${error.message}`);
    }
  }

  /**
   * Find all orders (paginated)
   */
  async findAll(limit: number = 20, offset: number = 0): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find order by ID
   */
  async findOne(id: string): Promise<Order> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Find orders by partner
   */
  async findByPartner(partnerId: string): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.partnerId, partnerId))
      .orderBy(desc(orders.createdAt));
  }

  /**
   * Find orders by user
   */
  async findByUser(userId: string): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.findOne(id);

    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();

    console.log(`📝 Order ${id} status updated to ${status}`);

    return updatedOrder;
  }

  /**
   * Refund order - Add balance back, update status
   */
  async refund(id: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException('Order already refunded');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed orders');
    }

    const refundAmount = parseFloat(order.paidAmount);

    // Refund balance
    if (order.partnerId) {
      await this.partnersService.addCredit(
        order.partnerId,
        refundAmount,
        `Refund for order ${order.id}`,
      );
      console.log(`💰 Refunded $${refundAmount} to partner`);
    } else if (order.userId) {
      await this.walletsService.addBalance(
        order.userId,
        refundAmount,
        `Refund for order ${order.id}`,
      );
      console.log(`💰 Refunded $${refundAmount} to user wallet`);
    }

    // Update order status
    const [refundedOrder] = await db
      .update(orders)
      .set({ status: OrderStatus.REFUNDED })
      .where(eq(orders.id, id))
      .returning();

    console.log(`✅ Order ${id} refunded successfully`);

    return refundedOrder;
  }
}

