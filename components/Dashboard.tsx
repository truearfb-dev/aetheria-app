import React, { useState, useRef } from 'react';
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
  
  // State for the "Not Enough Tokens" modal
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Focus ref for input
  const inputRef = useRef<HTMLInputElement>(null);

  const handleShare = () => {
    triggerHaptic('medium');
    const text = `🔮 Этерия: Моя карта дня — ${prediction.tarotCard.name}. Звезды шепчут...`;
    const url = "https://t.me/AetheriaBot/app"; 
    
    if (tg) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    }
  };

  const handleOracleConsult = async () => {
    if (!oracleQuestion.trim()) {
        inputRef.current?.focus();
        return;
    }

    // --- FUNNEL LOGIC ---
    if (oracleTokens <= 0) {
        triggerNotification('warning');
        setShowTokenModal(true); // Show custom modal
        return;
    }

    // Consume token
    if (!onConsumeToken()) return;

    triggerHaptic('heavy');
    setIsConsulting(true);
    setOracleAnswer(null);
    
    // AI Call
    const answer = await askTheOracle(oracleQuestion, user.zodiacSign, user.name);
    
    triggerNotification('success');
    setOracleAnswer(answer);
    setIsConsulting(false);
  };

  return (
    <div className="relative z-10 p-5 max-w-lg mx-auto pb-32 animate-fadeIn">
      
      {/* 1. COMPACT HEADER */}
      <header className="flex justify-between items-end mb-6 border-b border-white/5 pb-2">
        <div>
            <h1 className="text-xl font-cinzel text-white">Этерия</h1>
            <p className="text-[10px] text-gray-400 font-lato">{user.name} | {user.zodiacSign}</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10" onClick={() => setShowTokenModal(true)}>
            <span className="text-xs font-bold text-neon">{oracleTokens}</span>
            <span className="text-[10px] uppercase text-gray-400">🔮 Энергии</span>
            <span className="w-4 h-4 rounded-full bg-neon/20 flex items-center justify-center text-[10px] text-neon">+</span>
        </div>
      </header>

      {/* 2. TAROT HOOK */}
      <section className="mb-8 flex justify-center perspective-1000" onClick={() => triggerHaptic('light')}>
        <div className="relative w-full max-w-[200px] aspect-[2/3] group">
            <div className="absolute inset-0 bg-gold/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>
            <div className="relative h-full bg-gradient-to-b from-[#1a1a1a] to-black rounded-xl border border-gold/40 flex flex-col items-center justify-between p-4 shadow-2xl overflow-hidden">
                 {/* Card Content */}
                <div className="text-xs text-gold/60 uppercase tracking-widest font-cinzel mt-2">Карта Дня</div>
                <div className="text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-float">
                    {prediction.tarotCard.icon}
                </div>
                <div className="text-center pb-2">
                    <h3 className="text-gold font-cinzel text-lg leading-tight">{prediction.tarotCard.name}</h3>
                </div>
            </div>
        </div>
      </section>

      {/* 3. ORACLE FUNNEL */}
      <section className="mb-8 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon via-purple-500 to-neon opacity-20 blur-md rounded-2xl"></div>
          <div className="relative bg-[#0F0518]/90 border border-neon/30 rounded-2xl p-5 backdrop-blur-xl">
              
              <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">👁️</span>
                  <h3 className="font-cinzel text-white text-sm tracking-wide">Спроси Звезды</h3>
              </div>

              {!oracleAnswer ? (
                  <div className="space-y-3">
                      <p className="text-[11px] text-gray-400 font-lato leading-relaxed">
                          Задайте вопрос, который тревожит ваше сердце. ИИ-Оракул настроится на вашу астральную карту.
                      </p>
                      <div className="relative">
                          <input 
                              ref={inputRef}
                              type="text" 
                              placeholder="Например: Встречу ли я любовь?" 
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-neon focus:ring-1 focus:ring-neon focus:outline-none transition-all placeholder:text-gray-500 font-lato"
                              value={oracleQuestion}
                              onChange={(e) => setOracleQuestion(e.target.value)}
                          />
                          <button 
                            onClick={handleOracleConsult}
                            disabled={isConsulting}
                            className="absolute right-1 top-1 bottom-1 bg-neon hover:bg-neon/80 text-white rounded-lg px-4 font-cinzel text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:grayscale"
                          >
                             {isConsulting ? "..." : "↗"}
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="animate-fadeIn">
                      <div className="mb-4 p-4 bg-gradient-to-br from-neon/10 to-transparent rounded-lg border border-neon/30 shadow-[0_0_15px_rgba(176,38,255,0.1)]">
                          <p className="font-lato text-sm text-white italic leading-relaxed drop-shadow-sm">"{oracleAnswer}"</p>
                      </div>
                      <button 
                        onClick={() => { triggerHaptic('light'); setOracleAnswer(null); setOracleQuestion(''); }}
                        className="w-full py-2 text-xs text-neon border border-neon/30 rounded-lg hover:bg-neon/10 transition-colors uppercase font-cinzel"
                      >
                          Спросить еще раз
                      </button>
                  </div>
              )}
          </div>
      </section>

      {/* 4. THE SEALED SCROLL (IMPROVED TEASER) */}
      <section className="mb-8">
        <h2 className="font-cinzel text-center text-gray-500 text-xs tracking-[0.3em] mb-4 uppercase">Личное Пророчество</h2>
        
        <div className="relative min-h-[160px] rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl"></div>
            
            {/* Locked Content - Now using blur-md */}
            <div className={`relative p-6 h-full flex flex-col items-center justify-center transition-all duration-700 ${isLocked ? 'blur-md opacity-60' : 'opacity-100'}`}>
                 <p className="font-cinzel text-center text-gray-300 leading-7">
                    {isLocked 
                        ? "Звезды сложились в редкую конфигурацию. Ваше имя звучит в чертогах судьбы..." 
                        : `"${prediction.text}"`
                    }
                 </p>
            </div>

            {/* TEASER PAYWALL */}
            {isLocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[4px]">
                    
                    {/* The Hook: Showing the "Topic" but hiding the details */}
                    <div className="mb-4 px-4 py-1 bg-red-900/30 border border-red-500/30 rounded-full animate-pulse">
                         <span className="text-red-400 font-cinzel text-xs font-bold tracking-wide uppercase">
                            {prediction.teaser || "⚠️ Важное Послание"}
                         </span>
                    </div>

                    <button 
                        onClick={onUnlockPremium}
                        className="bg-gradient-to-r from-gold to-[#B8860B] text-black font-cinzel font-bold text-xs py-3 px-8 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
                    >
                        <span>Снять Печать</span>
                        <span className="bg-black/20 px-1.5 rounded text-[10px]">199₽</span>
                    </button>
                    
                    <button 
                        onClick={onUnlockDaily}
                        className="mt-4 text-[10px] text-gray-400 underline decoration-gray-600 underline-offset-2 hover:text-white transition-colors"
                    >
                        Открыть за подписку
                    </button>
                </div>
            )}
        </div>
      </section>

      {/* 5. STATS */}
      <div className="grid grid-cols-3 gap-3 mb-8 opacity-80">
        <StatBar label="Карма" value={prediction.karma} color="bg-purple-500" />
        <StatBar label="Удача" value={prediction.luck} color="bg-gold" />
        <StatBar label="Любовь" value={prediction.love} color="bg-pink-500" />
      </div>

      {/* 6. FOOTER */}
      <button onClick={onReset} className="w-full text-center text-[10px] text-gray-700 uppercase tracking-widest hover:text-red-900 transition-colors">
          Начать новую жизнь (Сброс)
      </button>

      {/* --- MODALS --- */}
      {showTokenModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setShowTokenModal(false)}>
              <div className="w-full max-w-sm bg-[#121212] border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 pb-10 sm:pb-6 transform transition-transform" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-cinzel text-neon">Недостаточно Энергии</h3>
                      <button onClick={() => setShowTokenModal(false)} className="text-gray-500 text-xl">×</button>
                  </div>
                  <p className="text-gray-400 text-sm font-lato mb-6">
                      Оракул требует подношения для связи с астралом. Ваш вопрос сохранен, но для ответа нужна энергия.
                  </p>
                  
                  <div className="space-y-3">
                      <button 
                        onClick={() => { onBuyTokens(); setShowTokenModal(false); }}
                        className="w-full bg-neon hover:bg-neon/80 text-white font-cinzel py-4 rounded-xl shadow-[0_0_20px_rgba(176,38,255,0.3)] flex items-center justify-between px-6 active:scale-95 transition-transform"
                      >
                          <span className="flex flex-col items-start">
                              <span className="text-sm font-bold">5 Ответов Оракула</span>
                              <span className="text-[10px] opacity-70">Самый популярный выбор</span>
                          </span>
                          <span className="text-lg font-bold">99₽</span>
                      </button>
                      
                      <button 
                        onClick={() => setShowTokenModal(false)}
                        className="w-full py-3 text-gray-500 text-xs font-lato"
                      >
                          Я спрошу позже...
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

// Simple Stat Bar Component
const StatBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase text-gray-400 font-cinzel">{label}</span>
            <span className="text-xs font-bold text-white">{value}%</span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${color} shadow-[0_0_10px_currentColor]`} style={{ width: `${value}%`, transition: 'width 1s ease-out' }}></div>
        </div>
    </div>
);

export default Dashboard;