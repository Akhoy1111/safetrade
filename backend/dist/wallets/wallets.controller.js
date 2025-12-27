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
exports.WalletsController = void 0;
const common_1 = require("@nestjs/common");
const wallets_service_1 = require("./wallets.service");
const deposit_dto_1 = require("./dto/deposit.dto");
let WalletsController = class WalletsController {
    constructor(walletsService) {
        this.walletsService = walletsService;
    }
    async findAll(limit, offset) {
        const take = limit ? parseInt(limit, 10) : 20;
        const skip = offset ? parseInt(offset, 10) : 0;
        return this.walletsService.findAll(take, skip);
    }
    async getWallet(userId) {
        if (!this.isValidUUID(userId)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        return this.walletsService.getWallet(userId);
    }
    async getBalance(userId) {
        if (!this.isValidUUID(userId)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        const balance = await this.walletsService.getBalance(userId);
        return {
            ...balance,
            formatted: {
                available: `$${balance.available.toFixed(2)}`,
                locked: `$${balance.locked.toFixed(2)}`,
                total: `$${balance.total.toFixed(2)}`,
            },
        };
    }
    async deposit(userId, depositDto) {
        if (!this.isValidUUID(userId)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        const wallet = await this.walletsService.addBalance(userId, depositDto.amount, depositDto.description || `Manual deposit${depositDto.txHash ? ` (tx: ${depositDto.txHash})` : ''}`);
        return {
            wallet,
            deposit: {
                amount: depositDto.amount,
                description: depositDto.description,
            },
        };
    }
    async withdraw(userId, withdrawDto) {
        if (!this.isValidUUID(userId)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        const wallet = await this.walletsService.deductBalance(userId, withdrawDto.amount, withdrawDto.description || 'Manual withdrawal');
        return {
            wallet,
            withdrawal: {
                amount: withdrawDto.amount,
                description: withdrawDto.description,
            },
        };
    }
    async findById(id) {
        if (!this.isValidUUID(id)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        return this.walletsService.findById(id);
    }
    async getTransactions(userId, limit, offset) {
        if (!this.isValidUUID(userId)) {
            throw new common_1.BadRequestException('Invalid UUID format');
        }
        const take = limit ? parseInt(limit, 10) : 20;
        const skip = offset ? parseInt(offset, 10) : 0;
        return this.walletsService.getTransactions(userId, take, skip);
    }
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
};
exports.WalletsController = WalletsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('user/:userId/balance'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Post)('user/:userId/deposit'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deposit_dto_1.DepositDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "deposit", null);
__decorate([
    (0, common_1.Post)('user/:userId/withdraw'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, deposit_dto_1.DepositDto]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)('user/:userId/transactions'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "getTransactions", null);
exports.WalletsController = WalletsController = __decorate([
    (0, common_1.Controller)('wallets'),
    __metadata("design:paramtypes", [wallets_service_1.WalletsService])
], WalletsController);
//# sourceMappingURL=wallets.controller.js.map