export declare class CreateOrderDto {
    productSku: string;
    quantity?: number;
    partnerId?: string;
    userId?: string;
    static validate(dto: CreateOrderDto): {
        valid: boolean;
        error?: string;
    };
}
