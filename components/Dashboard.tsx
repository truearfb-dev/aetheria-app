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
  const [guideStep, setGuideStep] = useState(0); 
  
  const [showTokenModal, setShowTokenModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer1 = setTimeout(() => { setGuideStep(1); triggerHaptic('light'); }, 500);
    const timer2 = setTimeout(() => { setGuideStep(2); triggerHaptic('light'); }, 3500);
    const timer3 = setTimeout(() => { setGuideStep(3); triggerHaptic('light'); }, 6500);
    const timer4 = setTimeout(() => { setGuideStep(0); }, 9500);

    return () => {
        clearTimeout(timer1); clearTimeout(timer2);
        clearTimeout(timer3); clearTimeout(timer4);
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
      return "transition-all duration-700 scale-[1.02] z-30 ring-2 ring-gold shadow-[0_0_30px_rgba(212,175,55,0.6)]";
  };

  const oracleHighlightClass = (step: number) => {
    if (guideStep !== step) return "transition-all duration-700";
    return "transition-all duration-700 scale-[1.02] z-30 ring-2 ring-neon shadow-[0_0_30px_rgba(176,38,255,0.5)]";
  };

  return (
    <div className="relative z-10 p-4 max-w-lg mx-auto pb-20 animate-fadeIn h-screen flex flex-col justify-between overflow-hidden">
      
      {guideStep > 0 && (
          <div className="fixed inset-0 bg-black/60 z-20 pointer-events-none animate-fadeIn transition-opacity duration-1000"></div>
      )}

      <div>
        {/* 1. HEADER */}
        <header className="flex justify-between items-end mb-3 border-b border-white/5 pb-2">
            <div>
                <h1 className="text-lg font-cinzel text-white leading-none">Этерия</h1>
                <p className="text-[9px] text-gray-500 font-lato mt-1">{user.name} | {user.zodiacSign}</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10" onClick={() => setShowTokenModal(true)}>
                <span className="text-xs font-bold text-neon">{oracleTokens}</span>
                <span className="text-[9px] uppercase text-gray-400">🔮 Энергии</span>
                <button className="ml-1 w-4 h-4 rounded-full bg-neon/20 flex items-center justify-center text-[10px] text-neon">+</button>
            </div>
        </header>

        {/* 2. DAILY CARD (HORIZONTAL) */}
        <section className={`mb-3 w-full ${highlightClass(1)}`} onClick={() => triggerHaptic('light')}>
            <div className="relative w-full h-[90px] bg-gradient-to-r from-[#1a1a1a] to-black rounded-xl border border-gold/30 flex flex-row items-center p-4 gap-4 overflow-hidden shadow-xl">
                <div className="absolute -left-4 top-0 w-24 h-full bg-gold/5 blur-2xl rounded-full"></div>
                <div className="relative z-10 text-5xl drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    {prediction.tarotCard.icon}
                </div>
                <div className="relative z-10 flex flex-col justify-center flex-1">
                    <div className="text-[8px] text-gold/60 uppercase tracking-[0.4em] font-cinzel mb-0.5">Карта Дня</div>
                    <h3 className="text-gold font-cinzel text-base leading-tight">{prediction.tarotCard.name}</h3>
                    <p className="text-[9px] text-gray-500 font-lato line-clamp-1 italic">
                        {prediction.tarotCard.meaning}
                    </p>
                </div>
            </div>
        </section>

        {/* 3. ORACLE */}
        <section className={`mb-3 relative ${oracleHighlightClass(2)}`}>
            <div className="relative bg-[#0F0518]/90 border border-neon/20 rounded-xl p-3 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">👁️</span>
                    <h3 className="font-cinzel text-white text-[10px] tracking-wide uppercase">Спроси Звезды</h3>
                </div>
                {!oracleAnswer ? (
                    <div className="relative">
                        <input 
                            ref={inputRef}
                            type="text" 
                            placeholder="Что меня ждет сегодня?" 
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
                ) : (
                    <div className="animate-fadeIn">
                        <div className="mb-2 p-2 bg-white/5 rounded-lg border border-neon/20 text-[10px] text-white italic leading-relaxed">
                            "{oracleAnswer}"
                        </div>
                        <button 
                            onClick={() => { triggerHaptic('light'); setOracleAnswer(null); setOracleQuestion(''); }}
                            className="w-full py-1 text-[8px] text-neon border border-neon/30 rounded-md uppercase font-cinzel"
                        >
                            Еще вопрос
                        </button>
                    </div>
                )}
            </div>
        </section>

        {/* 4. PERSONAL PROPHECY (PREMIUM HIGHLIGHT) */}
        <section className={`mb-4 ${highlightClass(3)} rounded-xl relative group`}>
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/0 via-gold/40 to-gold/0 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
            
            <h2 className="font-cinzel text-center text-gold text-[10px] font-bold tracking-[0.4em] mb-2 uppercase drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                ✧ ЛИЧНОЕ ПРОРОЧЕСТВО ✧
            </h2>
            
            <div className="relative min-h-[130px] rounded-xl overflow-hidden border border-gold/40 shadow-[inset_0_0_20px_rgba(212,175,55,0.1)] bg-black">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                
                <div className={`relative p-5 h-full flex flex-col items-center justify-center transition-all duration-1000 ${isLocked ? 'blur-lg opacity-30' : 'opacity-100'}`}>
                    <p className="font-cinzel text-center text-sm text-gray-200 leading-7 italic">
                        {isLocked ? "Ваша судьба скрыта за пеленой звезд..." : `"${prediction.text}"`}
                    </p>
                </div>

                {isLocked && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <div className="mb-4 px-4 py-1 bg-red-600/20 border border-red-500/40 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <span className="text-red-400 font-cinzel text-[10px] font-bold tracking-widest uppercase">
                                {prediction.teaser || "⚠️ ТРЕВОЖНЫЙ ЗНАК"}
                            </span>
                        </div>

                        <button 
                            onClick={onUnlockPremium}
                            className="bg-gradient-to-b from-gold to-[#B8860B] text-black font-cinzel font-bold text-xs py-3 px-8 rounded-full shadow-[0_10px_20px_rgba(184,134,11,0.4)] active:scale-95 transition-transform flex items-center gap-3"
                        >
                            <span>СНЯТЬ ПЕЧАТЬ</span>
                            <span className="bg-black/20 px-2 py-0.5 rounded text-[10px]">199₽</span>
                        </button>
                        
                        <button onClick={onUnlockDaily} className="mt-4 text-[9px] text-gray-500 underline decoration-gray-700 hover:text-white transition-colors uppercase tracking-widest">
                            Открыть за подписку
                        </button>
                    </div>
                )}
            </div>
        </section>
      </div>

      {/* 5. STATS (BIG CARDS) */}
      <div className="w-full">
        <div className="grid grid-cols-3 gap-3 mb-4">
            <StatCard label="Карма" value={prediction.karma} color="from-purple-600/40 to-purple-900/40" borderColor="border-purple-500/30" textColor="text-purple-300" />
            <StatCard label="Удача" value={prediction.luck} color="from-gold/40 to-yellow-900/40" borderColor="border-gold/30" textColor="text-gold" />
            <StatCard label="Любовь" value={prediction.love} color="from-pink-600/40 to-pink-900/40" borderColor="border-pink-500/30" textColor="text-pink-300" />
        </div>

        <button onClick={onReset} className="w-full text-center text-[8px] text-gray-800 uppercase tracking-[0.5em] font-cinzel py-2">
            Сброс астральной связи
        </button>
      </div>

      {/* TOKEN MODAL */}
      {showTokenModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setShowTokenModal(false)}>
              <div className="w-full max-w-sm bg-[#121212] border-t border-white/10 rounded-t-2xl p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-cinzel text-neon uppercase">Энергия</h3>
                      <button onClick={() => setShowTokenModal(false)} className="text-gray-500 text-2xl">&times;</button>
                  </div>
                  <div className="space-y-3">
                      <button onClick={() => { onBuyTokens(); setShowTokenModal(false); }} className="w-full bg-neon text-white font-cinzel py-4 rounded-xl flex items-center justify-between px-6 active:scale-95 transition-transform">
                          <span className="text-sm font-bold uppercase tracking-widest">5 Ответов</span>
                          <span className="text-lg font-bold">99₽</span>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string; borderColor: string; textColor: string }> = ({ label, value, color, borderColor, textColor }) => (
    <div className={`bg-gradient-to-b ${color} ${borderColor} border rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-lg`}>
        <span className="text-[8px] uppercase text-gray-400 font-cinzel tracking-widest">{label}</span>
        <span className={`text-xl font-bold font-cinzel ${textColor}`}>{value}%</span>
        <div className="w-full h-1 bg-black/40 rounded-full mt-1 overflow-hidden">
            <div className={`h-full bg-white/40`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

export default Dashboard;