// src/pages/ProductDetailPage.tsx
// Product detail and purchase page

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import { useStore } from '../store/useStore';
import type { Product } from '../types';
import { haptic, showBackButton, hideBackButton, showMainButton, hideMainButton, showAlert } from '../utils/telegram';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { sku } = useParams<{ sku: string }>();
  const { user, balance, setCurrentOrder, addOrder } = useStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (sku) {
      loadProduct();
    }
    
    showBackButton(() => navigate(-1));
    
    return () => {
      hideBackButton();
      hideMainButton();
    };
  }, [sku]);

  useEffect(() => {
    if (product) {
      showMainButton('Purchase', handlePurchase);
    }
  }, [product]);

  const loadProduct = async () => {
    if (!sku) return;
    
    setLoading(true);
    try {
      const data = await api.getProduct(sku);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
      showAlert('Failed to load product');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!product || !user || !balance) return;
    
    const price = parseFloat(product.b2cPrice);
    
    if (balance.available < price) {
      haptic.error();
      showAlert('Insufficient balance. Please top up your wallet.');
      return;
    }

    setPurchasing(true);
    haptic.medium();
    
    try {
      const order = await api.createOrder({
        productSku: product.productSku,
        quantity: 1,
        userId: user.id,
      });
      
      haptic.success();
      setCurrentOrder(order);
      addOrder(order);
      
      navigate(`/order/${order.id}`);
    } catch (error: any) {
      haptic.error();
      showAlert(error.response?.data?.message || 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const calculateSavings = () => {
    if (!product) return 0;
    const price = parseFloat(product.b2cPrice);
    const retail = parseFloat(product.usRetailPrice);
    return Math.round(((retail - price) / retail) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center">
        <div className="text-telegram-hint">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-telegram-bg pb-32">
      {/* Product Image Placeholder */}
      <div className="bg-gradient-to-br from-telegram-button to-blue-600 p-12 text-center text-white">
        <div className="text-6xl mb-4">
          {product.category === 'streaming' && '📺'}
          {product.category === 'gaming' && '🎮'}
          {product.category === 'app_store' && '📱'}
          {product.category === 'retail' && '🛍️'}
        </div>
        <div className="text-sm opacity-75 uppercase tracking-wide">
          {product.region} • {product.category}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Title & Savings Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold text-telegram-text flex-1">
            {product.productName}
          </h1>
          <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap">
            Save {calculateSavings()}%
          </div>
        </div>

        {/* Price */}
        <div className="bg-telegram-secondaryBg rounded-lg p-4 mb-4">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-telegram-text">
              ${parseFloat(product.b2cPrice).toFixed(2)}
            </span>
            <span className="text-lg line-through text-telegram-hint">
              ${parseFloat(product.usRetailPrice).toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-green-600 font-medium">
            You save ${(parseFloat(product.usRetailPrice) - parseFloat(product.b2cPrice)).toFixed(2)}!
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-telegram-text">
            <div className="text-2xl">⚡</div>
            <div>
              <div className="font-semibold">Instant Delivery</div>
              <div className="text-sm text-telegram-hint">Receive code in 10-30 seconds</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-telegram-text">
            <div className="text-2xl">🌍</div>
            <div>
              <div className="font-semibold">Works Worldwide</div>
              <div className="text-sm text-telegram-hint">Use from any country</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-telegram-text">
            <div className="text-2xl">✅</div>
            <div>
              <div className="font-semibold">100% Legal</div>
              <div className="text-sm text-telegram-hint">Official regional pricing</div>
            </div>
          </div>
        </div>

        {/* Balance Check */}
        {balance && (
          <div className={`rounded-lg p-4 mb-4 ${
            balance.available >= parseFloat(product.b2cPrice)
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            <div className="text-sm font-medium">
              {balance.available >= parseFloat(product.b2cPrice)
                ? `✓ Sufficient balance (${balance.formatted.available})`
                : `⚠ Insufficient balance (${balance.formatted.available})`
              }
            </div>
          </div>
        )}

        {/* How to Redeem */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📝 How to Redeem</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Purchase the gift card</li>
            <li>Receive your unique code</li>
            <li>Go to the platform's redemption page</li>
            <li>Enter your code and enjoy!</li>
          </ol>
        </div>
      </div>

      {/* Purchase Button (handled by Telegram MainButton) */}
      {purchasing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="text-4xl mb-3">⏳</div>
              <div className="font-semibold text-lg mb-2">Processing...</div>
              <div className="text-sm text-gray-600">Please wait</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

