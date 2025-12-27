import { type Order } from '../database';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './dto/update-order-status.dto';
import { PartnersService } from '../partners/partners.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { WalletsService } from '../wallets/wallets.service';
import { BitrefillService } from '../integrations/bitrefill/bitrefill.service';
import { PricingService } from './pricing.service';
export declare class OrdersService {
    private readonly partnersService;
    private readonly usersService;
    private readonly productsService;
    private readonly webhooksService;
    private readonly walletsService;
    private readonly bitrefillService;
    private readonly pricingService;
    constructor(partnersService: PartnersService, usersService: UsersService, productsService: ProductsService, webhooksService: WebhooksService, walletsService: WalletsService, bitrefillService: BitrefillService, pricingService: PricingService);
    create(createOrderDto: CreateOrderDto, apiKey?: string): Promise<Order>;
    findAll(limit?: number, offset?: number): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    findByPartner(partnerId: string): Promise<Order[]>;
    findByUser(userId: string): Promise<Order[]>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    refund(id: string): Promise<Order>;
}
