// src/orders/dto/update-order-status.dto.ts
// DTO for updating order status

import { IsEnum, IsNotEmpty } from 'class-validator';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}

