#!/bin/bash
# Seed Phase 1 Products - SafeTrade Product Catalog
# Based on MASTER-PLAN.md Section 5: Product Strategy

BASE_URL="http://localhost:3000/api"

echo "
╔══════════════════════════════════════════════════════════════╗
║         🌱 SEEDING PHASE 1 PRODUCTS                          ║
╚══════════════════════════════════════════════════════════════╝
"

# Check if server is running
if ! curl -s "${BASE_URL}/products" > /dev/null 2>&1; then
  echo "❌ Error: Server not running at ${BASE_URL}"
  echo "Start the server with: npm run start:dev"
  exit 1
fi

echo "✅ Server is running"
echo ""

# Counter for success/failure
SUCCESS=0
FAILED=0

# Function to add product
add_product() {
  local sku=$1
  local name=$2
  local cost=$3
  local retail=$4
  local category=$5
  local region=$6
  
  echo -n "Adding ${sku}... "
  
  RESPONSE=$(curl -s -X POST "${BASE_URL}/products" \
    -H "Content-Type: application/json" \
    -d "{
      \"productSku\": \"${sku}\",
      \"productName\": \"${name}\",
      \"bitrefillCost\": ${cost},
      \"usRetailPrice\": ${retail},
      \"category\": \"${category}\",
      \"region\": \"${region}\"
    }")
  
  if echo "$RESPONSE" | jq -e '.productSku' > /dev/null 2>&1; then
    echo "✅"
    ((SUCCESS++))
  else
    echo "❌"
    echo "$RESPONSE" | jq '.'
    ((FAILED++))
  fi
}

echo "═══════════════════════════════════════"
echo "📺 STREAMING SERVICES (Turkey)"
echo "═══════════════════════════════════════"
echo ""

add_product "netflix-turkey-standard" "Netflix Turkey Standard Plan Gift Card" 5.50 15.49 "streaming" "turkey"
add_product "netflix-turkey-premium" "Netflix Turkey Premium Plan Gift Card" 8.50 22.99 "streaming" "turkey"
add_product "spotify-turkey-individual" "Spotify Turkey Individual Subscription" 2.10 11.99 "streaming" "turkey"
add_product "spotify-turkey-family" "Spotify Turkey Family Subscription" 3.20 16.99 "streaming" "turkey"
add_product "youtube-turkey-individual" "YouTube Premium Turkey Individual" 2.80 13.99 "streaming" "turkey"
add_product "youtube-turkey-family" "YouTube Premium Turkey Family" 4.25 22.99 "streaming" "turkey"
add_product "disney-turkey-monthly" "Disney+ Turkey Monthly Subscription" 4.00 10.99 "streaming" "turkey"

echo ""
echo "═══════════════════════════════════════"
echo "🎮 GAMING (Turkey)"
echo "═══════════════════════════════════════"
echo ""

add_product "steam-turkey-50" "Steam Turkey 50 TRY Wallet Code" 2.15 5.00 "gaming" "turkey"
add_product "steam-turkey-100" "Steam Turkey 100 TRY Wallet Code" 4.25 10.00 "gaming" "turkey"
add_product "steam-turkey-200" "Steam Turkey 200 TRY Wallet Code" 8.50 20.00 "gaming" "turkey"
add_product "psn-turkey-100" "PlayStation Network Turkey 100 TRY" 4.50 10.00 "gaming" "turkey"
add_product "psn-turkey-250" "PlayStation Network Turkey 250 TRY" 11.00 25.00 "gaming" "turkey"
add_product "xbox-turkey-100" "Xbox Live Turkey 100 TRY" 4.50 10.00 "gaming" "turkey"

echo ""
echo "═══════════════════════════════════════"
echo "📱 APP STORES (Turkey)"
echo "═══════════════════════════════════════"
echo ""

add_product "google-play-turkey-100" "Google Play Turkey 100 TRY Gift Card" 4.20 10.00 "app_store" "turkey"
add_product "apple-turkey-100" "App Store & iTunes Turkey 100 TRY" 4.40 10.00 "app_store" "turkey"

echo ""
echo "═══════════════════════════════════════"
echo "📊 SEEDING SUMMARY"
echo "═══════════════════════════════════════"
echo ""
echo "✅ Successfully added: ${SUCCESS} products"
echo "❌ Failed: ${FAILED} products"
echo ""

# Verify total count
echo "Verifying product count..."
TOTAL=$(curl -s "${BASE_URL}/products" | jq '.total')
echo "📦 Total products in catalog: ${TOTAL}"

if [ "$TOTAL" -ge 20 ]; then
  echo ""
  echo "
╔══════════════════════════════════════════════════════════════╗
║     🎉 PHASE 1 PRODUCTS SEEDED SUCCESSFULLY! 🚀              ║
╚══════════════════════════════════════════════════════════════╝
  "
else
  echo "⚠️ Warning: Expected at least 20 products, but found ${TOTAL}"
fi

echo ""
echo "View products by category:"
echo "  curl ${BASE_URL}/products?category=streaming | jq '.products | length'"
echo "  curl ${BASE_URL}/products?category=gaming | jq '.products | length'"
echo "  curl ${BASE_URL}/products?category=app_store | jq '.products | length'"
echo ""

