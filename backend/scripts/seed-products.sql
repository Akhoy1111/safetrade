-- Seed products for SafeTrade catalog
-- Based on Master Plan v3.0: Focus on Turkey streaming/gaming

-- Streaming products (Turkey region - 80% focus)
INSERT INTO product_pricing (product_sku, product_name, category, region, bitrefill_cost, us_retail_price, b2c_price, b2b_price, margin_percent, is_active, created_at, updated_at)
VALUES
  ('netflix-turkey-200', 'Netflix Turkey 200 TRY Gift Card', 'streaming', 'turkey', 8.50, 22.99, 12.64, 11.50, 32.8, true, NOW(), NOW()),
  ('spotify-turkey-50', 'Spotify Turkey 50 TRY Gift Card', 'streaming', 'turkey', 2.10, 5.68, 3.12, 2.84, 32.7, true, NOW(), NOW()),
  ('youtube-premium-turkey-100', 'YouTube Premium Turkey 100 TRY', 'streaming', 'turkey', 4.25, 11.49, 6.32, 5.75, 32.8, true, NOW(), NOW()),
  ('apple-music-turkey-100', 'Apple Music Turkey 100 TRY Gift Card', 'streaming', 'turkey', 4.20, 11.35, 6.24, 5.68, 32.7, true, NOW(), NOW());

-- Gaming products (Turkey region)
INSERT INTO product_pricing (product_sku, product_name, category, region, bitrefill_cost, us_retail_price, b2c_price, b2b_price, margin_percent, is_active, created_at, updated_at)
VALUES
  ('steam-turkey-100', 'Steam Turkey 100 TRY Wallet Code', 'gaming', 'turkey', 4.25, 11.49, 6.32, 5.75, 32.8, true, NOW(), NOW()),
  ('steam-turkey-500', 'Steam Turkey 500 TRY Wallet Code', 'gaming', 'turkey', 21.25, 57.43, 31.59, 28.72, 32.7, true, NOW(), NOW()),
  ('playstation-turkey-200', 'PlayStation Turkey 200 TRY PSN Card', 'gaming', 'turkey', 8.50, 22.99, 12.64, 11.50, 32.8, true, NOW(), NOW());

-- US products (smaller focus)
INSERT INTO product_pricing (product_sku, product_name, category, region, bitrefill_cost, us_retail_price, b2c_price, b2b_price, margin_percent, is_active, created_at, updated_at)
VALUES
  ('amazon-us-50', 'Amazon.com $50 USD Gift Card', 'retail', 'us', 48.50, 50.00, 27.50, 25.00, 43.6, true, NOW(), NOW()),
  ('netflix-us-50', 'Netflix USA $50 Gift Card', 'streaming', 'us', 48.50, 50.00, 27.50, 25.00, 43.6, true, NOW(), NOW());

