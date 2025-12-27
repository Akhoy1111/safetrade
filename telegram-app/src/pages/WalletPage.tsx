// src/pages/WalletPage.tsx
// Wallet page - Balance and transaction history

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useStore } from '../store/useStore';
import type { Transaction } from '../types';
import { showBackButton, hideBackButton } from '../utils/telegram';

export default function WalletPage() {
  const navigate = useNavigate();
  const { user, balance } = useStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
    
    showBackButton(() => navigate('/'));
    
    return () => {
      hideBackButton();
    };
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await api.getTransactions(user.id, 20);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'order_payment':
        return '🛒';
      case 'refund':
        return '↩️';
      default:
        return '📝';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'refund':
        return 'text-green-600';
      case 'withdrawal':
      case 'order_payment':
        return 'text-red-600';
      default:
        return 'text-telegram-text';
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
      <div className="bg-telegram-button text-telegram-buttonText p-6">
        <h1 className="text-2xl font-bold mb-4">My Wallet</h1>
        
        {/* Balance Card */}
        {balance && (
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-xs opacity-75 mb-1">Available Balance</div>
            <div className="text-3xl font-bold mb-3">{balance.formatted.available}</div>
            
            <div className="flex gap-4 text-sm">
              <div>
                <div className="opacity-75">Locked</div>
                <div className="font-semibold">{balance.formatted.locked}</div>
              </div>
              <div>
                <div className="opacity-75">Total</div>
                <div className="font-semibold">{balance.formatted.total}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Address */}
      <div className="p-4">
        <div className="bg-telegram-secondaryBg rounded-lg p-4 mb-4">
          <div className="text-xs text-telegram-hint mb-1">TON Wallet Address</div>
          <div className="font-mono text-xs text-telegram-text break-all">
            {user?.id || 'Not connected'}
          </div>
        </div>

        {/* Transactions */}
        <h2 className="text-lg font-semibold mb-3 text-telegram-text">Transaction History</h2>
        
        {loading ? (
          <div className="text-center py-8 text-telegram-hint">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-telegram-hint">No transactions yet</div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-telegram-secondaryBg rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getTransactionIcon(tx.type)}</div>
                    <div>
                      <div className="font-semibold text-telegram-text">
                        {tx.metadata.description || tx.type}
                      </div>
                      <div className="text-xs text-telegram-hint mt-1">
                        {formatDate(tx.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-right ${getTransactionColor(tx.type)}`}>
                    <div className="font-bold">
                      {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}
                      ${parseFloat(tx.amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-telegram-hint mt-1">
                      {tx.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

