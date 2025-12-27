import { type Wallet, type Transaction } from '../database';
export declare class WalletsService {
    getWallet(userId: string): Promise<Wallet>;
    createWallet(userId: string): Promise<Wallet>;
    getBalance(userId: string): Promise<{
        available: number;
        locked: number;
        total: number;
    }>;
    hasBalance(userId: string, amount: number): Promise<boolean>;
    addBalance(userId: string, amount: number, description?: string, txHash?: string): Promise<Wallet>;
    deductBalance(userId: string, amount: number, description?: string, orderId?: string): Promise<Wallet>;
    lockBalance(userId: string, amount: number): Promise<Wallet>;
    unlockBalance(userId: string, amount: number): Promise<Wallet>;
    releaseLocked(userId: string, amount: number): Promise<Wallet>;
    findById(walletId: string): Promise<Wallet>;
    findAll(limit?: number, offset?: number): Promise<Wallet[]>;
    getTransactions(userId: string, limit?: number, offset?: number): Promise<Transaction[]>;
    private generateMockTonAddress;
}
