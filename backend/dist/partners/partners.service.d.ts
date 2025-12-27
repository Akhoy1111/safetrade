import { type Partner } from '../database';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
export declare class PartnersService {
    private generateApiKey;
    create(createPartnerDto: CreatePartnerDto): Promise<Partner>;
    findAll(): Promise<Partner[]>;
    findOne(id: string): Promise<Partner>;
    findByApiKey(apiKey: string): Promise<Partner>;
    update(id: string, updatePartnerDto: UpdatePartnerDto): Promise<Partner>;
    remove(id: string): Promise<Partner>;
    addCredit(id: string, amount: number, description?: string): Promise<{
        partner: Partner;
        newBalance: string;
        lowBalanceWarning: boolean;
    }>;
    deductCredit(id: string, amount: number, description?: string): Promise<{
        partner: Partner;
        newBalance: string;
        lowBalanceWarning: boolean;
    }>;
    checkBalance(id: string): Promise<{
        balance: string;
        balanceFloat: number;
    }>;
    hasBalance(id: string, requiredAmount: number): Promise<boolean>;
}
