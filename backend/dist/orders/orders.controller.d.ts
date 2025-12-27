import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order } from '../database';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, apiKey?: string): Promise<Order>;
    findAll(limit?: string, offset?: string): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    findByPartner(partnerId: string): Promise<Order[]>;
    findByUser(userId: string): Promise<Order[]>;
    updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order>;
    refund(id: string): Promise<Order>;
    private isValidUUID;
}
