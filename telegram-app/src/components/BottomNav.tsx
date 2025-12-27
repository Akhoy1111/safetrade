// src/components/BottomNav.tsx
// Bottom navigation bar

import { useNavigate, useLocation } from 'react-router-dom';
import { haptic } from '../utils/telegram';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNav = (path: string) => {
    haptic.light();
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-telegram-secondaryBg border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        <button
          onClick={() => handleNav('/')}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive('/') ? 'text-telegram-button' : 'text-telegram-hint'
          }`}
        >
          <div className="text-2xl mb-1">🏠</div>
          <div className="text-xs font-medium">Home</div>
        </button>

        <button
          onClick={() => handleNav('/orders')}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive('/orders') ? 'text-telegram-button' : 'text-telegram-hint'
          }`}
        >
          <div className="text-2xl mb-1">📦</div>
          <div className="text-xs font-medium">Orders</div>
        </button>

        <button
          onClick={() => handleNav('/wallet')}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive('/wallet') ? 'text-telegram-button' : 'text-telegram-hint'
          }`}
        >
          <div className="text-2xl mb-1">💰</div>
          <div className="text-xs font-medium">Wallet</div>
        </button>
      </div>
    </div>
  );
}

