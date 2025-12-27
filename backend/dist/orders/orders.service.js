"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../database");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_status_dto_1 = require("./dto/update-order-status.dto");
const partners_service_1 = require("../partners/partners.service");
const users_service_1 = require("../users/users.service");
const products_service_1 = require("../products/products.service");
const webhooks_service_1 = require("../webhooks/webhooks.service");
const wallets_service_1 = require("../wallets/wallets.service");
const bitrefill_service_1 = require("../integrations/bitrefill/bitrefill.service");
const pricing_service_1 = require("./pricing.service");
let OrdersService = class OrdersService {
    constructor(partnersService, usersService, productsService, webhooksService, walletsService, bitrefillService, pricingService) {
        this.partnersService = partnersService;
        this.usersService = usersService;
        this.productsService = productsService;
        this.webhooksService = webhooksService;
        this.walletsService = walletsService;
        this.bitrefillService = bitrefillService;
        this.pricingService = pricingService;
    }
    async create(createOrderDto, apiKey) {
        const validation = create_order_dto_1.CreateOrderDto.validate(createOrderDto);
        if (!validation.valid) {
            throw new common_1.BadRequestException(validation.error);
        }
        const isB2B = !!createOrderDto.partnerId;
        const isB2C = !!createOrderDto.userId;
        let partner = null;
        let user = null;
        if (isB2B) {
            partner = await this.partnersService.findOne(createOrderDto.partnerId);
            if (apiKey) {
                const partnerByKey = await this.partnersService.findByApiKey(apiKey);
                if (partnerByKey.id !== partner.id) {
                    throw new common_1.BadRequestException('API key does not match partner');
                }
            }
        }
        else if (isB2C) {
            user = await this.usersService.findOne(createOrderDto.userId);
        }
        const catalogProduct = await this.productsService.findBySku(createOrderDto.productSku);
        if (!catalogProduct.isActive) {
            throw new common_1.BadRequestException(`Product ${createOrderDto.productSku} is not available`);
        }
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
        if (isB2B) {
            const hasBalance = await this.partnersService.hasBalance(partner.id, totalPrice);
            if (!hasBalance) {
                throw new common_1.BadRequestException(`Insufficient partner balance. Required: $${totalPrice.toFixed(2)}`);
            }
        }
        else if (isB2C) {
            const hasBalance = await this.walletsService.hasBalance(user.id, totalPrice);
            if (!hasBalance) {
                const walletBalance = await this.walletsService.getBalance(user.id);
                throw new common_1.BadRequestException(`Insufficient wallet balance. Available: $${walletBalance.available.toFixed(2)}, Required: $${totalPrice.toFixed(2)}`);
            }
        }
        let newOrder;
        if (isB2B) {
            await this.partnersService.deductCredit(partner.id, totalPrice, `Order: ${catalogProduct.productName} x${quantity}`);
            console.log(`💳 Deducted $${totalPrice} from partner ${partner.name}`);
            const [order] = await database_1.db
                .insert(database_1.orders)
                .values({
                partnerId: createOrderDto.partnerId,
                userId: null,
                productSku: catalogProduct.productSku,
                productName: catalogProduct.productName,
                faceValue: totalPrice.toString(),
                costAmount: costPrice.toString(),
                paidAmount: totalPrice.toString(),
                status: update_order_status_dto_1.OrderStatus.PENDING,
                giftCardCode: null,
            })
                .returning();
            newOrder = order;
            console.log(`📝 Order created: ${newOrder.id} (${update_order_status_dto_1.OrderStatus.PENDING})`);
        }
        else if (isB2C) {
            const [pendingOrder] = await database_1.db
                .insert(database_1.orders)
                .values({
                partnerId: null,
                userId: createOrderDto.userId,
                productSku: catalogProduct.productSku,
                productName: catalogProduct.productName,
                faceValue: totalPrice.toString(),
                costAmount: costPrice.toString(),
                paidAmount: totalPrice.toString(),
                status: update_order_status_dto_1.OrderStatus.PENDING,
                giftCardCode: null,
            })
                .returning();
            console.log(`📝 Order created: ${pendingOrder.id} (${update_order_status_dto_1.OrderStatus.PENDING})`);
            await this.walletsService.deductBalance(user.id, totalPrice, `Order ${pendingOrder.id}: ${catalogProduct.productName} x${quantity}`, pendingOrder.id);
            console.log(`💳 Deducted $${totalPrice} from user wallet`);
            newOrder = pendingOrder;
        }
        try {
            const [updatedOrder] = await database_1.db
                .update(database_1.orders)
                .set({ status: update_order_status_dto_1.OrderStatus.PROCESSING })
                .where((0, drizzle_orm_1.eq)(database_1.orders.id, newOrder.id))
                .returning();
            const bitrefillOrder = await this.bitrefillService.placeOrder(catalogProduct.productSku, quantity);
            const [completedOrder] = await database_1.db
                .update(database_1.orders)
                .set({
                status: update_order_status_dto_1.OrderStatus.COMPLETED,
                giftCardCode: bitrefillOrder.giftCardCode,
                externalOrderId: bitrefillOrder.orderId,
                deliveredAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(database_1.orders.id, newOrder.id))
                .returning();
            console.log(`✅ Order completed: ${completedOrder.id}`);
            console.log(`🎁 Gift card ready (code hidden for security)`);
            if (isB2B && partner) {
                await this.webhooksService.sendOrderWebhook(completedOrder, partner);
            }
            return completedOrder;
        }
        catch (error) {
            console.error(`❌ Order failed:`, error.message);
            await database_1.db
                .update(database_1.orders)
                .set({ status: update_order_status_dto_1.OrderStatus.FAILED })
                .where((0, drizzle_orm_1.eq)(database_1.orders.id, newOrder.id));
            if (isB2B) {
                await this.partnersService.addCredit(partner.id, totalPrice, `Refund for failed order ${newOrder.id}`);
            }
            if (isB2B && partner) {
                await this.webhooksService.sendOrderWebhook(newOrder, partner, 'order.failed');
            }
            throw new common_1.BadRequestException(`Order failed: ${error.message}`);
        }
    }
    async findAll(limit = 20, offset = 0) {
        return database_1.db
            .select()
            .from(database_1.orders)
            .orderBy((0, drizzle_orm_1.desc)(database_1.orders.createdAt))
            .limit(limit)
            .offset(offset);
    }
    async findOne(id) {
        const [order] = await database_1.db
            .select()
            .from(database_1.orders)
            .where((0, drizzle_orm_1.eq)(database_1.orders.id, id))
            .limit(1);
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async findByPartner(partnerId) {
        return database_1.db
            .select()
            .from(database_1.orders)
            .where((0, drizzle_orm_1.eq)(database_1.orders.partnerId, partnerId))
            .orderBy((0, drizzle_orm_1.desc)(database_1.orders.createdAt));
    }
    async findByUser(userId) {
        return database_1.db
            .select()
            .from(database_1.orders)
            .where((0, drizzle_orm_1.eq)(database_1.orders.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(database_1.orders.createdAt));
    }
    async updateStatus(id, status) {
        await this.findOne(id);
        const [updatedOrder] = await database_1.db
            .update(database_1.orders)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(database_1.orders.id, id))
            .returning();
        console.log(`📝 Order ${id} status updated to ${status}`);
        return updatedOrder;
    }
    async refund(id) {
        const order = await this.findOne(id);
        if (order.status === update_order_status_dto_1.OrderStatus.REFUNDED) {
            throw new common_1.BadRequestException('Order already refunded');
        }
        if (order.status !== update_order_status_dto_1.OrderStatus.COMPLETED) {
            throw new common_1.BadRequestException('Can only refund completed orders');
        }
        const refundAmount = parseFloat(order.paidAmount);
        if (order.partnerId) {
            await this.partnersService.addCredit(order.partnerId, refundAmount, `Refund for order ${order.id}`);
            console.log(`💰 Refunded $${refundAmount} to partner`);
        }
        else if (order.userId) {
            await this.walletsService.addBalance(order.userId, refundAmount, `Refund for order ${order.id}`);
            console.log(`💰 Refunded $${refundAmount} to user wallet`);
        }
        const [refundedOrder] = await database_1.db
            .update(database_1.orders)
            .set({ status: update_order_status_dto_1.OrderStatus.REFUNDED })
            .where((0, drizzle_orm_1.eq)(database_1.orders.id, id))
            .returning();
        console.log(`✅ Order ${id} refunded successfully`);
        return refundedOrder;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [partners_service_1.PartnersService,
        users_service_1.UsersService,
        products_service_1.ProductsService,
        webhooks_service_1.WebhooksService,
        wallets_service_1.WalletsService,
        bitrefill_service_1.BitrefillService,
        pricing_service_1.PricingService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map