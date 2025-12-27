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
exports.CreateProductDto = exports.ProductRegion = exports.ProductCategory = void 0;
const class_validator_1 = require("class-validator");
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["STREAMING"] = "streaming";
    ProductCategory["GAMING"] = "gaming";
    ProductCategory["APP_STORE"] = "app_store";
    ProductCategory["ESIM"] = "esim";
    ProductCategory["VPN"] = "vpn";
    ProductCategory["SOFTWARE"] = "software";
    ProductCategory["RETAIL"] = "retail";
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
var ProductRegion;
(function (ProductRegion) {
    ProductRegion["TURKEY"] = "turkey";
    ProductRegion["US"] = "us";
    ProductRegion["EU"] = "eu";
    ProductRegion["GLOBAL"] = "global";
})(ProductRegion || (exports.ProductRegion = ProductRegion = {}));
class CreateProductDto {
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreateProductDto.prototype, "productSku", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 255),
    __metadata("design:type", String)
], CreateProductDto.prototype, "productName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ProductCategory),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ProductRegion),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "region", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "bitrefillCost", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "usRetailPrice", void 0);
//# sourceMappingURL=create-product.dto.js.map