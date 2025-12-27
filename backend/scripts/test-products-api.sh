#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "=========================================="
echo "SafeTrade Products API Test"
echo "=========================================="
echo ""

# Test 1: Create a product
echo "1. Create Product (Netflix Turkey)"
curl -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -d '{
    "productSku": "netflix-turkey-200",
    "productName": "Netflix Turkey 200 TRY Gift Card",
    "category": "streaming",
    "region": "turkey",
    "bitrefillCost": 8.50,
    "usRetailPrice": 22.99
  }' | jq .

echo ""
echo ""

# Test 2: Create another product
echo "2. Create Product (Spotify Turkey)"
curl -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -d '{
    "productSku": "spotify-turkey-50",
    "productName": "Spotify Turkey 50 TRY Gift Card",
    "category": "streaming",
    "region": "turkey",
    "bitrefillCost": 2.10,
    "usRetailPrice": 5.68
  }' | jq .

echo ""
echo ""

# Test 3: List all products
echo "3. List All Products"
curl -s $BASE_URL/products | jq '{total: .total, page: .page, products: .products | map({sku: .product_sku, name: .product_name, b2c: .b2c_price, b2b: .b2b_price, margin: .margin_percent})}'

echo ""
echo ""

# Test 4: Get categories
echo "4. Get Categories"
curl -s $BASE_URL/products/categories | jq .

echo ""
echo ""

# Test 5: Get single product
echo "5. Get Single Product (Netflix)"
curl -s $BASE_URL/products/netflix-turkey-200 | jq '{sku: .product_sku, name: .product_name, category: .category, cost: .bitrefill_cost, retail: .us_retail_price, b2c: .b2c_price, b2b: .b2b_price, margin: .margin_percent}'

echo ""
echo ""

# Test 6: Filter by category
echo "6. Filter by Category (streaming)"
curl -s "$BASE_URL/products?category=streaming" | jq '{total: .total, products: .products | map(.product_name)}'

echo ""
echo ""

# Test 7: Update pricing
echo "7. Update Pricing (increase cost)"
curl -X PATCH $BASE_URL/products/netflix-turkey-200/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "bitrefillCost": 8.75
  }' | jq '{sku: .product_sku, cost: .bitrefill_cost, b2c: .b2c_price, b2b: .b2b_price}'

echo ""
echo ""

echo "=========================================="
echo "Tests Complete!"
echo "=========================================="
