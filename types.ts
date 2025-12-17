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
  isUnlockedToday: boolean; // New field: true if user watched ad or subbed to channel today
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
  initDataUnsafe?: {
    user?: {
      first_name?: string;
      last_name?: string;
      username?: string;
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