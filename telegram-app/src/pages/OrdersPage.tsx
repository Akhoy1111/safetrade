// src/pages/OrdersPage.tsx
// Orders history page

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useStore } from '../store/useStore';
import type { Order } from '../types';
import { showBackButton, hideBackButton } from '../utils/telegram';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
    
    showBackButton(() => navigate('/'));
    
    return () => {
      hideBackButton();
    };
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await api.getUserOrders(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-telegram-bg pb-20">
      {/* Header */}
      <div className="bg-telegram-button text-telegram-buttonText p-4">
        <h1 className="text-xl font-bold">My Orders</h1>
        <p className="text-sm opacity-90 mt-1">Order history and gift codes</p>
      </div>

      {/* Orders List */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-telegram-hint">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🛒</div>
            <div className="text-lg font-semibold text-telegram-text mb-1">No orders yet</div>
            <div className="text-sm text-telegram-hint mb-4">Start shopping to see your orders here</div>
            <button
              onClick={() => navigate('/')}
              className="bg-telegram-button text-telegram-buttonText px-6 py-2 rounded-lg font-medium"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/order/${order.id}`)}
                className="w-full bg-telegram-secondaryBg rounded-lg p-4 text-left hover:opacity-80 transition-opacity"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-telegram-text">
                      {order.productName}
                    </div>
                    <div className="text-xs text-telegram-hint mt-1">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded text-xs font-bold ml-2 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-telegram-text">
                    ${parseFloat(order.paidAmount).toFixed(2)}
                  </span>
                  
                  {order.status === 'COMPLETED' && (
                    <span className="text-xs text-green-600 font-medium">
                      Code Available →
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

