import React, { useState } from 'react';
import { UserProfile, DailyPrediction } from '../types';
import { getTelegramWebApp, triggerHaptic } from '../services/telegram';

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
  
  // Разделение текста для создания эффекта "бесшовности"
  const paragraphs = prediction.text.split('\n').filter(p => p.trim() !== '');
  const firstParagraph = paragraphs[0] || "";
  const remainingText = paragraphs.slice(1).join('\n\n');

  const handleUnlockClick = () => {
    triggerHaptic('medium');
    // Показываем выбор оплаты
    setShowPayOptions(true);
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
            <div className="relative w-full h-[70px] bg-gradient-to-r from-[#1a1a1a] to-black rounded-xl border border-gold/20 flex flex-row items-center p-3 gap-4 overflow-hidden shadow-xl">
                <div className="absolute -left-4 top-0 w-24 h-full bg-gold/5 blur-2xl rounded-full"></div>
                <div className="relative z-10 text-3xl drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    {prediction.tarotCard.icon}
                </div>
                <div className="relative z-10 flex flex-col justify-center flex-1">
                    <div className="text-[7px] text-gold/40 uppercase tracking-[0.4em] font-cinzel mb-0.5">Карта Дня</div>
                    <h3 className="text-gold font-cinzel text-xs leading-tight">{prediction.tarotCard.name}</h3>
                    <p className="text-[9px] text-gray-400 font-lato line-clamp-1 italic">
                        {prediction.tarotCard.meaning}
                    </p>
                </div>
            </div>
        </section>

        {/* 3. MAIN PREDICTION BLOCK */}
        <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-b from-gold/10 via-transparent to-transparent rounded-3xl blur-2xl opacity-30 transition-opacity duration-1000"></div>
            
            <div className="relative bg-black/40 border border-white/10 rounded-2xl overflow-hidden min-h-[400px] flex flex-col shadow-2xl backdrop-blur-md">
                <div className="p-6 flex-1 flex flex-col">
                    <h2 className="font-cinzel text-center text-gold/50 text-[8px] font-bold tracking-[0.6em] mb-6 uppercase">✧ ПРОРОЧЕСТВО СУДЬБЫ ✧</h2>
                    
                    <div className="relative flex-1 flex flex-col">
                        {/* FIRST PARAGRAPH (Always visible) */}
                        <div className="relative z-20">
                           <p className="text-white font-cinzel text-base leading-relaxed text-center italic px-3 mb-6 transition-all duration-700">
                                {firstParagraph}
                            </p>
                        </div>

                        {/* REMAINING CONTENT (Blurred or Clear) */}
                        <div className="relative flex-1">
                            <div className={`transition-all duration-1000 space-y-6 pb-4 ${isLocked ? 'blur-xl select-none opacity-70 scale-100' : 'blur-0 opacity-100 scale-100'}`}>
                                <p className="text-gray-300 font-lato text-sm leading-relaxed text-center whitespace-pre-wrap px-3 italic">
                                    {remainingText}
                                </p>
                                {!isLocked && (
                                    <div className="pt-8 border-t border-white/5 text-center">
                                        <p className="text-[9px] text-gold/30 font-cinzel tracking-[0.3em] uppercase italic">Сила предсказания активна только до полуночи</p>
                                    </div>
                                )}
                            </div>

                            {/* SEAMLESS LOCK OVERLAY */}
                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-start pt-2 bg-gradient-to-t from-black via-black/5 to-transparent z-30">
                                    <div className="w-full max-w-[280px] flex flex-col items-center gap-8 mt-6">
                                        
                                        <button 
                                            onClick={handleUnlockClick}
                                            className="group relative w-full bg-gradient-to-b from-gold to-[#B8860B] text-black font-cinzel font-bold py-5 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.9)] active:scale-95 transition-all flex flex-col items-center overflow-hidden border border-white/30"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                                            
                                            <span className="text-[10px] tracking-[0.1em]">ПОСМОТРЕТЬ ПОЛНОСТЬЮ</span>
                                            <span className="text-[7px] mt-1.5 opacity-60 uppercase font-lato font-normal tracking-widest">
                                                Раскрыть тайны звезд
                                            </span>
                                        </button>

                                        <div className="flex flex-col items-center gap-2 opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                                            <div className="flex items-center gap-4">
                                                <div className="h-px w-8 bg-gold/60"></div>
                                                <span className="text-[8px] text-gold font-cinzel">✦</span>
                                                <div className="h-px w-8 bg-gold/60"></div>
                                            </div>
                                            <p className="text-[10px] text-white uppercase tracking-[0.2em] font-lato text-center font-bold">
                                                Загляните за пелену времени
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </div>

      {/* 4. STATS */}
      <div className="w-full">
        <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard label="Карма" value={prediction.karma} color="from-purple-600/30 to-purple-900/40" borderColor="border-purple-500/20" textColor="text-purple-200" />
            <StatCard label="Удача" value={prediction.luck} color="from-gold/30 to-yellow-900/40" borderColor="border-gold/20" textColor="text-gold" />
            <StatCard label="Любовь" value={prediction.love} color="from-pink-600/30 to-pink-900/40" borderColor="border-pink-500/20" textColor="text-pink-200" />
        </div>

        <button onClick={onReset} className="w-full text-center text-[7px] text-gray-800 uppercase tracking-[0.6em] font-cinzel py-2 border-t border-white/5 opacity-40">
            Сброс астральной связи
        </button>
      </div>

      {/* PAYMENT MODAL */}
      {showPayOptions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/95 backdrop-blur-md animate-fadeIn" onClick={() => setShowPayOptions(false)}>
              <div className="w-full max-w-sm bg-[#0a0a0a] border-t border-white/10 rounded-t-[2.5rem] p-10 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8"></div>
                  
                  <h3 className="text-xl font-cinzel text-white text-center mb-2 uppercase tracking-[0.2em]">Принять Судьбу</h3>
                  <p className="text-gray-500 text-[10px] text-center mb-10 font-lato uppercase tracking-widest">Выберите глубину откровения</p>
                  
                  <div className="space-y-4">
                      <button 
                        onClick={() => { onSingleUnlock(); setShowPayOptions(false); }}
                        className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
                      >
                          <div className="text-left">
                              <p className="text-xs font-cinzel text-white tracking-widest">Разовое Откровение</p>
                              <p className="text-[9px] text-gray-500 uppercase mt-1">Доступ на 24 часа</p>
                          </div>
                          <span className="text-gold font-bold font-cinzel text-base">99₽</span>
                      </button>

                      <button 
                        onClick={() => { onUnlockPremium(); setShowPayOptions(false); }}
                        className="w-full bg-gradient-to-r from-gold to-[#B8860B] p-6 rounded-2xl flex items-center justify-between shadow-[0_10px_30px_rgba(184,134,11,0.3)] group active:scale-[0.98] transition-all"
                      >
                          <div className="text-left">
                              <p className="text-xs font-cinzel text-black font-bold tracking-widest">Путь Мастера</p>
                              <p className="text-[9px] text-black/70 uppercase mt-1 font-bold">Подписка на 30 дней</p>
                          </div>
                          <span className="text-black font-black font-cinzel text-base">199₽</span>
                      </button>
                  </div>
                  
                  <button onClick={() => setShowPayOptions(false)} className="w-full mt-8 text-[9px] text-gray-700 uppercase tracking-[0.4em] py-2 font-lato">
                      Позже
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string; borderColor: string; textColor: string }> = ({ label, value, color, borderColor, textColor }) => (
    <div className={`bg-gradient-to-b ${color} ${borderColor} border rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-inner`}>
        <span className="text-[8px] uppercase text-gray-400 font-cinzel tracking-widest mb-0.5">{label}</span>
        <span className={`text-base font-bold font-cinzel ${textColor} drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]`}>{value}%</span>
    </div>
);

export default Dashboard;