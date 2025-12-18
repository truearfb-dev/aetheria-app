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
  
  // Разделение текста по разделителю '---'
  const parts = prediction.text.split('---');
  const introText = parts[0]?.trim() || "";
  const mainText = parts[1]?.trim() || "";

  const handleUnlockClick = () => {
    triggerHaptic('medium');
    setShowPayOptions(true);
  };

  return (
    <div className="relative z-10 p-4 max-w-lg mx-auto h-[100dvh] flex flex-col justify-between overflow-hidden animate-fadeIn">
      
      {/* ВЕРХНЯЯ И ЦЕНТРАЛЬНАЯ ЧАСТЬ */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* 1. HEADER */}
        <header className="flex justify-between items-start mb-2 border-b border-white/5 pb-1 shrink-0">
            <div className="flex flex-col">
                <h1 className="text-lg font-cinzel text-white leading-tight uppercase tracking-widest">Этерия</h1>
                <p className="text-[9px] text-gold/80 font-cinzel uppercase tracking-wider">{todayDate}</p>
            </div>
            <div className="text-right flex flex-col items-end">
                <p className="text-[10px] text-white font-cinzel uppercase">{user.zodiacSign}</p>
                <div className="flex items-center gap-1">
                   <div className="w-1 h-1 rounded-full bg-gold animate-pulse"></div>
                   <p className="text-[7px] text-gray-500 font-lato uppercase tracking-tighter">Связь установлена</p>
                </div>
            </div>
        </header>

        {/* 2. DAILY CARD (Minimalist) */}
        <section className="mb-2 shrink-0">
            <div className="relative w-full h-[45px] bg-white/5 rounded-lg border border-white/10 flex items-center px-4 gap-3">
                <span className="text-xl shrink-0">{prediction.tarotCard.icon}</span>
                <div className="flex flex-col">
                    <span className="text-[6px] text-gold/40 uppercase font-cinzel tracking-widest">Аркан</span>
                    <span className="text-[10px] text-gold font-cinzel uppercase tracking-wider">{prediction.tarotCard.name}</span>
                </div>
            </div>
        </section>

        {/* 3. MAIN PREDICTION BLOCK (The Soul of the App) */}
        <section className="relative flex-1 min-h-0 flex flex-col mb-3">
            <div className="relative flex-1 bg-black/40 border border-white/10 rounded-2xl flex flex-col shadow-2xl backdrop-blur-md overflow-hidden">
                <div className="p-5 flex-1 flex flex-col overflow-hidden relative">
                    <h2 className="font-cinzel text-center text-gold/30 text-[7px] font-bold tracking-[0.8em] mb-4 uppercase shrink-0">✧ ПРОРОЧЕСТВО СУДЬБЫ ✧</h2>
                    
                    <div className="relative flex-1 flex flex-col overflow-hidden">
                        {/* THE HOOK: Visible, personalized, high-impact intro */}
                        <div className="relative z-10 shrink-0">
                           <p className="text-white font-cinzel text-[14px] leading-[1.6] text-center italic px-1 mb-1">
                                {introText}
                            </p>
                        </div>

                        {/* SEAMLESS TRANSITION TO BLUR */}
                        <div className="relative flex-1 overflow-hidden">
                            <div className={`transition-all duration-1000 h-full ${isLocked ? 'blur-xl opacity-60 scale-105' : 'blur-0 opacity-100 overflow-y-auto pt-2'}`}>
                                <p className="text-gray-300 font-lato text-xs leading-relaxed text-center whitespace-pre-wrap px-4 italic pb-10">
                                    {mainText || "Звезды готовят финальный ответ для вашей души..."}
                                </p>
                            </div>

                            {/* LOCK OVERLAY: Centered over the blurred part */}
                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-start pt-4 z-20">
                                    {/* Gradient for legibility */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                    
                                    <div className="relative z-30 w-full px-6 flex flex-col items-center gap-6 mt-6">
                                        <button 
                                            onClick={handleUnlockClick}
                                            className="group relative w-full max-w-[240px] bg-gradient-to-b from-gold to-[#B8860B] text-black font-cinzel font-bold py-4 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.9)] active:scale-95 transition-all flex flex-col items-center overflow-hidden border border-white/30"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                            <span className="text-[10px] tracking-[0.2em] uppercase">Раскрыть Откровение</span>
                                            <span className="text-[6px] mt-1 opacity-60 uppercase font-lato font-normal tracking-[0.2em]">Узнать продолжение</span>
                                        </button>

                                        <div className="flex flex-col items-center gap-1.5 opacity-90">
                                            <div className="flex items-center gap-4">
                                                <div className="h-px w-8 bg-gold/40"></div>
                                                <span className="text-[9px] text-gold font-cinzel animate-pulse">✦</span>
                                                <div className="h-px w-8 bg-gold/40"></div>
                                            </div>
                                            <p className="text-[9px] text-white/80 uppercase tracking-[0.3em] font-lato text-center font-bold drop-shadow-md">
                                                Вы чувствуете, что это про Вас?
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

      {/* НИЖНЯЯ ЧАСТЬ (Always visible stats) */}
      <div className="shrink-0 pb-1">
        <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard label="Карма" value={prediction.karma} color="from-purple-900/40 to-black" borderColor="border-purple-500/20" textColor="text-purple-300" />
            <StatCard label="Удача" value={prediction.luck} color="from-gold/30 to-black" borderColor="border-gold/20" textColor="text-gold" />
            <StatCard label="Любовь" value={prediction.love} color="from-pink-900/40 to-black" borderColor="border-pink-500/20" textColor="text-pink-300" />
        </div>

        <button onClick={onReset} className="w-full text-center text-[7px] text-white/10 uppercase tracking-[0.4em] font-cinzel py-1 hover:text-white/30 transition-all">
            — Перезагрузить —
        </button>
      </div>

      {/* PAYMENT MODAL */}
      {showPayOptions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-md animate-fadeIn" onClick={() => setShowPayOptions(false)}>
              <div className="w-full max-w-sm bg-[#0a0a0a] border-t border-white/10 rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                  <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-8"></div>
                  
                  <h3 className="text-xl font-cinzel text-white text-center mb-1 uppercase tracking-[0.2em]">Принять Судьбу</h3>
                  <p className="text-gray-500 text-[10px] text-center mb-10 font-lato uppercase tracking-widest">Выберите путь к истине</p>
                  
                  <div className="space-y-4">
                      <button 
                        onClick={() => { onSingleUnlock(); setShowPayOptions(false); }}
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
                      >
                          <div className="text-left">
                              <p className="text-[11px] font-cinzel text-white tracking-widest uppercase">Разовый Доступ</p>
                              <p className="text-[9px] text-gray-500 uppercase mt-0.5">Только сегодня</p>
                          </div>
                          <span className="text-gold font-bold font-cinzel text-base">99₽</span>
                      </button>

                      <button 
                        onClick={() => { onUnlockPremium(); setShowPayOptions(false); }}
                        className="w-full bg-gradient-to-r from-gold to-[#B8860B] p-5 rounded-2xl flex items-center justify-between shadow-[0_10px_30px_rgba(212,175,55,0.2)] group active:scale-[0.98] transition-all"
                      >
                          <div className="text-left">
                              <p className="text-[11px] font-cinzel text-black font-bold tracking-widest uppercase">Путь Мастера</p>
                              <p className="text-[9px] text-black/70 uppercase mt-0.5 font-bold">Подписка на 30 дней</p>
                          </div>
                          <span className="text-black font-black font-cinzel text-base">199₽</span>
                      </button>
                  </div>
                  
                  <button onClick={() => setShowPayOptions(false)} className="w-full mt-8 text-[9px] text-gray-700 uppercase tracking-[0.4em] py-2 font-lato">
                      Вернуться назад
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string; borderColor: string; textColor: string }> = ({ label, value, color, borderColor, textColor }) => (
    <div className={`bg-gradient-to-b ${color} ${borderColor} border rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 shadow-lg`}>
        <span className="text-[8px] uppercase text-white/30 font-cinzel tracking-wider">{label}</span>
        <span className={`text-xs font-bold font-cinzel ${textColor} drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]`}>{value}%</span>
    </div>
);

export default Dashboard;