// src/orders/orders.controller.ts
// Orders REST API Controller
// Handles order creation, tracking, and management

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order } from '../database';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Create order (B2B or B2C)
   * POST /api/orders
   * 
   * Optional: X-API-Key header for partner authentication
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Headers('x-api-key') apiKey?: string,
  ): Promise<Order> {
    return this.ordersService.create(createOrderDto, apiKey);
  }

  /**
   * Get all orders (paginated)
   * GET /api/orders?limit=20&offset=0
   */
  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Order[]> {
    const take = limit ? parseInt(limit, 10) : 20;
    const skip = offset ? parseInt(offset, 10) : 0;

    if (isNaN(take) || take < 1 || take > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    if (isNaN(skip) || skip < 0) {
      throw new BadRequestException('Offset must be a positive number');
    }

    return this.ordersService.findAll(take, skip);
  }

  /**
   * Get order by UUID
   * GET /api/orders/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Order> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.ordersService.findOne(id);
  }

  /**
   * Get partner's orders
   * GET /api/orders/partner/:partnerId
   */
  @Get('partner/:partnerId')
  async findByPartner(@Param('partnerId') partnerId: string): Promise<Order[]> {
    if (!this.isValidUUID(partnerId)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.ordersService.findByPartner(partnerId);
  }

  /**
   * Get user's orders
   * GET /api/orders/user/:userId
   */
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string): Promise<Order[]> {
    if (!this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.ordersService.findByUser(userId);
  }

  /**
   * Update order status
   * PATCH /api/orders/:id/status
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.ordersService.updateStatus(id, updateOrderStatusDto.status);
  }

  /**
   * Refund order
   * POST /api/orders/:id/refund
   */
  @Post(':id/refund')
  async refund(@Param('id') id: string): Promise<Order> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.ordersService.refund(id);
  }

  /**
   * Simple UUID format validation
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

