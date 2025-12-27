// src/store/useStore.ts
// Global state management using Zustand

import { create } from 'zustand';
import type { User, Wallet, WalletBalance, Product, Order } from '../types';

interface AppState {
  // User state
  user: User | null;
  wallet: Wallet | null;
  balance: WalletBalance | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Product state
  selectedProduct: Product | null;
  cart: { product: Product; quantity: number } | null;
  
  // Order state
  currentOrder: Order | null;
  orders: Order[];
  
  // Actions
  setUser: (user: User | null) => void;
  setWallet: (wallet: Wallet | null) => void;
  setBalance: (balance: WalletBalance | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedProduct: (product: Product | null) => void;
  setCart: (cart: { product: Product; quantity: number } | null) => void;
  setCurrentOrder: (order: Order | null) => void;
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  clearCart: () => void;
  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  wallet: null,
  balance: null,
  isLoading: false,
  error: null,
  selectedProduct: null,
  cart: null,
  currentOrder: null,
  orders: [],

  // Actions
  setUser: (user) => set({ user }),
  setWallet: (wallet) => set({ wallet }),
  setBalance: (balance) => set({ balance }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setCart: (cart) => set({ cart }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  setOrders: (orders) => set({ orders }),
  clearCart: () => set({ cart: null, selectedProduct: null }),
  reset: () => set({
    user: null,
    wallet: null,
    balance: null,
    isLoading: false,
    error: null,
    selectedProduct: null,
    cart: null,
    currentOrder: null,
    orders: [],
  }),
}));

