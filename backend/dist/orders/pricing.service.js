"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
let PricingService = class PricingService {
    calculatePrice(bitrefillCost, isPartner = false) {
        const usRetailPrice = bitrefillCost / 0.37;
        const userPrice = usRetailPrice * 0.55;
        const partnerPrice = isPartner ? userPrice * 0.90 : userPrice;
        const safetradeFee = partnerPrice - bitrefillCost;
        const safetradeMargin = (safetradeFee / partnerPrice) * 100;
        const userSavings = usRetailPrice - userPrice;
        const userSavingsPercent = 45;
        return {
            bitrefillCost: this.round(bitrefillCost, 2),
            userPrice: this.round(userPrice, 2),
            partnerPrice: this.round(partnerPrice, 2),
            safetradeFee: this.round(safetradeFee, 2),
            safetradeMargin: this.round(safetradeMargin, 1),
            userSavings: this.round(userSavings, 2),
            userSavingsPercent,
        };
    }
    getFinalPrice(bitrefillCost, isPartner) {
        const pricing = this.calculatePrice(bitrefillCost, isPartner);
        return isPartner ? pricing.partnerPrice : pricing.userPrice;
    }
    round(value, decimals) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)()
], PricingService);
//# sourceMappingURL=pricing.service.js.map