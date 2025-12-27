export interface PricingBreakdown {
    bitrefillCost: number;
    userPrice: number;
    partnerPrice: number;
    safetradeFee: number;
    safetradeMargin: number;
    userSavings: number;
    userSavingsPercent: number;
}
export declare class PricingService {
    calculatePrice(bitrefillCost: number, isPartner?: boolean): PricingBreakdown;
    getFinalPrice(bitrefillCost: number, isPartner: boolean): number;
    private round;
}
