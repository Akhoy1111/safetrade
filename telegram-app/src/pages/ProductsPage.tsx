// src/pages/ProductsPage.tsx
// Products listing page with category filter

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import type { Product } from '../types';
import { haptic, showBackButton, hideBackButton } from '../utils/telegram';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || undefined;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    
    // Show back button
    showBackButton(() => navigate('/'));
    
    return () => {
      hideBackButton();
    };
  }, [category]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({ category, region: 'turkey' });
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    haptic.light();
    navigate(`/product/${product.productSku}`);
  };

  const calculateSavings = (b2cPrice: string, usRetail: string) => {
    const price = parseFloat(b2cPrice);
    const retail = parseFloat(usRetail);
    return Math.round(((retail - price) / retail) * 100);
  };

  return (
    <div className="min-h-screen bg-telegram-bg pb-20">
      {/* Header */}
      <div className="bg-telegram-button text-telegram-buttonText p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold capitalize">
          {category || 'All Products'}
        </h1>
        <p className="text-sm opacity-90 mt-1">Turkey Region - Best Prices</p>
      </div>

      {/* Products Grid */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-telegram-hint">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-telegram-hint">No products found</div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="w-full bg-telegram-secondaryBg rounded-lg p-4 text-left hover:opacity-80 transition-opacity active:scale-98"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-telegram-text">
                      {product.productName}
                    </div>
                    <div className="text-xs text-telegram-hint mt-1">
                      {product.region.toUpperCase()} • {product.category}
                    </div>
                  </div>
                  
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold ml-2">
                    Save {calculateSavings(product.b2cPrice, product.usRetailPrice)}%
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-2xl font-bold text-telegram-text">
                    ${parseFloat(product.b2cPrice).toFixed(2)}
                  </span>
                  <span className="text-sm line-through text-telegram-hint">
                    ${parseFloat(product.usRetailPrice).toFixed(2)}
                  </span>
                </div>

                <div className="mt-2 text-xs text-green-600 font-medium">
                  Instant Delivery
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

