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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const webhooks_service_1 = require("./webhooks.service");
let WebhooksController = class WebhooksController {
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    async findAll(limit, offset) {
        const take = limit ? parseInt(limit, 10) : 20;
        const skip = offset ? parseInt(offset, 10) : 0;
        if (isNaN(take) || take < 1 || take > 100) {
            throw new common_1.BadRequestException('Limit must be between 1 and 100');
        }
        return this.webhooksService.findAll(take, skip);
    }
    async getStats(partnerId) {
        return this.webhooksService.getStats(partnerId);
    }
    async findFailed() {
        return this.webhooksService.findFailed();
    }
    async findPending() {
        return this.webhooksService.findPending();
    }
    async findByPartner(partnerId) {
        if (!this.isValidUUID(partnerId)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        return this.webhooksService.findByPartner(partnerId);
    }
    async findOne(id) {
        if (!this.isValidUUID(id)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        return this.webhooksService.findOne(id);
    }
    async retry(id) {
        if (!this.isValidUUID(id)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        return this.webhooksService.retryDelivery(id);
    }
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "findFailed", null);
__decorate([
    (0, common_1.Get)('pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "findPending", null);
__decorate([
    (0, common_1.Get)('partner/:partnerId'),
    __param(0, (0, common_1.Param)('partnerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "findByPartner", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/retry'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "retry", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map