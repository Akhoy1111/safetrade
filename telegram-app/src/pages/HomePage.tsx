// src/pages/HomePage.tsx
// Home page - Product categories and featured deals

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useStore } from '../store/useStore';
import type { Category } from '../types';
import { haptic } from '../utils/telegram';

const categoryIcons: Record<string, string> = {
  streaming: '📺',
  gaming: '🎮',
  app_store: '📱',
  esim: '🌐',
  vpn: '🔒',
  software: '💻',
  retail: '🛍️',
};

const categoryNames: Record<string, string> = {
  streaming: 'Streaming',
  gaming: 'Gaming',
  app_store: 'App Stores',
  esim: 'eSIMs',
  vpn: 'VPNs',
  software: 'Software',
  retail: 'Retail',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { balance } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    haptic.light();
    navigate(`/products?category=${category}`);
  };

  return (
    <div className="min-h-screen bg-telegram-bg">
      {/* Header */}
      <div className="bg-telegram-button text-telegram-buttonText p-6">
        <h1 className="text-2xl font-bold mb-2">SafeTrade</h1>
        <p className="text-sm opacity-90">Save 40-50% on Gift Cards</p>
        
        {/* Balance */}
        {balance && (
          <div className="mt-4 bg-white/10 rounded-lg p-3">
            <div className="text-xs opacity-75">Your Balance</div>
            <div className="text-2xl font-bold">{balance.formatted.available}</div>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-telegram-text">Categories</h2>
        
        {loading ? (
          <div className="text-center py-8 text-telegram-hint">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => handleCategoryClick(cat.category)}
                className="bg-telegram-secondaryBg rounded-lg p-4 text-left hover:opacity-80 transition-opacity active:scale-95"
              >
                <div className="text-3xl mb-2">{categoryIcons[cat.category] || '📦'}</div>
                <div className="font-semibold text-telegram-text">
                  {categoryNames[cat.category] || cat.category}
                </div>
                <div className="text-sm text-telegram-hint">{cat.count} products</div>
              </button>
            ))}
          </div>
        )}

        {/* Popular Products */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 text-telegram-text">🔥 Popular Deals</h2>
          <div className="space-y-3">
            <div className="bg-telegram-secondaryBg rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-telegram-text">Netflix Turkey</div>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                  Save 45%
                </div>
              </div>
              <div className="text-sm text-telegram-hint">Premium Plan</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-telegram-text">$12.64</span>
                <span className="text-sm line-through text-telegram-hint">$22.99</span>
              </div>
            </div>

            <div className="bg-telegram-secondaryBg rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-telegram-text">Spotify Turkey</div>
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                  Save 45%
                </div>
              </div>
              <div className="text-sm text-telegram-hint">Individual Plan</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-telegram-text">$6.59</span>
                <span className="text-sm line-through text-telegram-hint">$11.99</span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How It Works</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Browse products by category</li>
            <li>2. Select and purchase with USDT</li>
            <li>3. Receive gift card code instantly</li>
            <li>4. Redeem on the platform & enjoy!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

