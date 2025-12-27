// src/webhooks/webhooks.service.ts
// Webhook delivery service with retry logic and tracking

import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, and } from 'drizzle-orm';
import { db, webhookDeliveries, partners, type WebhookDelivery } from '../database';
import { createHmac } from 'crypto';

export interface WebhookPayload {
  event: string;
  orderId: string;
  productSku: string;
  productName?: string;
  giftCardCode?: string;
  paidAmount: string;
  status: string;
  timestamp: string;
}

@Injectable()
export class WebhooksService {
  // Retry delays in milliseconds: 1min, 5min, 30min
  private readonly RETRY_DELAYS = [60000, 300000, 1800000];
  private readonly MAX_ATTEMPTS = 4; // Initial + 3 retries

  /**
   * Create and send webhook for an order event
   */
  async sendOrderWebhook(
    order: any,
    partner: any,
    eventType: 'order.created' | 'order.completed' | 'order.failed' | 'order.refunded' = 'order.completed',
  ): Promise<WebhookDelivery | null> {
    if (!partner?.webhookUrl) {
      console.log(`ℹ️  No webhook URL configured for partner ${partner?.name || 'unknown'}`);
      return null;
    }

    const payload: WebhookPayload = {
      event: eventType,
      orderId: order.id,
      productSku: order.productSku,
      productName: order.productName,
      giftCardCode: eventType === 'order.completed' ? order.giftCardCode : undefined,
      paidAmount: order.paidAmount,
      status: order.status,
      timestamp: new Date().toISOString(),
    };

    // Create webhook delivery record
    const [delivery] = await db
      .insert(webhookDeliveries)
      .values({
        partnerId: partner.id,
        orderId: order.id,
        eventType,
        payload,
        status: 'pending',
        attempts: 0,
      })
      .returning();

    console.log(`📤 Webhook created: ${delivery.id} (${eventType})`);

    // Attempt immediate delivery
    await this.attemptDelivery(delivery.id);

    // Return updated delivery
    return this.findOne(delivery.id);
  }

  /**
   * Attempt to deliver a webhook
   */
  async attemptDelivery(deliveryId: string): Promise<boolean> {
    const delivery = await this.findOne(deliveryId);

    if (delivery.status === 'delivered') {
      console.log(`✅ Webhook ${deliveryId} already delivered`);
      return true;
    }

    if (delivery.attempts >= this.MAX_ATTEMPTS) {
      console.log(`❌ Webhook ${deliveryId} max attempts reached`);
      await this.markFailed(deliveryId);
      return false;
    }

    // Get partner's webhook URL
    const [partner] = await db
      .select()
      .from(partners)
      .where(eq(partners.id, delivery.partnerId!))
      .limit(1);

    if (!partner?.webhookUrl) {
      console.log(`❌ No webhook URL for partner`);
      await this.markFailed(deliveryId);
      return false;
    }

    // Update attempt count
    const newAttempts = delivery.attempts + 1;
    await db
      .update(webhookDeliveries)
      .set({
        attempts: newAttempts,
        lastAttempt: new Date(),
      })
      .where(eq(webhookDeliveries.id, deliveryId));

    console.log(`📤 Attempting delivery ${deliveryId} (attempt ${newAttempts}/${this.MAX_ATTEMPTS})`);

    try {
      const response = await fetch(partner.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SafeTrade-Event': delivery.eventType,
          'X-SafeTrade-Delivery-Id': deliveryId,
          'X-SafeTrade-Attempt': newAttempts.toString(),
        },
        body: JSON.stringify(delivery.payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        await this.markDelivered(deliveryId);
        console.log(`✅ Webhook delivered to ${partner.name}: ${partner.webhookUrl}`);
        return true;
      } else {
        console.error(`❌ Webhook failed: ${response.status} ${response.statusText}`);
        await this.scheduleRetry(deliveryId, newAttempts);
        return false;
      }
    } catch (error) {
      console.error(`❌ Webhook error:`, error.message);
      await this.scheduleRetry(deliveryId, newAttempts);
      return false;
    }
  }

