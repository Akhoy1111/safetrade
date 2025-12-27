// src/types/index.ts
// Type definitions for SafeTrade Telegram Mini App

export interface Product {
  id: string;
  productSku: string;
  productName: string;
  category: 'streaming' | 'gaming' | 'app_store' | 'esim' | 'vpn' | 'software' | 'retail';
  region: 'turkey' | 'us' | 'eu' | 'global';
  bitrefillCost: string;
  usRetailPrice: string;
  b2cPrice: string;
  b2bPrice: string;
  marginPercent: string;
  isActive: boolean;
  lastSynced: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  kycLevel: number;
  kycStatus: string | null;
  referralCode: string;
  referredBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  tonAddress: string;
  usdtBalance: string;
  lockedBalance: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  available: number;
  locked: number;
  total: number;
  formatted: {
    available: string;
    locked: string;
    total: string;
  };
}

export interface Order {
  id: string;
  partnerId: string | null;
  userId: string | null;
  productSku: string;
  productName: string;
  faceValue: string;
  paidAmount: string;
  costAmount: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  giftCardCode: string | null;
  giftCardPin: string | null;
  redemptionUrl: string | null;
  instructions: string | null;
  externalOrderId: string | null;
  paymentTxHash: string | null;
  errorMessage: string | null;
  createdAt: string;
  deliveredAt: string | null;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'order_payment' | 'refund';
  amount: string;
  currency: string;
  status: string;
  txHash: string | null;
  metadata: {
    description?: string;
    walletId?: string;
    orderId?: string;
    previousBalance?: number;
    newBalance?: number;
  };
  createdAt: string;
}

export interface Category {
  category: string;
  count: number;
}

