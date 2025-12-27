// src/users/users.controller.ts
// Users REST API Controller
// Handles all user CRUD operations with UUID-based routing

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../database';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user (Telegram registration)
   * POST /api/users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  /**
   * Get all users (paginated)
   * GET /api/users?limit=20&offset=0
   */
  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<User[]> {
    const take = limit ? parseInt(limit, 10) : 20;
    const skip = offset ? parseInt(offset, 10) : 0;

    // Validate pagination params
    if (isNaN(take) || take < 1 || take > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    if (isNaN(skip) || skip < 0) {
      throw new BadRequestException('Offset must be a positive number');
    }

    return this.usersService.findAll(skip, take);
  }

  /**
   * Get user by UUID
   * GET /api/users/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    // Basic UUID format validation
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.usersService.findOne(id);
  }

  /**
   * Get user by Telegram ID
   * GET /api/users/telegram/:telegramId
   */
  @Get('telegram/:telegramId')
  async findByTelegramId(@Param('telegramId') telegramId: string): Promise<User> {
    if (!telegramId || telegramId.trim() === '') {
      throw new BadRequestException('Telegram ID is required');
    }

    return this.usersService.findByTelegramId(telegramId);
  }

  /**
   * Update user
   * PATCH /api/users/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Basic UUID format validation
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<User> {
    // Basic UUID format validation
    if (!this.isValidUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this.usersService.remove(id);
  }

  /**
   * Simple UUID format validation
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

