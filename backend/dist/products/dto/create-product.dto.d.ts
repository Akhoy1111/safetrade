export declare enum ProductCategory {
    STREAMING = "streaming",
    GAMING = "gaming",
    APP_STORE = "app_store",
    ESIM = "esim",
    VPN = "vpn",
    SOFTWARE = "software",
    RETAIL = "retail"
}
export declare enum ProductRegion {
    TURKEY = "turkey",
    US = "us",
    EU = "eu",
    GLOBAL = "global"
}
export declare class CreateProductDto {
    productSku: string;
    productName: string;
    category?: ProductCategory;
    region?: ProductRegion;
    bitrefillCost: number;
    usRetailPrice?: number;
}
