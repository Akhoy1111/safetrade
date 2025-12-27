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
exports.PartnersController = void 0;
const common_1 = require("@nestjs/common");
const partners_service_1 = require("./partners.service");
const create_partner_dto_1 = require("./dto/create-partner.dto");
const update_partner_dto_1 = require("./dto/update-partner.dto");
const adjust_credit_dto_1 = require("./dto/adjust-credit.dto");
let PartnersController = class PartnersController {
    constructor(partnersService) {
        this.partnersService = partnersService;
    }
    async create(createPartnerDto) {
        return this.partnersService.create(createPartnerDto);
    }
    async findAll() {
        return this.partnersService.findAll();
    }
    async findOne(id) {
        if (!this.isValidUUID(id)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        return this.partnersService.findOne(id);
    }
    async update(id, updatePartnerDto) {
        if (!this.isValidUUID(id)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        return this.partnersService.update(id, updatePartnerDto);
    }
    async remove(id) {
        if (!this.isValidUUID(id)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        return this.partnersService.remove(id);
    }
    async addCredit(id, adjustCreditDto) {
        if (!this.isValidUUID(id)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        const result = await this.partnersService.addCredit(id, adjustCreditDto.amount, adjustCreditDto.description);
        return {
            success: true,
            partner: result.partner,
            newBalance: result.newBalance,
            message: `Added $${adjustCreditDto.amount.toFixed(2)} to balance`,
        };
    }
    async deductCredit(id, adjustCreditDto) {
        if (!this.isValidUUID(id)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        const result = await this.partnersService.deductCredit(id, adjustCreditDto.amount, adjustCreditDto.description);
        return {
            success: true,
            partner: result.partner,
            newBalance: result.newBalance,
            lowBalanceWarning: result.lowBalanceWarning,
            message: result.lowBalanceWarning
                ? `⚠️  Balance is low! Current: $${result.newBalance}`
                : `Deducted $${adjustCreditDto.amount.toFixed(2)} from balance`,
        };
    }
    async getBalance(id) {
        if (!this.isValidUUID(id)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        const { balance, balanceFloat } = await this.partnersService.checkBalance(id);
        return {
            balance,
            balanceFloat,
            formatted: `$${balanceFloat.toFixed(2)}`,
        };
    }
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
};
exports.PartnersController = PartnersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_partner_dto_1.CreatePartnerDto]),
    __metadata("design:returntype", Promise)
], PartnersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PartnersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PartnersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_partner_dto_1.UpdatePartnerDto]),
    __metadata("design:returntype", Promise)
], PartnersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PartnersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/credit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, adjust_credit_dto_1.AdjustCreditDto]),
    __metadata("design:returntype", Promise)
], PartnersController.prototype, "addCredit", null);
__decorate([
    (0, common_1.Post)(':id/deduct'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, adjust_credit_dto_1.AdjustCreditDto]),
    __metadata("design:returntype", Promise)
], PartnersController.prototype, "deductCredit", null);
__decorate([
    (0, common_1.Get)(':id/balance'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PartnersController.prototype, "getBalance", null);
exports.PartnersController = PartnersController = __decorate([
    (0, common_1.Controller)('partners'),
    __metadata("design:paramtypes", [partners_service_1.PartnersService])
], PartnersController);
//# sourceMappingURL=partners.controller.js.map