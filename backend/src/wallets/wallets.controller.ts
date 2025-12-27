// src/wallets/wallets.controller.ts
// Wallets REST API Controller

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { DepositDto } from './dto/deposit.dto';
import { Wallet, Transaction } from '../database';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  /**
   * Get all wallets (admin, paginated)
   * GET /api/wallets?limit=20&offset=0
   */
  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Wallet[]> {
    const take = limit ? parseInt(limit, 10) : 20;
    const skip = offset ? parseInt(offset, 10) : 0;

    return this.walletsService.findAll(take, skip);
  }

  /**
   * Get wallet by user ID (or create if doesn't exist)
   * GET /api/wallets/user/:userId
   */
  @Get('user/:userId')
  async getWallet(@Param('userId') userId: string): Promise<Wallet> {
    if (!this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.walletsService.getWallet(userId);
  }

  /**
   * Get wallet balance
   * GET /api/wallets/user/:userId/balance
   */
  @Get('user/:userId/balance')
  async getBalance(@Param('userId') userId: string) {
    if (!this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid UUID format');
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

  /**
   * Deposit to wallet (admin or system)
   * POST /api/wallets/user/:userId/deposit
   */
  @Post('user/:userId/deposit')
  async deposit(
    @Param('userId') userId: string,
    @Body() depositDto: DepositDto,
  ): Promise<{
    wallet: Wallet;
    deposit: { amount: number; description?: string };
  }> {
    if (!this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const wallet = await this.walletsService.addBalance(
      userId,
      depositDto.amount,
      depositDto.description || `Manual deposit${depositDto.txHash ? ` (tx: ${depositDto.txHash})` : ''}`,
    );

    return {
      wallet,
      deposit: {
        amount: depositDto.amount,
        description: depositDto.description,
      },
    };
  }

  /**
   * Withdraw from wallet (admin or system)
   * POST /api/wallets/user/:userId/withdraw
   */
  @Post('user/:userId/withdraw')
  async withdraw(
    @Param('userId') userId: string,
    @Body() withdrawDto: DepositDto,
  ): Promise<{
    wallet: Wallet;
    withdrawal: { amount: number; description?: string };
  }> {
    if (!this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const wallet = await this.walletsService.deductBalance(
      userId,
      withdrawDto.amount,
      withdrawDto.description || 'Manual withdrawal',
    );

    return {
      wallet,
      withdrawal: {
        amount: withdrawDto.amount,
        description: withdrawDto.description,
      },
    };
  }

  /**
   * Get wallet by wallet ID
   * GET /api/wallets/:id
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Wallet> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.walletsService.findById(id);
  }

  /**
   * Get user's transaction history
   * GET /api/wallets/user/:userId/transactions?limit=20&offset=0
   */
  @Get('user/:userId/transactions')
  async getTransactions(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Transaction[]> {
    if (!this.isValidUUID(userId)) {
      throw new BadRequestException('Invalid UUID format');
    }

    const take = limit ? parseInt(limit, 10) : 20;
    const skip = offset ? parseInt(offset, 10) : 0;

    return this.walletsService.getTransactions(userId, take, skip);
  }

  /**
   * Simple UUID format validation
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

