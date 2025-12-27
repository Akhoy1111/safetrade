#!/bin/bash
# Test script for integrated Orders + Products modules

BASE_URL="http://localhost:3000/api"
PARTNER_ID="7aea149c-097a-4f90-bdbb-8ffe226011a1"

echo "=========================================="
echo "SafeTrade Orders + Products Integration Test"
echo "=========================================="
echo ""

# Test 1: Create B2B order with catalog product
echo "1. Create B2B Order (Netflix Turkey - from catalog)"
curl -X POST $BASE_URL/orders \
  -H "Content-Type: application/json" \
  -d "{
    \"productSku\": \"netflix-turkey-200\",
    \"quantity\": 1,
    \"partnerId\": \"$PARTNER_ID\"
  }" | jq '{id, productName, paidAmount, costAmount, status}'

echo ""
echo ""

# Test 2: Create order with multiple quantity
echo "2. Create Order with Quantity 2 (Spotify)"
curl -X POST $BASE_URL/orders \
  -H "Content-Type: application/json" \
  -d "{
    \"productSku\": \"spotify-turkey-50\",
    \"quantity\": 2,
    \"partnerId\": \"$PARTNER_ID\"
  }" | jq '{id, productName, totalPrice: .paidAmount, status}'

echo ""
echo ""

# Test 3: Try invalid product
echo "3. Test Invalid Product SKU (should fail)"
curl -X POST $BASE_URL/orders \
  -H "Content-Type: application/json" \
  -d "{
    \"productSku\": \"invalid-sku\",
    \"partnerId\": \"$PARTNER_ID\"
  }" 2>&1 | grep -o '"statusCode":[0-9]*,"message":"[^"]*"' | head -1

echo ""
echo ""

# Test 4: Get partner's orders
echo "4. Get Partner's Order History"
curl -s "$BASE_URL/orders/partner/$PARTNER_ID" | jq 'map({productName, paidAmount, status}) | .[0:2]'

echo ""
echo ""

# Test 5: Check partner balance
echo "5. Check Partner Balance (after orders)"
curl -s "$BASE_URL/partners/$PARTNER_ID/balance" | jq .

echo ""
echo ""

echo "=========================================="
echo "Integration Test Complete!"
echo "=========================================="

