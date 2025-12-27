// src/products/products.controller.ts
// Products REST API Controller
// Manages gift card catalog and pricing

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductPricing } from '../database';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * List products with filtering and pagination
   * GET /api/products?category=streaming&region=turkey&search=netflix&page=1&limit=20
   */
  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  /**
   * Get list of available categories with product counts
   * GET /api/products/categories
   */
  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  /**
   * Get single product by SKU
   * GET /api/products/:sku
   */
  @Get(':sku')
  async findBySku(@Param('sku') sku: string): Promise<ProductPricing> {
    if (!sku || sku.trim().length === 0) {
      throw new BadRequestException('SKU is required');
    }

    return this.productsService.findBySku(sku);
  }

  /**
   * Create product in catalog (Admin only)
   * POST /api/products
   * 
   * Body:
   * {
   *   "productSku": "netflix-turkey-200",
   *   "productName": "Netflix Turkey 200 TRY",
   *   "category": "streaming",
   *   "region": "turkey",
   *   "bitrefillCost": 8.50,
   *   "usRetailPrice": 22.99
   * }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductPricing> {
    return this.productsService.createProduct(createProductDto);
  }

  /**
   * Update product pricing (Admin only)
   * PATCH /api/products/:sku/pricing
   * 
   * Body:
   * {
   *   "bitrefillCost": 8.75,
   *   "usRetailPrice": 23.99,
   *   "isActive": true
   * }
   */
  @Patch(':sku/pricing')
  async updatePricing(
    @Param('sku') sku: string,
    @Body() updatePricingDto: UpdatePricingDto,
  ): Promise<ProductPricing> {
    if (!sku || sku.trim().length === 0) {
      throw new BadRequestException('SKU is required');
    }

    return this.productsService.updatePricing(sku, updatePricingDto);
  }

  /**
   * Trigger Bitrefill catalog sync (Admin only)
   * POST /api/products/sync
   * 
   * TODO: Implement real Bitrefill API integration
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncFromBitrefill() {
    return this.productsService.syncFromBitrefill();
  }
}

