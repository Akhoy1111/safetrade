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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_1 = require("../database");
let UsersService = class UsersService {
    constructor() { }
    generateReferralCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    async create(createUserDto) {
        const [existingUser] = await database_1.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.telegramId, createUserDto.telegramId))
            .limit(1);
        if (existingUser) {
            throw new common_1.ConflictException('User with this Telegram ID already exists');
        }
        let referredBy = null;
        if (createUserDto.referredByCode) {
            const [referrer] = await database_1.db
                .select()
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.referralCode, createUserDto.referredByCode))
                .limit(1);
            if (referrer) {
                referredBy = referrer.id;
            }
        }
        let referralCode = this.generateReferralCode();
        let codeExists = true;
        while (codeExists) {
            const [existing] = await database_1.db
                .select()
                .from(database_1.users)
                .where((0, drizzle_orm_1.eq)(database_1.users.referralCode, referralCode))
                .limit(1);
            if (!existing) {
                codeExists = false;
            }
            else {
                referralCode = this.generateReferralCode();
            }
        }
        const [newUser] = await database_1.db
            .insert(database_1.users)
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
    async findAll(skip = 0, take = 20) {
        return database_1.db
            .select()
            .from(database_1.users)
            .orderBy((0, drizzle_orm_1.desc)(database_1.users.createdAt))
            .limit(take)
            .offset(skip);
    }
    async findOne(id) {
        const [user] = await database_1.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id))
            .limit(1);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByTelegramId(telegramId) {
        const [user] = await database_1.db
            .select()
            .from(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.telegramId, telegramId))
            .limit(1);
        if (!user) {
            throw new common_1.NotFoundException(`User with Telegram ID ${telegramId} not found`);
        }
        return user;
    }
    async update(id, updateUserDto) {
        await this.findOne(id);
        const [updatedUser] = await database_1.db
            .update(database_1.users)
            .set({
            ...updateUserDto,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id))
            .returning();
        return updatedUser;
    }
    async remove(id) {
        await this.findOne(id);
        const [deletedUser] = await database_1.db
            .delete(database_1.users)
            .where((0, drizzle_orm_1.eq)(database_1.users.id, id))
            .returning();
        return deletedUser;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UsersService);
//# sourceMappingURL=users.service.js.map