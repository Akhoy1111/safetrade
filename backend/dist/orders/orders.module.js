"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const orders_controller_1 = require("./orders.controller");
const orders_service_1 = require("./orders.service");
const pricing_service_1 = require("./pricing.service");
const partners_module_1 = require("../partners/partners.module");
const users_module_1 = require("../users/users.module");
const products_module_1 = require("../products/products.module");
const webhooks_module_1 = require("../webhooks/webhooks.module");
const wallets_module_1 = require("../wallets/wallets.module");
const bitrefill_module_1 = require("../integrations/bitrefill/bitrefill.module");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            partners_module_1.PartnersModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            webhooks_module_1.WebhooksModule,
            wallets_module_1.WalletsModule,
            bitrefill_module_1.BitrefillModule,
        ],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService, pricing_service_1.PricingService],
        exports: [orders_service_1.OrdersService, pricing_service_1.PricingService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map