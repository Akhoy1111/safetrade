"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treasuryWallets = exports.giftCardPurchases = exports.webhookDeliveries = exports.productPricing = exports.transactions = exports.orders = exports.partners = exports.wallets = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    telegramId: (0, pg_core_1.varchar)('telegram_id', { length: 50 }).notNull().unique(),
    username: (0, pg_core_1.varchar)('username', { length: 255 }),
    firstName: (0, pg_core_1.varchar)('first_name', { length: 255 }),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 255 }),
    kycLevel: (0, pg_core_1.integer)('kyc_level').default(1).notNull(),
    kycStatus: (0, pg_core_1.varchar)('kyc_status', { length: 20 }),
    referralCode: (0, pg_core_1.varchar)('referral_code', { length: 20 }).unique(),
    referredBy: (0, pg_core_1.uuid)('referred_by'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.wallets = (0, pg_core_1.pgTable)('wallets', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().unique()
        .references(() => exports.users.id),
    tonAddress: (0, pg_core_1.varchar)('ton_address', { length: 255 }),
    tonMnemonic: (0, pg_core_1.text)('ton_mnemonic'),
    usdtBalance: (0, pg_core_1.decimal)('usdt_balance', { precision: 18, scale: 6 })
        .default('0').notNull(),
    lockedBalance: (0, pg_core_1.decimal)('locked_balance', { precision: 18, scale: 6 })
        .default('0').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.partners = (0, pg_core_1.pgTable)('partners', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    apiKey: (0, pg_core_1.varchar)('api_key', { length: 255 }).notNull().unique(),
    creditBalance: (0, pg_core_1.decimal)('credit_balance', { precision: 18, scale: 6 })
        .default('0').notNull(),
    webhookUrl: (0, pg_core_1.text)('webhook_url'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.orders = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    partnerId: (0, pg_core_1.uuid)('partner_id')
        .references(() => exports.partners.id),
    userId: (0, pg_core_1.uuid)('user_id')
        .references(() => exports.users.id),
    productSku: (0, pg_core_1.varchar)('product_sku', { length: 100 }).notNull(),
    productName: (0, pg_core_1.varchar)('product_name', { length: 255 }).notNull(),
    faceValue: (0, pg_core_1.decimal)('face_value', { precision: 18, scale: 2 }).notNull(),
    paidAmount: (0, pg_core_1.decimal)('paid_amount', { precision: 18, scale: 6 }).notNull(),
    costAmount: (0, pg_core_1.decimal)('cost_amount', { precision: 18, scale: 6 }),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('PENDING').notNull(),
    giftCardCode: (0, pg_core_1.text)('gift_card_code'),
    externalOrderId: (0, pg_core_1.varchar)('external_order_id', { length: 100 }),
    paymentTxHash: (0, pg_core_1.varchar)('payment_tx_hash', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    deliveredAt: (0, pg_core_1.timestamp)('delivered_at'),
});
exports.transactions = (0, pg_core_1.pgTable)('transactions', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id').notNull()
        .references(() => exports.users.id),
    type: (0, pg_core_1.varchar)('type', { length: 30 }).notNull(),
    amount: (0, pg_core_1.decimal)('amount', { precision: 18, scale: 6 }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 10 }).default('USDT').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('PENDING').notNull(),
    txHash: (0, pg_core_1.varchar)('tx_hash', { length: 255 }),
    metadata: (0, pg_core_1.json)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.productPricing = (0, pg_core_1.pgTable)('product_pricing', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    productSku: (0, pg_core_1.varchar)('product_sku', { length: 100 }).notNull().unique(),
    productName: (0, pg_core_1.varchar)('product_name', { length: 255 }).notNull(),
    category: (0, pg_core_1.varchar)('category', { length: 50 }),
    region: (0, pg_core_1.varchar)('region', { length: 20 }),
    bitrefillCost: (0, pg_core_1.decimal)('bitrefill_cost', { precision: 10, scale: 2 }).notNull(),
    usRetailPrice: (0, pg_core_1.decimal)('us_retail_price', { precision: 10, scale: 2 }),
    b2cPrice: (0, pg_core_1.decimal)('b2c_price', { precision: 10, scale: 2 }).notNull(),
    b2bPrice: (0, pg_core_1.decimal)('b2b_price', { precision: 10, scale: 2 }).notNull(),
    marginPercent: (0, pg_core_1.decimal)('margin_percent', { precision: 5, scale: 2 }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    lastSynced: (0, pg_core_1.timestamp)('last_synced'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.webhookDeliveries = (0, pg_core_1.pgTable)('webhook_deliveries', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    partnerId: (0, pg_core_1.uuid)('partner_id')
        .references(() => exports.partners.id),
    orderId: (0, pg_core_1.uuid)('order_id')
        .references(() => exports.orders.id),
    eventType: (0, pg_core_1.varchar)('event_type', { length: 50 }).notNull(),
    payload: (0, pg_core_1.jsonb)('payload').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('pending').notNull(),
    attempts: (0, pg_core_1.integer)('attempts').default(0).notNull(),
    lastAttempt: (0, pg_core_1.timestamp)('last_attempt'),
    deliveredAt: (0, pg_core_1.timestamp)('delivered_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.giftCardPurchases = (0, pg_core_1.pgTable)('gift_card_purchases', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)('user_id').notNull()
        .references(() => exports.users.id),
    merchant: (0, pg_core_1.varchar)('merchant', { length: 100 }).notNull(),
    productName: (0, pg_core_1.varchar)('product_name', { length: 255 }).notNull(),
    productSku: (0, pg_core_1.varchar)('product_sku', { length: 100 }),
    country: (0, pg_core_1.varchar)('country', { length: 5 }).default('TR').notNull(),
    faceValue: (0, pg_core_1.decimal)('face_value', { precision: 18, scale: 2 }).notNull(),
    faceValueCurrency: (0, pg_core_1.varchar)('face_value_currency', { length: 10 })
        .default('TRY').notNull(),
    paidAmount: (0, pg_core_1.decimal)('paid_amount', { precision: 18, scale: 6 }).notNull(),
    bitrefillCost: (0, pg_core_1.decimal)('bitrefill_cost', { precision: 18, scale: 6 }),
    markupPercent: (0, pg_core_1.decimal)('markup_percent', { precision: 5, scale: 2 }),
    giftCardCode: (0, pg_core_1.text)('gift_card_code'),
    giftCardPin: (0, pg_core_1.varchar)('gift_card_pin', { length: 50 }),
    redemptionUrl: (0, pg_core_1.text)('redemption_url'),
    instructions: (0, pg_core_1.text)('instructions'),
    externalOrderId: (0, pg_core_1.varchar)('external_order_id', { length: 100 }),
    paymentTxHash: (0, pg_core_1.varchar)('payment_tx_hash', { length: 255 }),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('PENDING').notNull(),
    errorMessage: (0, pg_core_1.text)('error_message'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    deliveredAt: (0, pg_core_1.timestamp)('delivered_at'),
});
exports.treasuryWallets = (0, pg_core_1.pgTable)('treasury_wallets', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 50 }).notNull().unique(),
    tonAddress: (0, pg_core_1.varchar)('ton_address', { length: 255 }).notNull(),
    tonMnemonic: (0, pg_core_1.text)('ton_mnemonic').notNull(),
    balance: (0, pg_core_1.decimal)('balance', { precision: 18, scale: 6 })
        .default('0').notNull(),
    minBalance: (0, pg_core_1.decimal)('min_balance', { precision: 18, scale: 6 })
        .default('100').notNull(),
    maxBalance: (0, pg_core_1.decimal)('max_balance', { precision: 18, scale: 6 })
        .default('50000').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    lastCheckedAt: (0, pg_core_1.timestamp)('last_checked_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
//# sourceMappingURL=schema.js.map