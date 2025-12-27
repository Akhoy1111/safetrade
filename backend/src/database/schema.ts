// src/database/schema.ts
// SafeTrade Database Schema v2.1 - Drizzle ORM
// All tables use UUID primary keys for security (non-guessable, non-enumerable)

import { pgTable, uuid, varchar, text, decimal, boolean, timestamp, json, jsonb, integer } from 'drizzle-orm/pg-core';

// ============================================
// USERS TABLE
// ============================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  telegramId: varchar('telegram_id', { length: 50 }).notNull().unique(),
  username: varchar('username', { length: 255 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  
  kycLevel: integer('kyc_level').default(1).notNull(),
  kycStatus: varchar('kyc_status', { length: 20 }),
  
  referralCode: varchar('referral_code', { length: 20 }).unique(),
  referredBy: uuid('referred_by'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// WALLETS TABLE (USDT only - simplified!)
// ============================================

export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique()
    .references(() => users.id),
  
  tonAddress: varchar('ton_address', { length: 255 }),
  tonMnemonic: text('ton_mnemonic'), // Encrypted!
  
  usdtBalance: decimal('usdt_balance', { precision: 18, scale: 6 })
    .default('0').notNull(),
  lockedBalance: decimal('locked_balance', { precision: 18, scale: 6 })
    .default('0').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// PARTNERS TABLE (B2B API - NEW!)
// ============================================

export const partners = pgTable('partners', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  apiKey: varchar('api_key', { length: 255 }).notNull().unique(),
  
  // Prepaid credit balance
  creditBalance: decimal('credit_balance', { precision: 18, scale: 6 })
    .default('0').notNull(),
  
  webhookUrl: text('webhook_url'),
  isActive: boolean('is_active').default(true).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// ORDERS TABLE (Both B2B + B2C)
// ============================================

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // NULL = B2C direct order
  partnerId: uuid('partner_id')
    .references(() => partners.id),
  
  // NULL = B2B partner order
  userId: uuid('user_id')
    .references(() => users.id),
  
  productSku: varchar('product_sku', { length: 100 }).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  
  faceValue: decimal('face_value', { precision: 18, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 18, scale: 6 }).notNull(),
  costAmount: decimal('cost_amount', { precision: 18, scale: 6 }),
  
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  
  giftCardCode: text('gift_card_code'),
  externalOrderId: varchar('external_order_id', { length: 100 }),
  paymentTxHash: varchar('payment_tx_hash', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deliveredAt: timestamp('delivered_at'),
});

// ============================================
// TRANSACTIONS TABLE
// ============================================

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull()
    .references(() => users.id),
  
  type: varchar('type', { length: 30 }).notNull(),
  amount: decimal('amount', { precision: 18, scale: 6 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('USDT').notNull(),
  
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  txHash: varchar('tx_hash', { length: 255 }),
  
  metadata: json('metadata'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// PRODUCT PRICING TABLE (Value-based pricing)
// ============================================

export const productPricing = pgTable('product_pricing', {
  id: uuid('id').defaultRandom().primaryKey(),
  productSku: varchar('product_sku', { length: 100 }).notNull().unique(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }), // streaming, gaming, esim, vpn, software
  region: varchar('region', { length: 20 }), // turkey, us, global
  bitrefillCost: decimal('bitrefill_cost', { precision: 10, scale: 2 }).notNull(),
  usRetailPrice: decimal('us_retail_price', { precision: 10, scale: 2 }),
  b2cPrice: decimal('b2c_price', { precision: 10, scale: 2 }).notNull(),
  b2bPrice: decimal('b2b_price', { precision: 10, scale: 2 }).notNull(),
  marginPercent: decimal('margin_percent', { precision: 5, scale: 2 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastSynced: timestamp('last_synced'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// WEBHOOK DELIVERIES TABLE (Partner notifications)
// ============================================

export const webhookDeliveries = pgTable('webhook_deliveries', {
  id: uuid('id').defaultRandom().primaryKey(),
  partnerId: uuid('partner_id')
    .references(() => partners.id),
  orderId: uuid('order_id')
    .references(() => orders.id),
  eventType: varchar('event_type', { length: 50 }).notNull(), // order.created, order.fulfilled, order.failed
  payload: jsonb('payload').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, delivered, failed
  attempts: integer('attempts').default(0).notNull(),
  lastAttempt: timestamp('last_attempt'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// DEPRECATED: P2P marketplace removed in v3.0 - partners handle fiat
// ============================================

// export const p2pOrders = pgTable('p2p_orders', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   
//   creatorId: uuid('creator_id').notNull()
//     .references(() => users.id),
//   acceptorId: uuid('acceptor_id')
//     .references(() => users.id),
//   
//   type: varchar('type', { length: 10 }).notNull(),
//   
//   assetAmount: decimal('asset_amount', { precision: 18, scale: 6 }).notNull(),
//   assetCurrency: varchar('asset_currency', { length: 10 }).default('USDT').notNull(),
//   
//   fiatAmount: decimal('fiat_amount', { precision: 18, scale: 2 }).notNull(),
//   fiatCurrency: varchar('fiat_currency', { length: 10 }).notNull(),
//   rate: decimal('rate', { precision: 18, scale: 4 }).notNull(),
//   
//   paymentMethod: varchar('payment_method', { length: 50 }),
//   paymentDetails: json('payment_details'),
//   
//   status: varchar('status', { length: 20 }).default('OPEN').notNull(),
//   
//   escrowTxHash: varchar('escrow_tx_hash', { length: 255 }),
//   
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   completedAt: timestamp('completed_at'),
// });

// ============================================
// GIFT CARD PURCHASES TABLE (Deprecated - use orders)
// ============================================

export const giftCardPurchases = pgTable('gift_card_purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull()
    .references(() => users.id),
  
  merchant: varchar('merchant', { length: 100 }).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productSku: varchar('product_sku', { length: 100 }),
  country: varchar('country', { length: 5 }).default('TR').notNull(),
  
  faceValue: decimal('face_value', { precision: 18, scale: 2 }).notNull(),
  faceValueCurrency: varchar('face_value_currency', { length: 10 })
    .default('TRY').notNull(),
  paidAmount: decimal('paid_amount', { precision: 18, scale: 6 }).notNull(),
  bitrefillCost: decimal('bitrefill_cost', { precision: 18, scale: 6 }),
  markupPercent: decimal('markup_percent', { precision: 5, scale: 2 }),
  
  giftCardCode: text('gift_card_code'),
  giftCardPin: varchar('gift_card_pin', { length: 50 }),
  redemptionUrl: text('redemption_url'),
  instructions: text('instructions'),
  
  externalOrderId: varchar('external_order_id', { length: 100 }),
  paymentTxHash: varchar('payment_tx_hash', { length: 255 }),
  
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  errorMessage: text('error_message'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deliveredAt: timestamp('delivered_at'),
});

// ============================================
// TREASURY WALLETS TABLE (USDT only!)
// ============================================

export const treasuryWallets = pgTable('treasury_wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  name: varchar('name', { length: 50 }).notNull().unique(),
  
  tonAddress: varchar('ton_address', { length: 255 }).notNull(),
  tonMnemonic: text('ton_mnemonic').notNull(), // Encrypted!
  
  balance: decimal('balance', { precision: 18, scale: 6 })
    .default('0').notNull(),
  
  minBalance: decimal('min_balance', { precision: 18, scale: 6 })
    .default('100').notNull(),
  maxBalance: decimal('max_balance', { precision: 18, scale: 6 })
    .default('50000').notNull(),
  
  isActive: boolean('is_active').default(true).notNull(),
  
  lastCheckedAt: timestamp('last_checked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// TYPE EXPORTS
// ============================================

// Export TypeScript types inferred from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;

export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type ProductPricing = typeof productPricing.$inferSelect;
export type NewProductPricing = typeof productPricing.$inferInsert;

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type NewWebhookDelivery = typeof webhookDeliveries.$inferInsert;

// export type P2POrder = typeof p2pOrders.$inferSelect;
// export type NewP2POrder = typeof p2pOrders.$inferInsert;

export type GiftCardPurchase = typeof giftCardPurchases.$inferSelect;
export type NewGiftCardPurchase = typeof giftCardPurchases.$inferInsert;

export type TreasuryWallet = typeof treasuryWallets.$inferSelect;
export type NewTreasuryWallet = typeof treasuryWallets.$inferInsert;

