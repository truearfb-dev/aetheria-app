import React, { useState, useEffect } from 'react';
import { getTelegramWebApp, triggerHaptic } from '../services/telegram';

interface OnboardingProps {
  onComplete: (name: string, date: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const tg = getTelegramWebApp();

  // Auto-fill name from Telegram if available
  useEffect(() => {
    if (tg?.initDataUnsafe?.user?.first_name) {
      setName(tg.initDataUnsafe.user.first_name);
    }
  }, [tg]);

  useEffect(() => {
    if (!tg) return;

    const handleMainBtnClick = () => {
        if (name && date) {
            triggerHaptic('heavy');
            onComplete(name, date);
        }
    };

    if (name && date) {
      tg.MainButton.setText('УЗНАТЬ СУДЬБУ');
      tg.MainButton.show();
      tg.MainButton.onClick(handleMainBtnClick);
    } else {
      tg.MainButton.hide();
    }
    
    // Cleanup
    return () => {
      tg.MainButton.offClick(handleMainBtnClick);
    };
  }, [name, date, onComplete, tg]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && date) {
      triggerHaptic('heavy');
      onComplete(name, date);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center animate-fadeIn">
      <h1 className="text-4xl font-cinzel text-gold mb-2 tracking-widest drop-shadow-lg">ЭТЕРИЯ</h1>
      <p className="text-gray-400 font-lato mb-8 tracking-wide uppercase text-xs">Начни свой путь</p>

      <div className="w-full max-w-sm backdrop-blur-md bg-white/5 border border-white/10 p-8 rounded-2xl shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="block text-xs uppercase tracking-wider text-gold mb-2 pl-1">Ваше Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all font-lato"
              placeholder="Введите имя"
            />
          </div>

          <div className="text-left">
            <label className="block text-xs uppercase tracking-wider text-gold mb-2 pl-1">Дата Рождения</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-all font-lato"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <button
            type="submit"
            disabled={!name || !date}
            className="w-full mt-6 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/50 font-cinzel py-3 rounded-lg uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95"
          >
            Узнать Судьбу
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;