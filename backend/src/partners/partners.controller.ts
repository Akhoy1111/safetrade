// src/partners/partners.controller.ts
// Partners REST API Controller
// Handles B2B partner management and credit system

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { AdjustCreditDto } from './dto/adjust-credit.dto';
import { Partner } from '../database';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  /**
   * Create a new partner
   * POST /api/partners
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPartnerDto: CreatePartnerDto): Promise<Partner> {
    return this.partnersService.create(createPartnerDto);
  }

  /**
   * Get all partners
   * GET /api/partners
   */
  @Get()
  async findAll(): Promise<Partner[]> {
    return this.partnersService.findAll();
  }

  /**
   * Get partner by UUID
   * GET /api/partners/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partner> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.partnersService.findOne(id);
  }

  /**
   * Update partner
   * PATCH /api/partners/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.partnersService.update(id, updatePartnerDto);
  }

  /**
   * Delete partner
   * DELETE /api/partners/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Partner> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.partnersService.remove(id);
  }

  /**
   * Add credit to partner balance
   * POST /api/partners/:id/credit
   */
  @Post(':id/credit')
  async addCredit(
    @Param('id') id: string,
    @Body() adjustCreditDto: AdjustCreditDto,
  ) {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const result = await this.partnersService.addCredit(
      id,
      adjustCreditDto.amount,
      adjustCreditDto.description,
    );

    return {
      success: true,
      partner: result.partner,
      newBalance: result.newBalance,
      message: `Added $${adjustCreditDto.amount.toFixed(2)} to balance`,
    };
  }

  /**
   * Deduct credit from partner balance
   * POST /api/partners/:id/deduct
   */
  @Post(':id/deduct')
  async deductCredit(
    @Param('id') id: string,
    @Body() adjustCreditDto: AdjustCreditDto,
  ) {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const result = await this.partnersService.deductCredit(
      id,
      adjustCreditDto.amount,
      adjustCreditDto.description,
    );

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

  /**
   * Check partner balance
   * GET /api/partners/:id/balance
   */
  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const { balance, balanceFloat } = await this.partnersService.checkBalance(id);

    return {
      balance,
      balanceFloat,
      formatted: `$${balanceFloat.toFixed(2)}`,
    };
  }

  /**
   * Simple UUID format validation
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

