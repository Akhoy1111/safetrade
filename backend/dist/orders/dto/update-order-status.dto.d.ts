export declare enum OrderStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
}
