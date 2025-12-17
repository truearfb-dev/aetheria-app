import React from 'react';
import { getTelegramWebApp } from '../services/telegram';

interface PaywallProps {
    onUnlockPremium: () => void;
    onUnlockDaily: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onUnlockPremium, onUnlockDaily }) => {
  const tg = getTelegramWebApp();
  
  // Replace this with your actual Telegram Channel Link
  const CHANNEL_URL = "https://t.me/durov"; 

  const handlePremiumClick = () => {
    // Simulate payment flow
    if (window.confirm("Оплатить 99 Stars за Вечный Доступ?")) {
        setTimeout(() => {
            onUnlockPremium();
        }, 500);
    }
  };

  const handleChannelClick = () => {
    if (tg) {
        tg.openTelegramLink(CHANNEL_URL);
    } else {
        window.open(CHANNEL_URL, '_blank');
    }

    // In a real app, you would use a bot to verify subscription.
    // Here we simulate it by asking the user after they return.
    setTimeout(() => {
        if (window.confirm("Вы подписались на канал?")) {
            onUnlockDaily();
        }
    }, 1000); // Small delay to let them click
  };

  return (
    <div className="absolute inset-0 backdrop-blur-md bg-black/70 flex flex-col items-center justify-center p-6 z-20 rounded-xl text-center animate-fadeIn border border-white/10">
      <div className="w-10 h-10 mb-3 text-gold animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-cinzel text-white mb-1">Тайна Сокрыта</h3>
      <p className="text-gray-400 font-lato text-xs mb-6 px-2">
        Бесплатные чтения закончились. Звезды требуют равноценного обмена.
      </p>
      
      <div className="space-y-3 w-full max-w-xs">
          {/* Option 1: Free via Channel */}
          <button 
            onClick={handleChannelClick}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-cinzel text-xs py-3 rounded-lg uppercase tracking-wider transition-all"
          >
            🔓 Открыть за подписку
          </button>

          <div className="flex items-center gap-2 opacity-50">
              <div className="h-px bg-white/30 flex-1"></div>
              <span className="text-[10px] uppercase text-gray-500">Или</span>
              <div className="h-px bg-white/30 flex-1"></div>
          </div>

          {/* Option 2: Paid Premium */}
          <button 
            onClick={handlePremiumClick}
            className="w-full bg-gold text-black font-cinzel text-xs font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all transform hover:scale-105"
          >
            👑 Premium Навсегда (99₽)
          </button>
      </div>
    </div>
  );
};

export default Paywall;