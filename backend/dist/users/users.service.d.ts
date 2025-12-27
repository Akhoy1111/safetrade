import { type User } from '../database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    constructor();
    private generateReferralCode;
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(skip?: number, take?: number): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByTelegramId(telegramId: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<User>;
}
