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