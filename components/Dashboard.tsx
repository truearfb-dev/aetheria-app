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
  
  // Разделение текста: первый абзац — затравка, остальное — скрыто
  const paragraphs = prediction.text.split('\n').filter(p => p.trim() !== '');
  const firstParagraph = paragraphs[0] || "";
  const remainingText = paragraphs.slice(1).join('\n\n');

  const handleUnlockClick = () => {
    triggerHaptic('medium');
    setShowPayOptions(true);
  };

  return (
    <div className="relative z-10 p-4 max-w-lg mx-auto h-screen flex flex-col justify-between overflow-hidden animate-fadeIn">
      
      {/* ВЕРХНЯЯ ЧАСТЬ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 1. HEADER */}
        <header className="flex justify-between items-start mb-3 border-b border-white/5 pb-2 shrink-0">
            <div>
                <h1 className="text-lg font-cinzel text-white leading-tight uppercase tracking-widest">Этерия</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1 h-1 rounded-full bg-gold animate-pulse"></div>
                   <p className="text-[9px] text-gold/80 font-cinzel uppercase tracking-wider">{todayDate}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-white font-cinzel uppercase">{user.zodiacSign}</p>
                <p className="text-[8px] text-gray-500 font-lato uppercase">{user.name}</p>
            </div>
        </header>

        {/* 2. DAILY CARD (Small) */}
        <section className="mb-3 shrink-0">
            <div className="relative w-full h-[60px] bg-gradient-to-r from-[#1a1a1a] to-black rounded-xl border border-gold/15 flex flex-row items-center p-3 gap-3 overflow-hidden shadow-lg">
                <div className="relative z-10 text-2xl drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                    {prediction.tarotCard.icon}
                </div>
                <div className="relative z-10 flex flex-col justify-center">
                    <div className="text-[6px] text-gold/40 uppercase tracking-[0.4em] font-cinzel">Аркан Дня</div>
                    <h3 className="text-gold font-cinzel text-[10px] leading-tight uppercase tracking-wider">{prediction.tarotCard.name}</h3>
                </div>
                <div className="flex-1 text-right">
                     <p className="text-[8px] text-gray-500 font-lato italic line-clamp-2 pr-1">
                        {prediction.tarotCard.meaning}
                    </p>
                </div>
            </div>
        </section>

        {/* 3. MAIN PREDICTION BLOCK (Scrollable if clear, Fixed if locked) */}
        <section className="relative flex-1 min-h-0 flex flex-col mb-4">
            <div className="relative flex-1 bg-black/30 border border-white/5 rounded-2xl flex flex-col shadow-2xl backdrop-blur-sm overflow-hidden">
                <div className="p-5 flex-1 flex flex-col">
                    <h2 className="font-cinzel text-center text-gold/40 text-[7px] font-bold tracking-[0.6em] mb-4 uppercase">✧ ПРОРОЧЕСТВО ✧</h2>
                    
                    <div className="relative flex-1 flex flex-col overflow-hidden">
                        {/* FIRST PARAGRAPH (Always visible) */}
                        <div className="relative z-10 shrink-0">
                           <p className="text-white font-cinzel text-sm leading-relaxed text-center italic px-2 mb-4">
                                {firstParagraph}
                            </p>
                        </div>

                        {/* REMAINING CONTENT (Blurred area) */}
                        <div className="relative flex-1 overflow-hidden">
                            <div className={`transition-all duration-1000 h-full ${isLocked ? 'blur-lg opacity-60' : 'blur-0 opacity-100 overflow-y-auto'}`}>
                                <p className="text-gray-300 font-lato text-xs leading-relaxed text-center whitespace-pre-wrap px-4 italic pb-6">
                                    {remainingText}
                                </p>
                            </div>

                            {/* LOCK OVERLAY */}
                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                    {/* Затенение для читаемости кнопки */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    
                                    <div className="relative z-30 w-full px-6 flex flex-col items-center gap-6">
                                        <button 
                                            onClick={handleUnlockClick}
                                            className="group relative w-full max-w-[240px] bg-gradient-to-b from-gold to-[#B8860B] text-black font-cinzel font-bold py-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] active:scale-95 transition-all flex flex-col items-center overflow-hidden border border-white/20"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                            <span className="text-[9px] tracking-[0.15em] uppercase">Посмотреть полностью</span>
                                            <span className="text-[6px] mt-1 opacity-60 uppercase font-lato font-normal tracking-[0.2em]">Раскрыть тайны</span>
                                        </button>

                                        <div className="flex flex-col items-center gap-1 opacity-80">
                                            <div className="flex items-center gap-3">
                                                <div className="h-px w-6 bg-gold/40"></div>
                                                <span className="text-[8px] text-gold font-cinzel">✦</span>
                                                <div className="h-px w-6 bg-gold/40"></div>
                                            </div>
                                            <p className="text-[8px] text-white/50 uppercase tracking-[0.2em] font-lato text-center">
                                                Звезды ждут вашего шага
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

      {/* НИЖНЯЯ ЧАСТЬ (Всегда видна) */}
      <div className="shrink-0">
        <div className="grid grid-cols-3 gap-2 mb-4">
            <StatCard label="Карма" value={prediction.karma} color="from-purple-600/20 to-purple-900/30" borderColor="border-purple-500/10" textColor="text-purple-300" />
            <StatCard label="Удача" value={prediction.luck} color="from-gold/20 to-yellow-900/30" borderColor="border-gold/10" textColor="text-gold" />
            <StatCard label="Любовь" value={prediction.love} color="from-pink-600/20 to-pink-900/30" borderColor="border-pink-500/10" textColor="text-pink-300" />
        </div>

        <button onClick={onReset} className="w-full text-center text-[6px] text-white/20 uppercase tracking-[0.5em] font-cinzel py-2 hover:text-white/40 transition-colors">
            — Перезагрузить астральную связь —
        </button>
      </div>

      {/* PAYMENT MODAL */}
      {showPayOptions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-md animate-fadeIn" onClick={() => setShowPayOptions(false)}>
              <div className="w-full max-w-sm bg-[#0a0a0a] border-t border-white/10 rounded-t-[2rem] p-8 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                  <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-6"></div>
                  
                  <h3 className="text-lg font-cinzel text-white text-center mb-1 uppercase tracking-[0.2em]">Принять Судьбу</h3>
                  <p className="text-gray-500 text-[9px] text-center mb-8 font-lato uppercase tracking-widest">Выберите глубину откровения</p>
                  
                  <div className="space-y-3">
                      <button 
                        onClick={() => { onSingleUnlock(); setShowPayOptions(false); }}
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-xl flex items-center justify-between group active:scale-[0.98] transition-all"
                      >
                          <div className="text-left">
                              <p className="text-[10px] font-cinzel text-white tracking-widest uppercase">Разовый Доступ</p>
                              <p className="text-[8px] text-gray-500 uppercase mt-0.5">Только на 24 часа</p>
                          </div>
                          <span className="text-gold font-bold font-cinzel text-sm">99₽</span>
                      </button>

                      <button 
                        onClick={() => { onUnlockPremium(); setShowPayOptions(false); }}
                        className="w-full bg-gradient-to-r from-gold to-[#B8860B] p-5 rounded-xl flex items-center justify-between shadow-lg group active:scale-[0.98] transition-all"
                      >
                          <div className="text-left">
                              <p className="text-[10px] font-cinzel text-black font-bold tracking-widest uppercase">Путь Мастера</p>
                              <p className="text-[8px] text-black/70 uppercase mt-0.5 font-bold">Подписка на 30 дней</p>
                          </div>
                          <span className="text-black font-black font-cinzel text-sm">199₽</span>
                      </button>
                  </div>
                  
                  <button onClick={() => setShowPayOptions(false)} className="w-full mt-6 text-[8px] text-gray-600 uppercase tracking-[0.3em] py-2 font-lato">
                      Вернуться назад
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string; borderColor: string; textColor: string }> = ({ label, value, color, borderColor, textColor }) => (
    <div className={`bg-gradient-to-b ${color} ${borderColor} border rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 shadow-md`}>
        <span className="text-[7px] uppercase text-white/40 font-cinzel tracking-wider">{label}</span>
        <span className={`text-xs font-bold font-cinzel ${textColor}`}>{value}%</span>
    </div>
);

export default Dashboard;