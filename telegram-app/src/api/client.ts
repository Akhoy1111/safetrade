// src/api/client.ts
// API client for SafeTrade backend

import axios, { type AxiosInstance } from 'axios';
import type { 
  Product, 
  ProductsResponse, 
  User, 
  Wallet, 
  WalletBalance, 
  Order, 
  Transaction,
  Category 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class SafeTradeAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ============================================
  // PRODUCTS
  // ============================================

  async getProducts(params?: {
    category?: string;
    region?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductsResponse> {
    const { data } = await this.client.get('/products', { params });
    return data;
  }

  async getProduct(sku: string): Promise<Product> {
    const { data } = await this.client.get(`/products/${sku}`);
    return data;
  }

  async getCategories(): Promise<Category[]> {
    const { data } = await this.client.get('/products/categories');
    return data;
  }

  // ============================================
  // USERS
  // ============================================

  async getUser(userId: string): Promise<User> {
    const { data } = await this.client.get(`/users/${userId}`);
    return data;
  }

  async getUserByTelegramId(telegramId: string): Promise<User> {
    const { data } = await this.client.get(`/users/telegram/${telegramId}`);
    return data;
  }

  async createUser(userData: {
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    const { data } = await this.client.post('/users', userData);
    return data;
  }

  // ============================================
  // WALLETS
  // ============================================

  async getWallet(userId: string): Promise<Wallet> {
    const { data } = await this.client.get(`/wallets/user/${userId}`);
    return data;
  }

  async getWalletBalance(userId: string): Promise<WalletBalance> {
    const { data } = await this.client.get(`/wallets/user/${userId}/balance`);
    return data;
  }

  async getTransactions(userId: string, limit = 20, offset = 0): Promise<Transaction[]> {
    const { data } = await this.client.get(`/wallets/user/${userId}/transactions`, {
      params: { limit, offset },
    });
    return data;
  }

  // ============================================
  // ORDERS
  // ============================================

  async createOrder(orderData: {
    productSku: string;
    quantity?: number;
    userId: string;
  }): Promise<Order> {
    const { data} = await this.client.post('/orders', orderData);
    return data;
  }

  async getOrder(orderId: string): Promise<Order> {
    const { data } = await this.client.get(`/orders/${orderId}`);
    return data;
  }

  async getOrders(userId?: string): Promise<Order[]> {
    const { data } = await this.client.get('/orders', {
      params: userId ? { userId } : undefined,
    });
    return data;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data } = await this.client.get(`/orders/user/${userId}`);
    return data;
  }
}

export const api = new SafeTradeAPI();
export default api;

