import React, { useState, useEffect } from 'react';
import { UserProfile, DailyPrediction } from '../types';
import { triggerHaptic, triggerNotification, getTelegramWebApp } from '../services/telegram';

const CHANNEL_URL = "https://t.me/+agv13DXReBY1MzYy"; 
const CHANNEL_ID = "-1003373710045"; 

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
  const [isCheckingSub, setIsCheckingSub] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  
  const tg = getTelegramWebApp();
  const todayDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  
  const parts = prediction.text.split('---');
  const introText = parts[0]?.trim() || "";
  const mainContent = parts[1]?.trim() || "";

  useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diff = tomorrow.getTime() - now.getTime();
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleShare = () => {
    triggerHaptic('light');
    const shareText = `🔮 Моё пророчество: "${prediction.tarotCard.name}". Узнай судьбу в приложении Этерия!`;
    const shareUrl = "https://t.me/your_bot/app";
    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    if (tg) tg.openTelegramLink(fullUrl);
    else window.open(fullUrl, '_blank');
  };

  const verifySubscription = async () => {
    const userId = tg?.initDataUnsafe?.user?.id;
    if (!userId) return;
    setIsCheckingSub(true);
    try {
        const response = await fetch('/api/check-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, channelId: CHANNEL_ID })
        });
        const data = await response.json();
        if (data.subscribed) {
            triggerNotification('success');
            onUnlockDaily();
            setShowPayOptions(false);
        } else {
            triggerNotification('warning');
            alert("Нужно подписаться на канал!");
        }
    } catch (e) {
        alert("Ошибка сети.");
    } finally {
        setIsCheckingSub(false);
    }
  };

  const renderStructuredText = (text: string) => {
      const lines = text.split('\n').filter(l => l.trim());
      return lines.map((line, idx) => {
          let icon = "✦";
          let title = "";
          let content = line;

          if (line.startsWith("УТРО:")) { icon = "🌅"; title = "Утро"; content = line.replace("УТРО:", ""); }
          else if (line.startsWith("ДЕНЬ:")) { icon = "☀️"; title = "День"; content = line.replace("ДЕНЬ:", ""); }
          else if (line.startsWith("ВЕЧЕР:")) { icon = "🌙"; title = "Вечер"; content = line.replace("ВЕЧЕР:", ""); }
          else if (line.startsWith("СОВЕТ:")) { icon = "📜"; title = "Совет Оракула"; content = line.replace("СОВЕТ:", ""); }

          return (
              <div key={idx} className="mb-6 animate-fadeIn" style={{ animationDelay: `${idx * 200}ms` }}>
                  {title && (
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{icon}</span>
                        <span className="text-[10px] font-cinzel text-gold uppercase tracking-[0.2em]">{title}</span>
                    </div>
                  )}
                  <p className={`text-gray-200 font-lato text-[13px] leading-relaxed italic ${!title ? 'text-center opacity-70' : ''}`}>
                    {content.trim()}
                  </p>
              </div>
          );
      });
  };

  return (
    <div className="relative z-10 p-3 max-w-lg mx-auto h-[100dvh] flex flex-col justify-between overflow-hidden animate-fadeIn select-none">
      
      <div className="flex-1 flex flex-col min-h-0">
        <header className="flex justify-between items-start mb-2 border-b border-white/5 pb-1 shrink-0">
            <div className="flex flex-col">
                <h1 className="text-base font-cinzel text-white leading-tight uppercase tracking-widest">Этерия</h1>
                <p className="text-[8px] text-gold/80 font-cinzel uppercase tracking-wider">{todayDate}</p>
            </div>
            <div className="text-right">
                <p className="text-[9px] text-white font-cinzel uppercase">{user.zodiacSign}</p>
            </div>
        </header>

        <section className="mb-2 shrink-0">
            <div className="relative w-full h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center gap-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5"></div>
                <span className="text-2xl">{prediction.tarotCard.icon}</span>
                <div className="flex flex-col">
                    <span className="text-[7px] text-gold/60 uppercase font-cinzel tracking-widest">Аркан дня</span>
                    <span className="text-[11px] text-gold font-cinzel uppercase tracking-widest font-bold">{prediction.tarotCard.name}</span>
                </div>
            </div>
        </section>

        <section className="relative flex-1 min-h-0 flex flex-col mb-4">
            <div className="relative flex-1 bg-black/60 border border-white/10 rounded-[2rem] flex flex-col shadow-2xl backdrop-blur-xl overflow-hidden">
                <div className="p-6 flex-1 flex flex-col overflow-hidden relative">
                    <div className="relative z-10 shrink-0 mb-4 border-b border-white/5 pb-4">
                       <p className="text-white font-cinzel text-[14px] leading-[1.6] text-center italic px-2">
                            {introText}
                        </p>
                    </div>

                    <div className="relative flex-1 overflow-hidden">
                        <div className={`transition-all duration-1000 h-full custom-scrollbar overflow-y-auto px-2 ${isLocked ? 'blur-[8px] opacity-20 pointer-events-none' : 'blur-0 opacity-100'}`}>
                            {renderStructuredText(mainContent || "УТРО: Звезды шепчут о начале.\nДЕНЬ: Тень сменяется светом.\nВЕЧЕР: Покой найдет тебя.")}
                            
                            {!isLocked && (
                                <div className="mt-8 space-y-4 pb-10">
                                    <button onClick={handleShare} className="w-full bg-gold/10 border border-gold/30 py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group">
                                        <span className="text-gold">✨</span>
                                        <span className="text-[10px] font-cinzel uppercase tracking-widest text-gold">Поделиться судьбой</span>
                                    </button>
                                    <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <p className="text-[8px] text-gray-500 uppercase tracking-[0.3em] mb-1">Обновление через</p>
                                        <p className="text-xl font-cinzel text-white/80 tracking-[0.2em]">{timeLeft}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isLocked && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                <button 
                                    onClick={() => setShowPayOptions(true)}
                                    className="group relative bg-gold text-black font-cinzel font-bold px-10 py-5 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.3)] active:scale-95 transition-all"
                                >
                                    <span className="text-[11px] tracking-[0.2em] uppercase">Открыть тайну</span>
                                </button>
                                <p className="mt-4 text-[9px] text-gold/50 uppercase tracking-[0.3em] animate-pulse">Предсказание зашифровано</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
      </div>

      <div className="shrink-0 pb-2">
        <div className="grid grid-cols-3 gap-3">
            <StatCard label="Карма" value={prediction.karma} color="from-purple-900/20" textColor="text-purple-300" />
            <StatCard label="Удача" value={prediction.luck} color="from-gold/20" textColor="text-gold" />
            <StatCard label="Любовь" value={prediction.love} color="from-pink-900/20" textColor="text-pink-300" />
        </div>
        <button onClick={onReset} className="w-full text-center text-[7px] text-white/10 uppercase tracking-[0.5em] font-cinzel py-3 mt-2">
            — Сбросить цикл —
        </button>
      </div>

      {showPayOptions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/95 backdrop-blur-xl animate-fadeIn" onClick={() => setShowPayOptions(false)}>
              <div className="w-full max-w-md bg-[#070707] border-t border-white/10 rounded-t-[3rem] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8"></div>
                  <h3 className="text-xl font-cinzel text-white text-center mb-10 uppercase tracking-[0.3em]">Ритуал Доступа</h3>
                  
                  <div className="space-y-4">
                      <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 space-y-4">
                          <button onClick={() => { if(tg) tg.openTelegramLink(CHANNEL_URL); else window.open(CHANNEL_URL); }} className="w-full flex items-center justify-between group">
                              <div className="text-left">
                                  <p className="text-[12px] font-cinzel text-gold tracking-widest uppercase">1. Вступить в канал</p>
                                  <p className="text-[8px] text-gray-500 uppercase mt-1">Оракул говорит только с верными</p>
                              </div>
                              <span className="text-xl">📢</span>
                          </button>
                          <div className="h-px bg-white/5"></div>
                          <button 
                            onClick={verifySubscription} 
                            disabled={isCheckingSub}
                            className={`w-full py-4 rounded-xl font-cinzel text-[10px] uppercase tracking-[0.2em] transition-all ${isCheckingSub ? 'opacity-50' : 'bg-gold/10 text-gold border border-gold/30 active:scale-95'}`}
                          >
                              {isCheckingSub ? 'Спрашиваю Звезды...' : '2. Подтвердить подписку'}
                          </button>
                      </div>

                      <div className="flex items-center gap-4 py-2 opacity-20">
                          <div className="h-px flex-1 bg-white"></div>
                          <span className="text-[8px] font-cinzel uppercase">Или</span>
                          <div className="h-px flex-1 bg-white"></div>
                      </div>

                      <button onClick={() => { onUnlockPremium(); setShowPayOptions(false); }} className="w-full bg-gold text-black p-5 rounded-2xl flex items-center justify-between active:scale-95 transition-all">
                          <div className="text-left">
                              <p className="text-[11px] font-cinzel font-bold tracking-widest uppercase">Путь Мастера</p>
                              <p className="text-[8px] opacity-70 uppercase font-bold">Вечный доступ (199₽)</p>
                          </div>
                          <span className="text-xl">👑</span>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string; textColor: string }> = ({ label, value, color, textColor }) => (
    <div className={`bg-gradient-to-b ${color} to-black/20 border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-1 shadow-inner`}>
        <span className="text-[7px] uppercase text-white/30 font-cinzel tracking-widest">{label}</span>
        <span className={`text-sm font-bold font-cinzel ${textColor}`}>{value}%</span>
    </div>
);

export default Dashboard;
