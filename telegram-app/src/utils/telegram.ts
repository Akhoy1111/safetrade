// src/utils/telegram.ts
// Telegram WebApp utilities

import WebApp from '@twa-dev/sdk';

export const tg = WebApp;

// Initialize Telegram WebApp
export const initTelegram = () => {
  tg.ready();
  tg.expand();
  
  // Set header color
  tg.setHeaderColor('#2481cc');
  
  // Enable closing confirmation
  tg.enableClosingConfirmation();
};

// Get Telegram user data
export const getTelegramUser = () => {
  return tg.initDataUnsafe.user;
};

// Check if running in Telegram
export const isInTelegram = () => {
  return tg.initDataUnsafe && tg.initDataUnsafe.user !== undefined;
};

// Show main button
export const showMainButton = (text: string, onClick: () => void) => {
  tg.MainButton.setText(text);
  tg.MainButton.show();
  tg.MainButton.onClick(onClick);
};

// Hide main button
export const hideMainButton = () => {
  tg.MainButton.hide();
};

// Show back button
export const showBackButton = (onClick: () => void) => {
  tg.BackButton.show();
  tg.BackButton.onClick(onClick);
};

// Hide back button
export const hideBackButton = () => {
  tg.BackButton.hide();
};

// Show alert
export const showAlert = (message: string) => {
  tg.showAlert(message);
};

// Show confirm dialog
export const showConfirm = (message: string, callback: (confirmed: boolean) => void) => {
  tg.showConfirm(message, callback);
};

// Haptic feedback
export const haptic = {
  light: () => tg.HapticFeedback.impactOccurred('light'),
  medium: () => tg.HapticFeedback.impactOccurred('medium'),
  heavy: () => tg.HapticFeedback.impactOccurred('heavy'),
  success: () => tg.HapticFeedback.notificationOccurred('success'),
  warning: () => tg.HapticFeedback.notificationOccurred('warning'),
  error: () => tg.HapticFeedback.notificationOccurred('error'),
};

// Close Mini App
export const closeApp = () => {
  tg.close();
};

