export interface BitrefillProduct {
    sku: string;
    name: string;
    cost: number;
    faceValue: number;
    currency: string;
    region?: string;
}
export interface BitrefillOrderResponse {
    orderId: string;
    productSku: string;
    quantity: number;
    giftCardCode: string;
    status: string;
}
export declare class BitrefillService {
    private readonly mockProducts;
    getProduct(sku: string): Promise<BitrefillProduct | null>;
    placeOrder(sku: string, quantity?: number): Promise<BitrefillOrderResponse>;
    private generateMockCode;
    private generateUUID;
    private delay;
    getAvailableProducts(): Promise<BitrefillProduct[]>;
}
