import { type WebhookDelivery } from '../database';
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
export declare class WebhooksService {
    private readonly RETRY_DELAYS;
    private readonly MAX_ATTEMPTS;
    sendOrderWebhook(order: any, partner: any, eventType?: 'order.created' | 'order.completed' | 'order.failed' | 'order.refunded'): Promise<WebhookDelivery | null>;
    attemptDelivery(deliveryId: string): Promise<boolean>;
    private scheduleRetry;
    private markDelivered;
    private markFailed;
    findOne(id: string): Promise<WebhookDelivery>;
    findAll(limit?: number, offset?: number): Promise<WebhookDelivery[]>;
    findByPartner(partnerId: string): Promise<WebhookDelivery[]>;
    findFailed(): Promise<WebhookDelivery[]>;
    findPending(): Promise<WebhookDelivery[]>;
    retryDelivery(id: string): Promise<WebhookDelivery>;
    getStats(partnerId?: string): Promise<{
        total: number;
        delivered: number;
        failed: number;
        pending: number;
    }>;
}
