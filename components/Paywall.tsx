import React from 'react';

interface PaywallProps {
    onUnlock: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onUnlock }) => {
  const handleUnlock = () => {
    // In a real app, this would trigger the Telegram Payment API
    // Telegram.WebApp.openInvoice(...)
    
    if (window.confirm("Симуляция оплаты: Открыть полное руководство за 99₽?")) {
        // Simulate processing delay
        setTimeout(() => {
            onUnlock();
        }, 500);
    }
  };

  return (
    <div className="absolute inset-0 backdrop-blur-sm bg-black/60 flex flex-col items-center justify-center p-6 z-20 rounded-xl text-center animate-fadeIn">
      <div className="w-12 h-12 mb-4 text-gold animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <h3 className="text-xl font-cinzel text-white mb-2">Доступ Закрыт</h3>
      <p className="text-gray-300 font-lato text-sm mb-6">
        Звезды открыли глубокие тайны. Получите полный доступ, чтобы ясно увидеть свою судьбу.
      </p>
      <button 
        onClick={handleUnlock}
        className="bg-gold text-black font-cinzel font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all transform hover:scale-105"
      >
        Открыть (99₽)
      </button>
    </div>
  );
};

export default Paywall;