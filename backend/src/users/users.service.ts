// src/users/users.service.ts
// User service using Drizzle ORM
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { db, users, type User } from '../database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor() {}

  /**
   * Generate a unique 8-character referral code
   */
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, I, 1)
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, createUserDto.telegramId))
      .limit(1);

    if (existingUser) {
      throw new ConflictException('User with this Telegram ID already exists');
    }

    // Handle referral code if provided
    let referredBy: string | null = null;
    if (createUserDto.referredByCode) {
      const [referrer] = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, createUserDto.referredByCode))
        .limit(1);

      if (referrer) {
        referredBy = referrer.id;
      }
      // If referral code invalid, ignore it (don't fail registration)
    }

    // Generate unique referral code for new user
    let referralCode = this.generateReferralCode();
    let codeExists = true;

    // Ensure referral code is unique (very unlikely to collide)
    while (codeExists) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, referralCode))
        .limit(1);
      
      if (!existing) {
        codeExists = false;
      } else {
        referralCode = this.generateReferralCode();
      }
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        telegramId: createUserDto.telegramId,
        username: createUserDto.username || null,
        firstName: createUserDto.firstName || null,
        lastName: createUserDto.lastName || null,
        referredBy: referredBy || null,
        referralCode,
      })
      .returning();

    return newUser;
  }

  /**
   * Find all users (paginated)
   */
  async findAll(skip = 0, take = 20): Promise<User[]> {
    return db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(take)
      .offset(skip);
  }

  /**
   * Find user by ID
   */
  async findOne(id: string): Promise<User> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by Telegram ID
   */
  async findByTelegramId(telegramId: string): Promise<User> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with Telegram ID ${telegramId} not found`);
    }

    return user;
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    await this.findOne(id);

    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateUserDto,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  /**
   * Delete user (soft delete - just for admin purposes)
   */
  async remove(id: string): Promise<User> {
    await this.findOne(id);

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    return deletedUser;
  }
}