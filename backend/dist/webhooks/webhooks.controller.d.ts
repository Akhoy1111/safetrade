import { WebhooksService } from './webhooks.service';
import { WebhookDelivery } from '../database';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    findAll(limit?: string, offset?: string): Promise<WebhookDelivery[]>;
    getStats(partnerId?: string): Promise<{
        total: number;
        delivered: number;
        failed: number;
        pending: number;
    }>;
    findFailed(): Promise<WebhookDelivery[]>;
    findPending(): Promise<WebhookDelivery[]>;
    findByPartner(partnerId: string): Promise<WebhookDelivery[]>;
    findOne(id: string): Promise<WebhookDelivery>;
    retry(id: string): Promise<WebhookDelivery>;
    private isValidUUID;
}
