// src/App.tsx
// Main App component with routing

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import api from './api/client';
import { initTelegram, getTelegramUser, isInTelegram } from './utils/telegram';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import WalletPage from './pages/WalletPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';

// Components
import BottomNav from './components/BottomNav';

function App() {
  const { setUser, setWallet, setBalance, setLoading } = useStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Initialize Telegram WebApp
    initTelegram();

    // Check if running in Telegram
    if (!isInTelegram()) {
      console.warn('Not running in Telegram. Using mock data.');
      // For development, you can set mock user data here
      return;
    }

    // Get Telegram user data
    const tgUser = getTelegramUser();
    if (!tgUser) {
      console.error('No Telegram user data');
      return;
    }

    setLoading(true);

    try {
      // Get or create user
      let userData;
      try {
        userData = await api.getUserByTelegramId(tgUser.id.toString());
      } catch (error) {
        // User doesn't exist, create new user
        userData = await api.createUser({
          telegramId: tgUser.id.toString(),
          username: tgUser.username,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
        });
      }

      setUser(userData);

      // Get or create wallet
      const walletData = await api.getWallet(userData.id);
      setWallet(walletData);

      // Get balance
      const balanceData = await api.getWalletBalance(userData.id);
      setBalance(balanceData);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:sku" element={<ProductDetailPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/order/:orderId" element={<OrderDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