  /**
   * Schedule a retry with exponential backoff
   */
  private async scheduleRetry(deliveryId: string, attemptNumber: number): Promise<void> {
    if (attemptNumber >= this.MAX_ATTEMPTS) {
      await this.markFailed(deliveryId);
      return;
    }

    const delay = this.RETRY_DELAYS[attemptNumber - 1] || this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
    console.log(`⏰ Scheduling retry for ${deliveryId} in ${delay / 1000}s`);

    // In production, use a job queue (Bull, etc.)
    // For now, use setTimeout
    setTimeout(async () => {
      try {
        await this.attemptDelivery(deliveryId);
      } catch (error) {
        console.error(`Retry failed for ${deliveryId}:`, error.message);
      }
    }, delay);
  }

  /**
   * Mark webhook as delivered
   */
  private async markDelivered(deliveryId: string): Promise<void> {
    await db
      .update(webhookDeliveries)
      .set({
        status: 'delivered',
        deliveredAt: new Date(),
      })
      .where(eq(webhookDeliveries.id, deliveryId));
  }

  /**
   * Mark webhook as failed
   */
  private async markFailed(deliveryId: string): Promise<void> {
    await db
      .update(webhookDeliveries)
      .set({ status: 'failed' })
      .where(eq(webhookDeliveries.id, deliveryId));
    
    console.log(`❌ Webhook ${deliveryId} marked as failed`);
  }

  /**
   * Find webhook delivery by ID
   */
  async findOne(id: string): Promise<WebhookDelivery> {
    const [delivery] = await db
      .select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.id, id))
      .limit(1);

    if (!delivery) {
      throw new NotFoundException(`Webhook delivery ${id} not found`);
    }

    return delivery;
  }

  /**
   * Find all webhook deliveries (paginated)
   */
  async findAll(limit: number = 20, offset: number = 0): Promise<WebhookDelivery[]> {
    return db
      .select()
      .from(webhookDeliveries)
      .orderBy(desc(webhookDeliveries.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find webhook deliveries by partner
   */
  async findByPartner(partnerId: string): Promise<WebhookDelivery[]> {
    return db
      .select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.partnerId, partnerId))
      .orderBy(desc(webhookDeliveries.createdAt));
  }

  /**
   * Find failed webhook deliveries
   */
  async findFailed(): Promise<WebhookDelivery[]> {
    return db
      .select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.status, 'failed'))
      .orderBy(desc(webhookDeliveries.createdAt));
  }

  /**
   * Find pending webhook deliveries (for retry processing)
   */
  async findPending(): Promise<WebhookDelivery[]> {
    return db
      .select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.status, 'pending'))
      .orderBy(desc(webhookDeliveries.createdAt));
  }

  /**
   * Manually retry a failed webhook
   */
  async retryDelivery(id: string): Promise<WebhookDelivery> {
    const delivery = await this.findOne(id);

    if (delivery.status === 'delivered') {
      throw new Error('Webhook already delivered');
    }

    // Reset attempts for manual retry
    await db
      .update(webhookDeliveries)
      .set({
        status: 'pending',
        attempts: 0,
      })
      .where(eq(webhookDeliveries.id, id));

    // Attempt delivery
    await this.attemptDelivery(id);

    return this.findOne(id);
  }

  /**
   * Get webhook statistics for a partner
   */
  async getStats(partnerId?: string): Promise<{
    total: number;
    delivered: number;
    failed: number;
    pending: number;
  }> {
    const whereClause = partnerId
      ? eq(webhookDeliveries.partnerId, partnerId)
      : undefined;

    const all = await db
      .select()
      .from(webhookDeliveries)
      .where(whereClause);

    return {
      total: all.length,
      delivered: all.filter((w) => w.status === 'delivered').length,
      failed: all.filter((w) => w.status === 'failed').length,
      pending: all.filter((w) => w.status === 'pending').length,
    };
  }
}

