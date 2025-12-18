import React, { useState, useEffect } from 'react';
import { UserProfile, DailyPrediction } from '../types';
import { getTelegramWebApp, triggerHaptic, triggerNotification } from '../services/telegram';

interface DashboardProps {
  user: UserProfile;
  prediction: DailyPrediction;
  isLocked: boolean;
  visitCount: number;
  onUnlockPremium: () => void;
  onUnlockDaily: () => void;
  onSingleUnlock: () => void;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    user, prediction, isLocked, visitCount,
    onUnlockPremium, onUnlockDaily, onSingleUnlock, onReset 
}) => {
  const [showPayOptions, setShowPayOptions] = useState(false);
  const todayDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const tg = getTelegramWebApp();

  // Prediction text split for preview
  const paragraphs = prediction.text.split('\n').filter(p => p.trim() !== '');
  const previewText = paragraphs[0] || "";
  const remainingText = paragraphs.slice(1).join('\n\n');

  const handleUnlockClick = () => {
    triggerHaptic('medium');
    if (visitCount <= 1) {
        // First time - always channel subscribe
        onUnlockDaily();
    } else {
        // Returning user - show pay modal
        setShowPayOptions(true);
    }
  };

  return (
    <div className="relative z-10 p-4 max-w-lg mx-auto pb-20 animate-fadeIn h-screen flex flex-col justify-between overflow-hidden">
      
      <div>
        {/* 1. HEADER */}
        <header className="flex justify-between items-start mb-4 border-b border-white/5 pb-2">
            <div>
                <h1 className="text-xl font-cinzel text-white leading-tight uppercase tracking-widest">Этерия</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></div>
                   <p className="text-[10px] text-gold/80 font-cinzel uppercase tracking-wider">Сегодня: {todayDate}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-white font-cinzel uppercase">{user.zodiacSign}</p>
                <p className="text-[8px] text-gray-500 font-lato uppercase">{user.name}</p>
            </div>
        </header>

        {/* 2. DAILY CARD */}
        <section className="mb-4 w-full">
            <div className="relative w-full h-[80px] bg-gradient-to-r from-[#1a1a1a] to-black rounded-xl border border-gold/20 flex flex-row items-center p-3 gap-4 overflow-hidden shadow-xl">
                <div className="absolute -left-4 top-0 w-24 h-full bg-gold/5 blur-2xl rounded-full"></div>
                <div className="relative z-10 text-4xl drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    {prediction.tarotCard.icon}
                </div>
                <div className="relative z-10 flex flex-col justify-center flex-1">
                    <div className="text-[7px] text-gold/40 uppercase tracking-[0.4em] font-cinzel mb-0.5">Карта Дня</div>
                    <h3 className="text-gold font-cinzel text-sm leading-tight">{prediction.tarotCard.name}</h3>
                    <p className="text-[9px] text-gray-400 font-lato line-clamp-1 italic">
                        {prediction.tarotCard.meaning}
                    </p>
                </div>
            </div>
        </section>

        {/* 3. MAIN PREDICTION BLOCK */}
        <section className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-gold/20 to-transparent rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            
            <div className="relative bg-black/40 border border-white/10 rounded-2xl overflow-hidden min-h-[320px] flex flex-col">
                <div className="p-5 flex-1 flex flex-col">
                    <h2 className="font-cinzel text-center text-gold text-[10px] font-bold tracking-[0.5em] mb-4 uppercase">✧ ПРОРОЧЕСТВО СУДЬБЫ ✧</h2>
                    
                    {/* Content Area */}
                    <div className="relative overflow-hidden flex-1">
                        {/* Always visible first paragraph */}
                        <p className="text-gray-200 font-cinzel text-sm leading-relaxed text-center mb-4 italic px-2">
                            {previewText}
                        </p>
                        
                        {/* Blurred rest of content */}
                        <div className={`transition-all duration-1000 ${isLocked ? 'blur-md select-none' : 'blur-0'}`}>
                            <p className="text-gray-300 font-lato text-sm leading-relaxed text-center whitespace-pre-wrap">
                                {remainingText}
                            </p>
                        </div>

                        {/* Lock Overlay */}
                        {isLocked && (
                            <div className="absolute inset-x-0 bottom-0 top-[40px] flex flex-col items-center justify-center bg-gradient-to-t from-black via-black/40 to-transparent pt-12">
                                <button 
                                    onClick={handleUnlockClick}
                                    className="bg-gradient-to-b from-gold to-[#B8860B] text-black font-cinzel font-bold text-xs py-4 px-10 rounded-full shadow-[0_10px_30px_rgba(184,134,11,0.6)] active:scale-95 transition-all flex flex-col items-center"
                                >
                                    <span className="tracking-widest">ПОСМОТРЕТЬ ПРЕДСКАЗАНИЕ</span>
                                    <span className="text-[8px] mt-1 opacity-80 uppercase">
                                        {visitCount <= 1 ? "Бесплатно за подписку" : "Открыть путь звезд"}
                                    </span>
                                </button>
                                <p className="mt-6 text-[8px] text-gray-500 uppercase tracking-widest text-center animate-pulse">
                                    Сила пророчества активна только сегодня
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
      </div>

      {/* 4. STATS (UNCHANGED) */}
      <div className="w-full">
        <div className="grid grid-cols-3 gap-3 mb-4">
            <StatCard label="Карма" value={prediction.karma} color="from-purple-600/40 to-purple-900/40" borderColor="border-purple-500/30" textColor="text-purple-300" />
            <StatCard label="Удача" value={prediction.luck} color="from-gold/40 to-yellow-900/40" borderColor="border-gold/30" textColor="text-gold" />
            <StatCard label="Любовь" value={prediction.love} color="from-pink-600/40 to-pink-900/40" borderColor="border-pink-500/30" textColor="text-pink-300" />
        </div>

        <button onClick={onReset} className="w-full text-center text-[7px] text-gray-800 uppercase tracking-[0.5em] font-cinzel py-1 border-t border-white/5 opacity-40">
            Сброс астральной связи
        </button>
      </div>

      {/* PAYMENT MODAL (Only for returning users) */}
      {showPayOptions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-sm animate-fadeIn" onClick={() => setShowPayOptions(false)}>
              <div className="w-full max-w-sm bg-[#121212] border-t border-white/20 rounded-t-3xl p-8" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6"></div>
                  <h3 className="text-xl font-cinzel text-white text-center mb-2 uppercase tracking-widest">Разблокировать Судьбу</h3>
                  <p className="text-gray-500 text-xs text-center mb-8 font-lato">Выберите ваш путь получения пророчеств</p>
                  
                  <div className="space-y-4">
                      <button 
                        onClick={() => { onSingleUnlock(); setShowPayOptions(false); }}
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all group"
                      >
                          <div className="text-left">
                              <p className="text-sm font-cinzel text-white">Разовое Откровение</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">На 1 день</p>
                          </div>
                          <span className="text-gold font-bold font-cinzel text-lg">99₽</span>
                      </button>

                      <button 
                        onClick={() => { onUnlockPremium(); setShowPayOptions(false); }}
                        className="w-full bg-gradient-to-r from-gold to-yellow-600 p-5 rounded-2xl flex items-center justify-between shadow-[0_10px_20px_rgba(212,175,55,0.2)] hover:scale-[1.02] transition-all"
                      >
                          <div className="text-left">
                              <p className="text-sm font-cinzel text-black font-bold">Путь Мастера</p>
                              <p className="text-[10px] text-black/60 uppercase font-bold">Подписка на месяц</p>
                          </div>
                          <span className="text-black font-black font-cinzel text-lg">199₽</span>
                      </button>
                  </div>
                  
                  <button onClick={() => setShowPayOptions(false)} className="w-full mt-6 text-[10px] text-gray-600 uppercase tracking-widest py-2">
                      Закрыть
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string; borderColor: string; textColor: string }> = ({ label, value, color, borderColor, textColor }) => (
    <div className={`bg-gradient-to-b ${color} ${borderColor} border rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-lg`}>
        <span className="text-[8px] uppercase text-gray-400 font-cinzel tracking-widest">{label}</span>
        <span className={`text-lg font-bold font-cinzel ${textColor}`}>{value}%</span>
    </div>
);

export default Dashboard;