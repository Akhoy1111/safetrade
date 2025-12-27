#!/bin/bash
# Test Webhooks & Wallets Modules
# Usage: ./scripts/test-webhooks-wallets.sh

BASE_URL="http://localhost:3000/api"
USER_ID="37d793c8-b5a1-4885-9871-849c99dec672"
PARTNER_ID="7aea149c-097a-4f90-bdbb-8ffe226011a1"

echo "========================================"
echo "SafeTrade - Webhooks & Wallets Tests"
echo "========================================"
echo ""

# WALLETS TESTS
echo "=== WALLETS MODULE TESTS ==="
echo ""

echo "1. Get or create wallet for user..."
curl -s "${BASE_URL}/wallets/user/${USER_ID}" | jq '{id, tonAddress, usdtBalance}'
echo ""

echo "2. Get wallet balance..."
curl -s "${BASE_URL}/wallets/user/${USER_ID}/balance" | jq .
echo ""

echo "3. Deposit $25 to wallet..."
curl -s -X POST "${BASE_URL}/wallets/user/${USER_ID}/deposit" \
  -H "Content-Type: application/json" \
  -d '{"amount": 25, "description": "Test deposit"}' | jq '{usdtBalance: .wallet.usdtBalance, deposited: .deposit.amount}'
echo ""

echo "4. Check updated balance..."
curl -s "${BASE_URL}/wallets/user/${USER_ID}/balance" | jq .formatted
echo ""

# WEBHOOKS TESTS
echo ""
echo "=== WEBHOOKS MODULE TESTS ==="
echo ""

echo "5. Get webhook stats..."
curl -s "${BASE_URL}/webhooks/stats" | jq .
echo ""

echo "6. List recent webhooks..."
curl -s "${BASE_URL}/webhooks?limit=5" | jq '.[] | {id: .id[0:8], eventType, status, attempts}'
echo ""

echo "7. Get pending webhooks..."
curl -s "${BASE_URL}/webhooks/pending" | jq 'length'
echo ""

echo "8. Get failed webhooks..."
curl -s "${BASE_URL}/webhooks/failed" | jq 'length'
echo ""

# B2C ORDER TEST
echo ""
echo "=== B2C ORDER (WALLET PAYMENT) ==="
echo ""

echo "9. Create B2C order..."
curl -s -X POST "${BASE_URL}/orders" \
  -H "Content-Type: application/json" \
  -d "{
    \"productSku\": \"spotify-turkey-50\",
    \"quantity\": 1,
    \"userId\": \"${USER_ID}\"
  }" | jq '{id, productName, paidAmount, status}'
echo ""

echo "10. Check wallet balance after order..."
curl -s "${BASE_URL}/wallets/user/${USER_ID}/balance" | jq .formatted
echo ""

# B2B ORDER + WEBHOOK TEST
echo ""
echo "=== B2B ORDER (WEBHOOK TRIGGER) ==="
echo ""

echo "11. Create B2B order (triggers webhook)..."
curl -s -X POST "${BASE_URL}/orders" \
  -H "Content-Type: application/json" \
  -d "{
    \"productSku\": \"spotify-turkey-50\",
    \"quantity\": 1,
    \"partnerId\": \"${PARTNER_ID}\"
  }" | jq '{id, productName, status}'
echo ""

echo "12. Check webhook stats (should increase)..."
curl -s "${BASE_URL}/webhooks/stats" | jq .
echo ""

echo "========================================"
echo "All tests completed!"
echo "========================================"

