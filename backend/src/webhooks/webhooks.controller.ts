// src/webhooks/webhooks.controller.ts
// Webhooks REST API Controller

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookDelivery } from '../database';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * List all webhook deliveries (paginated)
   * GET /api/webhooks?limit=20&offset=0
   */
  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<WebhookDelivery[]> {
    const take = limit ? parseInt(limit, 10) : 20;
    const skip = offset ? parseInt(offset, 10) : 0;

    if (isNaN(take) || take < 1 || take > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    return this.webhooksService.findAll(take, skip);
  }

  /**
   * Get webhook delivery statistics
   * GET /api/webhooks/stats
   */
  @Get('stats')
  async getStats(@Query('partnerId') partnerId?: string) {
    return this.webhooksService.getStats(partnerId);
  }

  /**
   * List failed webhook deliveries
   * GET /api/webhooks/failed
   */
  @Get('failed')
  async findFailed(): Promise<WebhookDelivery[]> {
    return this.webhooksService.findFailed();
  }

  /**
   * List pending webhook deliveries
   * GET /api/webhooks/pending
   */
  @Get('pending')
  async findPending(): Promise<WebhookDelivery[]> {
    return this.webhooksService.findPending();
  }

  /**
   * Get webhook deliveries by partner
   * GET /api/webhooks/partner/:partnerId
   */
  @Get('partner/:partnerId')
  async findByPartner(@Param('partnerId') partnerId: string): Promise<WebhookDelivery[]> {
    if (!this.isValidUUID(partnerId)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.webhooksService.findByPartner(partnerId);
  }

  /**
   * Get single webhook delivery
   * GET /api/webhooks/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WebhookDelivery> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.webhooksService.findOne(id);
  }

  /**
   * Manually retry a webhook delivery
   * POST /api/webhooks/:id/retry
   */
  @Post(':id/retry')
  async retry(@Param('id') id: string): Promise<WebhookDelivery> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.webhooksService.retryDelivery(id);
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

