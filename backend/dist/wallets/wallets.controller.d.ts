import { WalletsService } from './wallets.service';
import { DepositDto } from './dto/deposit.dto';
import { Wallet, Transaction } from '../database';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    findAll(limit?: string, offset?: string): Promise<Wallet[]>;
    getWallet(userId: string): Promise<Wallet>;
    getBalance(userId: string): Promise<{
        formatted: {
            available: string;
            locked: string;
            total: string;
        };
        available: number;
        locked: number;
        total: number;
    }>;
    deposit(userId: string, depositDto: DepositDto): Promise<{
        wallet: Wallet;
        deposit: {
            amount: number;
            description?: string;
        };
    }>;
    withdraw(userId: string, withdrawDto: DepositDto): Promise<{
        wallet: Wallet;
        withdrawal: {
            amount: number;
            description?: string;
        };
    }>;
    findById(id: string): Promise<Wallet>;
    getTransactions(userId: string, limit?: string, offset?: string): Promise<Transaction[]>;
    private isValidUUID;
}
