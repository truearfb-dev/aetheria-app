import React from 'react';
import { getTelegramWebApp } from '../services/telegram';

interface PaywallProps {
    onUnlockPremium: () => void;
    onUnlockDaily: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onUnlockPremium, onUnlockDaily }) => {
  const tg = getTelegramWebApp();
  
  // Replace with your real channel
  const CHANNEL_URL = "https://t.me/durov"; 

  const handleChannelClick = () => {
    if (tg) {
        tg.openTelegramLink(CHANNEL_URL);
    } else {
        window.open(CHANNEL_URL, '_blank');
    }
    setTimeout(() => {
        if (window.confirm("Вы подписались на канал?")) {
            onUnlockDaily();
        }
    }, 1000);
  };

  return (
    <div className="absolute inset-0 backdrop-blur-md bg-black/80 flex flex-col items-center justify-center p-6 z-20 rounded-xl text-center animate-fadeIn border border-white/10">
      <div className="w-12 h-12 mb-4 text-gold animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-cinzel text-white mb-2">Откровение Скрыто</h3>
      <p className="text-gray-400 font-lato text-sm mb-6 px-4 leading-relaxed">
        Чтобы увидеть полный путь звезд, принесите жертву или вступите в наш круг.
      </p>
      
      <div className="space-y-4 w-full max-w-xs">
          {/* Option 1: Free via Channel */}
          <button 
            onClick={handleChannelClick}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-cinzel text-xs py-3 rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 group"
          >
            <span>🔓 Открыть за подписку</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>

          <div className="flex items-center gap-2 opacity-40">
              <div className="h-px bg-white flex-1"></div>
              <span className="text-[10px] uppercase text-gray-400">Навсегда</span>
              <div className="h-px bg-white flex-1"></div>
          </div>

          {/* Option 2: Paid Premium (Real Money) */}
          <button 
            onClick={onUnlockPremium}
            className="w-full bg-gradient-to-r from-gold to-yellow-600 text-black font-cinzel text-sm font-bold py-3.5 rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>👑 Premium (199₽)</span>
          </button>
          
          <p className="text-[10px] text-gray-600 mt-2">
              Безопасная оплата через Telegram (Карта / СБП)
          </p>
      </div>
    </div>
  );
};

export default Paywall;