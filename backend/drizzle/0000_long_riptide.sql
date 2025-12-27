CREATE TABLE IF NOT EXISTS "gift_card_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"merchant" varchar(100) NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_sku" varchar(100),
	"country" varchar(5) DEFAULT 'TR' NOT NULL,
	"face_value" numeric(18, 2) NOT NULL,
	"face_value_currency" varchar(10) DEFAULT 'TRY' NOT NULL,
	"paid_amount" numeric(18, 6) NOT NULL,
	"bitrefill_cost" numeric(18, 6),
	"markup_percent" numeric(5, 2),
	"gift_card_code" text,
	"gift_card_pin" varchar(50),
	"redemption_url" text,
	"instructions" text,
	"external_order_id" varchar(100),
	"payment_tx_hash" varchar(255),
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"delivered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid,
	"user_id" uuid,
	"product_sku" varchar(100) NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"face_value" numeric(18, 2) NOT NULL,
	"paid_amount" numeric(18, 6) NOT NULL,
	"cost_amount" numeric(18, 6),
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"gift_card_code" text,
	"external_order_id" varchar(100),
	"payment_tx_hash" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"delivered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"api_key" varchar(255) NOT NULL,
	"credit_balance" numeric(18, 6) DEFAULT '0' NOT NULL,
	"webhook_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partners_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_sku" varchar(100) NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"category" varchar(50),
	"region" varchar(20),
	"bitrefill_cost" numeric(10, 2) NOT NULL,
	"us_retail_price" numeric(10, 2),
	"b2c_price" numeric(10, 2) NOT NULL,
	"b2b_price" numeric(10, 2) NOT NULL,
	"margin_percent" numeric(5, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_synced" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_pricing_product_sku_unique" UNIQUE("product_sku")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(30) NOT NULL,
	"amount" numeric(18, 6) NOT NULL,
	"currency" varchar(10) DEFAULT 'USDT' NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"tx_hash" varchar(255),
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "treasury_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"ton_address" varchar(255) NOT NULL,
	"ton_mnemonic" text NOT NULL,
	"balance" numeric(18, 6) DEFAULT '0' NOT NULL,
	"min_balance" numeric(18, 6) DEFAULT '100' NOT NULL,
	"max_balance" numeric(18, 6) DEFAULT '50000' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_checked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "treasury_wallets_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_id" varchar(50) NOT NULL,
	"username" varchar(255),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"kyc_level" integer DEFAULT 1 NOT NULL,
	"kyc_status" varchar(20),
	"referral_code" varchar(20),
	"referred_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ton_address" varchar(255),
	"ton_mnemonic" text,
	"usdt_balance" numeric(18, 6) DEFAULT '0' NOT NULL,
	"locked_balance" numeric(18, 6) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"partner_id" uuid,
	"order_id" uuid,
	"event_type" varchar(50) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gift_card_purchases" ADD CONSTRAINT "gift_card_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
