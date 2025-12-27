// src/pages/OrderDetailPage.tsx
// Order detail page with gift card code

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import type { Order } from '../types';
import { haptic, showBackButton, hideBackButton, showAlert } from '../utils/telegram';

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
    
    showBackButton(() => navigate('/orders'));
    
    return () => {
      hideBackButton();
    };
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const data = await api.getOrder(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order:', error);
      showAlert('Failed to load order');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    haptic.success();
    showAlert('Code copied to clipboard!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '✅';
      case 'PENDING':
        return '⏳';
      case 'PROCESSING':
        return '⚙️';
      case 'FAILED':
        return '❌';
      case 'REFUNDED':
        return '↩️';
      default:
        return '📦';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center">
        <div className="text-telegram-hint">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-telegram-bg pb-20">
      {/* Header */}
      <div className="bg-telegram-button text-telegram-buttonText p-6">
        <div className="text-5xl mb-3">{getStatusIcon(order.status)}</div>
        <h1 className="text-2xl font-bold mb-2">Order Details</h1>
        <div className={`inline-block px-3 py-1 rounded text-sm font-bold ${getStatusColor(order.status)}`}>
          {order.status}
        </div>
      </div>

      {/* Order Info */}
      <div className="p-4 space-y-4">
        {/* Product */}
        <div className="bg-telegram-secondaryBg rounded-lg p-4">
          <div className="text-xs text-telegram-hint mb-1">Product</div>
          <div className="font-semibold text-telegram-text">{order.productName}</div>
        </div>

        {/* Gift Card Code */}
        {order.status === 'COMPLETED' && order.giftCardCode && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-xs text-green-700 mb-2 font-medium">🎉 Your Gift Card Code</div>
            <div className="bg-white rounded-lg p-4 mb-3">
              <div className="font-mono text-2xl text-center font-bold text-gray-900 tracking-wider">
                {order.giftCardCode}
              </div>
            </div>
            <button
              onClick={() => copyCode(order.giftCardCode!)}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium active:scale-95 transition-transform"
            >
              📋 Copy Code
            </button>
          </div>
        )}

        {/* Failed Status */}
        {order.status === 'FAILED' && order.errorMessage && (
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-xs text-red-700 mb-1 font-medium">Error</div>
            <div className="text-sm text-red-800">{order.errorMessage}</div>
          </div>
        )}

        {/* Payment */}
        <div className="bg-telegram-secondaryBg rounded-lg p-4">
          <div className="text-xs text-telegram-hint mb-1">Amount Paid</div>
          <div className="text-2xl font-bold text-telegram-text">
            ${parseFloat(order.paidAmount).toFixed(2)}
          </div>
        </div>

        {/* Date */}
        <div className="bg-telegram-secondaryBg rounded-lg p-4">
          <div className="text-xs text-telegram-hint mb-1">Order Date</div>
          <div className="text-sm text-telegram-text">{formatDate(order.createdAt)}</div>
        </div>

        {/* Order ID */}
        <div className="bg-telegram-secondaryBg rounded-lg p-4">
          <div className="text-xs text-telegram-hint mb-1">Order ID</div>
          <div className="font-mono text-xs text-telegram-text break-all">{order.id}</div>
        </div>

        {/* Instructions */}
        {order.instructions && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-xs text-blue-700 mb-2 font-medium">📝 Redemption Instructions</div>
            <div className="text-sm text-blue-800 whitespace-pre-wrap">{order.instructions}</div>
          </div>
        )}

        {/* Redemption URL */}
        {order.redemptionUrl && (
          <a
            href={order.redemptionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-telegram-button text-telegram-buttonText text-center py-3 rounded-lg font-medium"
          >
            🌐 Go to Redemption Site
          </a>
        )}

        {/* Support */}
        <div className="text-center text-sm text-telegram-hint mt-6">
          Need help? Contact @SafeTradeSupport
        </div>
      </div>
    </div>
  );
}

