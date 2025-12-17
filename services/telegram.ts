import { TelegramWebApp } from '../types';

// Safe accessor for Telegram WebApp
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const initTelegramApp = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
    // Set header color to match app
    if ((tg as any).setHeaderColor) {
        (tg as any).setHeaderColor('#0F0518');
    }
    if ((tg as any).setBackgroundColor) {
        (tg as any).setBackgroundColor('#0F0518');
    }
  }
};

// Функция для вызова вибрации
export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
  const tg = getTelegramWebApp();
  if (tg && (tg as any).HapticFeedback) {
    (tg as any).HapticFeedback.impactOccurred(style);
  }
};

export const triggerNotification = (type: 'error' | 'success' | 'warning') => {
    const tg = getTelegramWebApp();
    if (tg && (tg as any).HapticFeedback) {
      (tg as any).HapticFeedback.notificationOccurred(type);
    }
};