"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitrefillService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let BitrefillService = class BitrefillService {
    constructor() {
        this.mockProducts = {
            'netflix-turkey-200': {
                sku: 'netflix-turkey-200',
                name: 'Netflix Turkey 200 TRY',
                cost: 8.50,
                faceValue: 200,
                currency: 'TRY',
                region: 'Turkey',
            },
            'spotify-turkey-50': {
                sku: 'spotify-turkey-50',
                name: 'Spotify Turkey 50 TRY',
                cost: 2.10,
                faceValue: 50,
                currency: 'TRY',
                region: 'Turkey',
            },
            'youtube-premium-turkey-100': {
                sku: 'youtube-premium-turkey-100',
                name: 'YouTube Premium Turkey 100 TRY',
                cost: 4.25,
                faceValue: 100,
                currency: 'TRY',
                region: 'Turkey',
            },
            'steam-turkey-500': {
                sku: 'steam-turkey-500',
                name: 'Steam Turkey 500 TRY',
                cost: 21.25,
                faceValue: 500,
                currency: 'TRY',
                region: 'Turkey',
            },
            'amazon-us-50': {
                sku: 'amazon-us-50',
                name: 'Amazon.com $50 USD',
                cost: 48.50,
                faceValue: 50,
                currency: 'USD',
                region: 'United States',
            },
        };
    }
    async getProduct(sku) {
        await this.delay(100);
        const product = this.mockProducts[sku];
        if (!product) {
            console.warn(`⚠️  Product not found: ${sku}, returning default`);
            return {
                sku,
                name: `Product ${sku}`,
                cost: 10.00,
                faceValue: 10,
                currency: 'USD',
            };
        }
        return product;
    }
    async placeOrder(sku, quantity = 1) {
        await this.delay(500);
        const giftCardCode = this.generateMockCode();
        console.log(`📦 Bitrefill order placed: ${sku} x${quantity}`);
        console.log(`🎁 Gift card code generated: ${giftCardCode.substring(0, 4)}...`);
        return {
            orderId: `BF-${this.generateUUID()}`,
            productSku: sku,
            quantity,
            giftCardCode,
            status: 'COMPLETED',
        };
    }
    generateMockCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 16; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
            if ((i + 1) % 4 === 0 && i < 15)
                code += '-';
        }
        return code;
    }
    generateUUID() {
        return (0, crypto_1.randomBytes)(16).toString('hex').match(/.{1,4}/g)?.join('-') || '';
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async getAvailableProducts() {
        return Object.values(this.mockProducts);
    }
};
exports.BitrefillService = BitrefillService;
exports.BitrefillService = BitrefillService = __decorate([
    (0, common_1.Injectable)()
], BitrefillService);
//# sourceMappingURL=bitrefill.service.js.map