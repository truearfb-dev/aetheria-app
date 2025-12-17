export interface UserProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  zodiacSign: string;
}

export interface AppData {
  user: UserProfile | null;
  visitCount: number;
  lastVisitDate: string; // YYYY-MM-DD
  isPremium: boolean;
  isUnlockedToday: boolean;
  oracleTokens: number; // New: Currency for asking AI questions
}

export enum AppStage {
  ONBOARDING = 'ONBOARDING',
  RITUAL = 'RITUAL',
  DASHBOARD = 'DASHBOARD'
}

export interface TarotCard {
  name: string;
  meaning: string;
  icon: string;
}

export interface DailyPrediction {
  text: string;
  karma: number;
  luck: number;
  love: number;
  luckyColor: string;
  luckyColorHex: string;
  tarotCard: TarotCard;
  teaser: string; // NEW: The hook headline (e.g. "⚠️ Warning: Betrayal")
}

// Telegram WebApp Types (Simplified)
export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
    setText: (text: string) => void;
  };
  openTelegramLink: (url: string) => void;
  // invoiceSlug is the URL returned by createInvoiceLink
  openInvoice: (invoiceSlug: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
  initDataUnsafe?: {
    user?: {
      first_name?: string;
      last_name?: string;
      username?: string;
      id?: number;
    }
  }
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}