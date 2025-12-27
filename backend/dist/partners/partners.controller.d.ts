import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { AdjustCreditDto } from './dto/adjust-credit.dto';
import { Partner } from '../database';
export declare class PartnersController {
    private readonly partnersService;
    constructor(partnersService: PartnersService);
    create(createPartnerDto: CreatePartnerDto): Promise<Partner>;
    findAll(): Promise<Partner[]>;
    findOne(id: string): Promise<Partner>;
    update(id: string, updatePartnerDto: UpdatePartnerDto): Promise<Partner>;
    remove(id: string): Promise<Partner>;
    addCredit(id: string, adjustCreditDto: AdjustCreditDto): Promise<{
        success: boolean;
        partner: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            apiKey: string;
            creditBalance: string;
            webhookUrl: string | null;
            isActive: boolean;
        };
        newBalance: string;
        message: string;
    }>;
    deductCredit(id: string, adjustCreditDto: AdjustCreditDto): Promise<{
        success: boolean;
        partner: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            apiKey: string;
            creditBalance: string;
            webhookUrl: string | null;
            isActive: boolean;
        };
        newBalance: string;
        lowBalanceWarning: boolean;
        message: string;
    }>;
    getBalance(id: string): Promise<{
        balance: string;
        balanceFloat: number;
        formatted: string;
    }>;
    private isValidUUID;
}
