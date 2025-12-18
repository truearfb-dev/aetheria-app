import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, DailyPrediction } from '../types';
import Paywall from './Paywall';
import { getTelegramWebApp, triggerHaptic, triggerNotification } from '../services/telegram';
import { askTheOracle } from '../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  prediction: DailyPrediction;
  isLocked: boolean;
  oracleTokens: number;
  onUnlockPremium: () => void;
  onUnlockDaily: () => void;
  onConsumeToken: () => boolean;
  onBuyTokens: () => void;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    user, prediction, isLocked, oracleTokens,
    onUnlockPremium, onUnlockDaily, onConsumeToken, onBuyTokens, onReset 
}) => {
  const tg = getTelegramWebApp();
  const [oracleQuestion, setOracleQuestion] = useState('');
  const [oracleAnswer, setOracleAnswer] = useState<string | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [guideStep, setGuideStep] = useState(0); // 0: none, 1: card, 2: oracle, 3: prediction
  
  // State for the "Not Enough Tokens" modal
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Focus ref for input
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-guide sequence
  useEffect(() => {
    const timer1 = setTimeout(() => {
        setGuideStep(1);
        triggerHaptic('light');
    }, 500);

    const timer2 = setTimeout(() => {
        setGuideStep(2);
        triggerHaptic('light');
    }, 3500);

    const timer3 = setTimeout(() => {
        setGuideStep(3);
        triggerHaptic('light');
    }, 6500);

    const timer4 = setTimeout(() => {
        setGuideStep(0); // End guide
    }, 9500);

    return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
    };
  }, []);

  const handleOracleConsult = async () => {
    if (!oracleQuestion.trim()) {
        inputRef.current?.focus();
        return;
    }

    if (oracleTokens <= 0) {
        triggerNotification('warning');
        setShowTokenModal(true);
        return;
    }

    if (!onConsumeToken()) return;

    triggerHaptic('heavy');
    setIsConsulting(true);
    setOracleAnswer(null);
    
    const answer = await askTheOracle(oracleQuestion, user.zodiacSign, user.name);
    
    triggerNotification('success');
    setOracleAnswer(answer);
    setIsConsulting(false);
  };

  const highlightClass = (step: number) => {
      if (guideStep !== step) return "transition-all duration-700";
      return "transition-all duration-700 scale-[1.02] z-30 ring-2 ring-gold shadow-[0_0_30px_rgba(212,175,55,0.4)]";
  };

  const oracleHighlightClass = (step: number) => {
    if (guideStep !== step) return "transition-all duration-700";
    return "transition-all duration-700 scale-[1.02] z-30 ring-2 ring-neon shadow-[0_0_30px_rgba(176,38,255,0.4)]";
  };

  return (
    <div className="relative z-10 p-4 max-w-lg mx-auto pb-24 animate-fadeIn">
      
      {/* Dim overlay during guide */}
      {guideStep > 0 && (
          <div className="fixed inset-0 bg-black/40 z-20 pointer-events-none animate-fadeIn transition-opacity duration-1000"></div>
      )}

      {/* 1. COMPACT HEADER */}
      <header className="flex justify-between items-end mb-4 border-b border-white/5 pb-2">
        <div>
            <h1 className="text-lg font-cinzel text-white leading-none">Этерия</h1>
            <p className="text-[9px] text-gray-500 font-lato mt-1">{user.name} | {user.zodiacSign}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10" onClick={() => setShowTokenModal(true)}>
            <span className="text-xs font-bold text-neon">{oracleTokens}</span>
            <span className="text-[9px] uppercase text-gray-400">🔮 Энергии</span>
            <span className="w-3 h-3 rounded-full bg-neon/20 flex items-center justify-center text-[9px] text-neon">+</span>
        </div>
      </header>

      {/* 2. HORIZONTAL TAROT CARD (FULL WIDTH) */}
      <section className={`mb-4 w-full ${highlightClass(1)}`} onClick={() => triggerHaptic('light')}>
        <div className="relative w-full h-[100px] bg-gradient-to-r from-[#1a1a1a] to-black rounded-xl border border-gold/30 flex flex-row items-center p-4 gap-6 overflow-hidden shadow-2xl">
            {/* Background decorative glow */}
            <div className="absolute -left-4 top-0 w-24 h-full bg-gold/10 blur-2xl rounded-full"></div>
            
            {/* Icon (Left side) */}
            <div className="relative z-10 text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-float">
                {prediction.tarotCard.icon}
            </div>

            {/* Info (Right side) */}
            <div className="relative z-10 flex flex-col justify-center flex-1">
                <div className="text-[9px] text-gold/60 uppercase tracking-[0.3em] font-cinzel mb-1">Карта Дня</div>
                <h3 className="text-gold font-cinzel text-lg leading-tight mb-0.5">{prediction.tarotCard.name}</h3>
                <p className="text-[10px] text-gray-400 font-lato line-clamp-1 italic">
                    {prediction.tarotCard.meaning}
                </p>
            </div>
            
            {/* Decorative element (Right corner) */}
            <div className="absolute right-2 bottom-2 text-gold/10 text-2xl font-cinzel opacity-20">✦</div>
        </div>
      </section>

      {/* 3. ORACLE FUNNEL */}
      <section className={`mb-4 relative ${oracleHighlightClass(2)}`}>
          <div className="absolute -inset-1 bg-gradient-to-r from-neon via-purple-500 to-neon opacity-10 blur-md rounded-xl"></div>
          <div className="relative bg-[#0F0518]/90 border border-neon/20 rounded-xl p-4 backdrop-blur-xl">
              
              <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">👁️</span>
                  <h3 className="font-cinzel text-white text-[11px] tracking-wide uppercase">Спроси Звезды</h3>
              </div>

              {!oracleAnswer ? (
                  <div className="space-y-2">
                      <div className="relative">
                          <input 
                              ref={inputRef}
                              type="text" 
                              placeholder="Например: Что ждет меня сегодня?" 
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-neon focus:outline-none transition-all placeholder:text-gray-600 font-lato"
                              value={oracleQuestion}
                              onChange={(e) => setOracleQuestion(e.target.value)}
                          />
                          <button 
                            onClick={handleOracleConsult}
                            disabled={isConsulting}
                            className="absolute right-1 top-1 bottom-1 bg-neon text-white rounded-md px-3 font-cinzel text-[10px] uppercase transition-all disabled:opacity-50"
                          >
                             {isConsulting ? "..." : "↗"}
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="animate-fadeIn">
                      <div className="mb-2 p-3 bg-white/5 rounded-lg border border-neon/20">
                          <p className="font-lato text-[11px] text-white italic leading-relaxed">"{oracleAnswer}"</p>
                      </div>
                      <button 
                        onClick={() => { triggerHaptic('light'); setOracleAnswer(null); setOracleQuestion(''); }}
                        className="w-full py-1.5 text-[9px] text-neon border border-neon/30 rounded-md uppercase font-cinzel"
                      >
                          Спросить еще раз
                      </button>
                  </div>
              )}
          </div>
      </section>

      {/* 4. THE SEALED SCROLL */}
      <section className={`mb-4 ${highlightClass(3)} rounded-xl`}>
        <h2 className="font-cinzel text-center text-gray-600 text-[9px] tracking-[0.2em] mb-3 uppercase">Личное Пророчество</h2>
        
        <div className="relative min-h-[120px] rounded-xl overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl"></div>
            
            <div className={`relative p-5 h-full flex flex-col items-center justify-center transition-all duration-700 ${isLocked ? 'blur-md opacity-40' : 'opacity-100'}`}>
                 <p className="font-cinzel text-center text-[13px] text-gray-300 leading-6">
                    {isLocked 
                        ? "Звезды сложились в редкую конфигурацию. Ваше имя звучит в чертогах судьбы..." 
                        : `"${prediction.text}"`
                    }
                 </p>
            </div>

            {isLocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[2px]">
                    <div className="mb-3 px-3 py-0.5 bg-red-900/30 border border-red-500/30 rounded-full animate-pulse">
                         <span className="text-red-400 font-cinzel text-[9px] font-bold tracking-wide uppercase">
                            {prediction.teaser || "⚠️ Важное Послание"}
                         </span>
                    </div>

                    <button 
                        onClick={onUnlockPremium}
                        className="bg-gradient-to-r from-gold to-[#B8860B] text-black font-cinzel font-bold text-[10px] py-2.5 px-6 rounded-full shadow-lg active:scale-95 flex items-center gap-2"
                    >
                        <span>Снять Печать</span>
                        <span className="bg-black/10 px-1 rounded text-[9px]">199₽</span>
                    </button>
                    
                    <button 
                        onClick={onUnlockDaily}
                        className="mt-3 text-[9px] text-gray-500 underline decoration-gray-700 underline-offset-2 hover:text-white transition-colors"
                    >
                        Открыть за подписку
                    </button>
                </div>
            )}
        </div>
      </section>

      {/* 5. STATS */}
      <div className="grid grid-cols-3 gap-2 mb-6 opacity-80">
        <StatBar label="Карма" value={prediction.karma} color="bg-purple-500" />
        <StatBar label="Удача" value={prediction.luck} color="bg-gold" />
        <StatBar label="Любовь" value={prediction.love} color="bg-pink-500" />
      </div>

      <button onClick={onReset} className="w-full text-center text-[9px] text-gray-800 uppercase tracking-widest">
          Сброс данных
      </button>

      {/* --- TOKEN MODAL --- */}
      {showTokenModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setShowTokenModal(false)}>
              <div className="w-full max-w-sm bg-[#121212] border-t border-white/10 rounded-t-2xl p-6 transform transition-transform" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-cinzel text-neon">Энергия Оракула</h3>
                      <button onClick={() => setShowTokenModal(false)} className="text-gray-500 text-xl">×</button>
                  </div>
                  <p className="text-gray-400 text-xs font-lato mb-6">
                      Для связи с астралом требуется энергия. Пополните запас, чтобы продолжить диалог со звездами.
                  </p>
                  
                  <div className="space-y-3">
                      <button 
                        onClick={() => { onBuyTokens(); setShowTokenModal(false); }}
                        className="w-full bg-neon text-white font-cinzel py-4 rounded-xl flex items-center justify-between px-6 active:scale-95 transition-transform"
                      >
                          <span className="flex flex-col items-start">
                              <span className="text-sm font-bold">5 Ответов</span>
                              <span className="text-[9px] opacity-70">Восстановить энергию</span>
                          </span>
                          <span className="text-base font-bold">99₽</span>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
            <span className="text-[8px] uppercase text-gray-500 font-cinzel">{label}</span>
            <span className="text-[10px] font-bold text-white">{value}%</span>
        </div>
        <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

export default Dashboard;