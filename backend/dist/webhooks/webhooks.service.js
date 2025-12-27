"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../database");
let WebhooksService = class WebhooksService {
    constructor() {
        this.RETRY_DELAYS = [60000, 300000, 1800000];
        this.MAX_ATTEMPTS = 4;
    }
    async sendOrderWebhook(order, partner, eventType = 'order.completed') {
        if (!partner?.webhookUrl) {
            console.log(`ℹ️  No webhook URL configured for partner ${partner?.name || 'unknown'}`);
            return null;
        }
        const payload = {
            event: eventType,
            orderId: order.id,
            productSku: order.productSku,
            productName: order.productName,
            giftCardCode: eventType === 'order.completed' ? order.giftCardCode : undefined,
            paidAmount: order.paidAmount,
            status: order.status,
            timestamp: new Date().toISOString(),
        };
        const [delivery] = await database_1.db
            .insert(database_1.webhookDeliveries)
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
        await this.attemptDelivery(delivery.id);
        return this.findOne(delivery.id);
    }
    async attemptDelivery(deliveryId) {
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
        const [partner] = await database_1.db
            .select()
            .from(database_1.partners)
            .where((0, drizzle_orm_1.eq)(database_1.partners.id, delivery.partnerId))
            .limit(1);
        if (!partner?.webhookUrl) {
            console.log(`❌ No webhook URL for partner`);
            await this.markFailed(deliveryId);
            return false;
        }
        const newAttempts = delivery.attempts + 1;
        await database_1.db
            .update(database_1.webhookDeliveries)
            .set({
            attempts: newAttempts,
            lastAttempt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.webhookDeliveries.id, deliveryId));
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
                signal: AbortSignal.timeout(10000),
            });
            if (response.ok) {
                await this.markDelivered(deliveryId);
                console.log(`✅ Webhook delivered to ${partner.name}: ${partner.webhookUrl}`);
                return true;
            }
            else {
                console.error(`❌ Webhook failed: ${response.status} ${response.statusText}`);
                await this.scheduleRetry(deliveryId, newAttempts);
                return false;
            }
        }
        catch (error) {
            console.error(`❌ Webhook error:`, error.message);
            await this.scheduleRetry(deliveryId, newAttempts);
            return false;
        }
    }
    async scheduleRetry(deliveryId, attemptNumber) {
        if (attemptNumber >= this.MAX_ATTEMPTS) {
            await this.markFailed(deliveryId);
            return;
        }
        const delay = this.RETRY_DELAYS[attemptNumber - 1] || this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
        console.log(`⏰ Scheduling retry for ${deliveryId} in ${delay / 1000}s`);
        setTimeout(async () => {
            try {
                await this.attemptDelivery(deliveryId);
            }
            catch (error) {
                console.error(`Retry failed for ${deliveryId}:`, error.message);
            }
        }, delay);
    }
    async markDelivered(deliveryId) {
        await database_1.db
            .update(database_1.webhookDeliveries)
            .set({
            status: 'delivered',
            deliveredAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.webhookDeliveries.id, deliveryId));
    }
    async markFailed(deliveryId) {
        await database_1.db
            .update(database_1.webhookDeliveries)
            .set({ status: 'failed' })
            .where((0, drizzle_orm_1.eq)(database_1.webhookDeliveries.id, deliveryId));
        console.log(`❌ Webhook ${deliveryId} marked as failed`);
    }
    async findOne(id) {
        const [delivery] = await database_1.db
            .select()
            .from(database_1.webhookDeliveries)
            .where((0, drizzle_orm_1.eq)(database_1.webhookDeliveries.id, id))
            .limit(1);
        if (!delivery) {
            throw new common_1.NotFoundException(`Webhook delivery ${id} not found`);
        }
        return delivery;
    }
    async findAll(limit = 20, offset = 0) {
        return database_1.db
            .select()
            .from(database_1.webhookDeliveries)
            .orderBy((0, drizzle_orm_1.desc)(database_1.webhookDeliveries.createdAt))
            .limit(limit)
            .offset(offset);
    }
    async findByPartner(partnerId) {
        return database_1.db
            .select()
            .from(database_1.webhookDeliveries)
            .where((0, drizzle_orm_1.eq)(database_1.webhookDeliveries.partnerId, partnerId))
            .orderBy((0, drizzle_orm_1.desc)(database_1.webhookDeliveries.createdAt));
    }
    async findFailed() {
        return database_1.db
            .select()
            .from(database_1.webhookDeliveries)
            .where((0, drizzle_orm_1.eq)(database_1.webhookDeliveries.status, 'failed'))
            .orderBy((0, drizzle_orm_1.desc)(database_1.webhookDeliveries.createdAt));
    }
    async findPending() {
        return database_1.db
            .select()
            .from(database_1.webhookDeliveries)
            .where((0, drizzle_orm_1.eq)(database_1.webhookDeliveries.status, 'pending'))
            .orderBy((0, drizzle_orm_1.desc)(database_1.webhookDeliveries.createdAt));
    }
    async retryDelivery(id) {
        const delivery = await this.findOne(id);
        if (delivery.status === 'delivered') {
            throw new Error('Webhook already delivered');
        }
        await database_1.db
            .update(database_1.webhookDeliveries)
            .set({
            status: 'pending',
            attempts: 0,
        })
            .where((0, drizzle_orm_1.eq)(database_1.webhookDeliveries.id, id));
        await this.attemptDelivery(id);
        return this.findOne(id);
    }
    async getStats(partnerId) {
        const whereClause = partnerId
            ? (0, drizzle_orm_1.eq)(database_1.webhookDeliveries.partnerId, partnerId)
            : undefined;
        const all = await database_1.db
            .select()
            .from(database_1.webhookDeliveries)
            .where(whereClause);
        return {
            total: all.length,
            delivered: all.filter((w) => w.status === 'delivered').length,
            failed: all.filter((w) => w.status === 'failed').length,
            pending: all.filter((w) => w.status === 'pending').length,
        };
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)()
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map