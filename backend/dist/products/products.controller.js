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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_pricing_dto_1 = require("./dto/update-pricing.dto");
const product_query_dto_1 = require("./dto/product-query.dto");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async findAll(query) {
        return this.productsService.findAll(query);
    }
    async getCategories() {
        return this.productsService.getCategories();
    }
    async findBySku(sku) {
        if (!sku || sku.trim().length === 0) {
            throw new common_1.BadRequestException('SKU is required');
        }
        return this.productsService.findBySku(sku);
    }
    async create(createProductDto) {
        return this.productsService.createProduct(createProductDto);
    }
    async updatePricing(sku, updatePricingDto) {
        if (!sku || sku.trim().length === 0) {
            throw new common_1.BadRequestException('SKU is required');
        }
        return this.productsService.updatePricing(sku, updatePricingDto);
    }
    async syncFromBitrefill() {
        return this.productsService.syncFromBitrefill();
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_query_dto_1.ProductQueryDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(':sku'),
    __param(0, (0, common_1.Param)('sku')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findBySku", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':sku/pricing'),
    __param(0, (0, common_1.Param)('sku')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_pricing_dto_1.UpdatePricingDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updatePricing", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "syncFromBitrefill", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map