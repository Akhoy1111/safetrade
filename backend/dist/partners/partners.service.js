"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../database");
const crypto_1 = require("crypto");
let PartnersService = class PartnersService {
    generateApiKey() {
        const uuid = (0, crypto_1.randomUUID)();
        return `sk_live_${uuid}`;
    }
    async create(createPartnerDto) {
        const apiKey = this.generateApiKey();
        const [newPartner] = await database_1.db
            .insert(database_1.partners)
            .values({
            name: createPartnerDto.name,
            apiKey,
            webhookUrl: createPartnerDto.webhookUrl || null,
            creditBalance: '0',
            isActive: true,
        })
            .returning();
        return newPartner;
    }
    async findAll() {
        return database_1.db.select().from(database_1.partners);
    }
    async findOne(id) {
        const [partner] = await database_1.db
            .select()
            .from(database_1.partners)
            .where((0, drizzle_orm_1.eq)(database_1.partners.id, id))
            .limit(1);
        if (!partner) {
            throw new common_1.NotFoundException(`Partner with ID ${id} not found`);
        }
        return partner;
    }
    async findByApiKey(apiKey) {
        const [partner] = await database_1.db
            .select()
            .from(database_1.partners)
            .where((0, drizzle_orm_1.eq)(database_1.partners.apiKey, apiKey))
            .limit(1);
        if (!partner) {
            throw new common_1.NotFoundException('Invalid API key');
        }
        if (!partner.isActive) {
            throw new common_1.BadRequestException('Partner account is inactive');
        }
        return partner;
    }
    async update(id, updatePartnerDto) {
        await this.findOne(id);
        const [updatedPartner] = await database_1.db
            .update(database_1.partners)
            .set({
            ...updatePartnerDto,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.partners.id, id))
            .returning();
        return updatedPartner;
    }
    async remove(id) {
        await this.findOne(id);
        const [deletedPartner] = await database_1.db
            .delete(database_1.partners)
            .where((0, drizzle_orm_1.eq)(database_1.partners.id, id))
            .returning();
        return deletedPartner;
    }
    async addCredit(id, amount, description) {
        const partner = await this.findOne(id);
        const currentBalance = parseFloat(partner.creditBalance);
        const newBalance = (currentBalance + amount).toFixed(6);
        const [updatedPartner] = await database_1.db
            .update(database_1.partners)
            .set({
            creditBalance: newBalance,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.partners.id, id))
            .returning();
        console.log(`✅ Partner ${partner.name}: Added $${amount} credit. New balance: $${newBalance}`);
        return {
            partner: updatedPartner,
            newBalance,
            lowBalanceWarning: false,
        };
    }
    async deductCredit(id, amount, description) {
        const partner = await this.findOne(id);
        const currentBalance = parseFloat(partner.creditBalance);
        if (currentBalance < amount) {
            throw new common_1.BadRequestException(`Insufficient balance. Current: $${currentBalance.toFixed(2)}, Required: $${amount.toFixed(2)}`);
        }
        const newBalance = (currentBalance - amount).toFixed(6);
        const [updatedPartner] = await database_1.db
            .update(database_1.partners)
            .set({
            creditBalance: newBalance,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.partners.id, id))
            .returning();
        const minBalance = 1000;
        const lowBalanceWarning = parseFloat(newBalance) < minBalance;
        if (lowBalanceWarning) {
            console.warn(`⚠️  Partner ${partner.name}: Low balance! Current: $${newBalance}, Minimum: $${minBalance}`);
        }
        console.log(`💳 Partner ${partner.name}: Deducted $${amount}. New balance: $${newBalance}`);
        return {
            partner: updatedPartner,
            newBalance,
            lowBalanceWarning,
        };
    }
    async checkBalance(id) {
        const partner = await this.findOne(id);
        return {
            balance: partner.creditBalance,
            balanceFloat: parseFloat(partner.creditBalance),
        };
    }
    async hasBalance(id, requiredAmount) {
        const partner = await this.findOne(id);
        const currentBalance = parseFloat(partner.creditBalance);
        return currentBalance >= requiredAmount;
    }
};
exports.PartnersService = PartnersService;
exports.PartnersService = PartnersService = __decorate([
    (0, common_1.Injectable)()
], PartnersService);
//# sourceMappingURL=partners.service.js.map