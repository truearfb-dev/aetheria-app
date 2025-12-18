import React, { useState, useEffect } from 'react';
import { UserProfile, DailyPrediction } from '../types';
import { triggerHaptic, triggerNotification, getTelegramWebApp } from '../services/telegram';

const CHANNEL_URL = "https://t.me/durov"; 
const CHANNEL_ID = "@durov"; 

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
    const shareText = `🔮 Моё откровение в Этерии: "${prediction.tarotCard.name}". Оракул видит всё...`;
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
          let icon = null;
          let title = "";
          let content = line;
          let type: 'default' | 'special' | 'path' = 'default';

          if (line.startsWith("СОСТОЯНИЕ:")) { 
              icon = "👁️"; title = "Твое Состояние"; content = line.replace("СОСТОЯНИЕ:", ""); 
          } else if (line.startsWith("ВОПРОС:")) { 
              icon = "⚖️"; title = "Теневой Вопрос"; content = line.replace("ВОПРОС:", ""); type = 'special';
          } else if (line.startsWith("УТРО:")) { 
              icon = "🌅"; title = "Утро"; content = line.replace("УТРО:", ""); type = 'path';
          } else if (line.startsWith("ДЕНЬ:")) { 
              icon = "☀️"; title = "День"; content = line.replace("ДЕНЬ:", ""); type = 'path';
          } else if (line.startsWith("ВЕЧЕР:")) { 
              icon = "🌙"; title = "Вечер"; content = line.replace("ВЕЧЕР:", ""); type = 'path';
          } else if (line.startsWith("СОВЕТ:")) { 
              icon = "📜"; title = "Совет"; content = line.replace("СОВЕТ:", ""); 
          }

          if (type === 'special') {
              return (
                <div key={idx} className="my-10 p-8 bg-gold/5 border-y border-gold/20 relative animate-fadeIn">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-void px-4 text-gold font-cinzel text-[8px] tracking-[0.4em] uppercase">Медитация</div>
                    <p className="text-gold font-cinzel text-[16px] leading-relaxed text-center italic drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                        «{content.trim()}»
                    </p>
                </div>
              );
          }

          if (type === 'path') {
            return (
                <div key={idx} className="mb-6 flex gap-4 animate-fadeIn">
                    <div className="shrink-0 flex flex-col items-center">
                        <span className="text-gold/60 text-lg mb-2">{icon}</span>
                        <div className="w-[1px] flex-1 bg-gradient-to-b from-gold/30 to-transparent"></div>
                    </div>
                    <div>
                        <span className="text-[9px] font-cinzel text-gold uppercase tracking-[0.2em]">{title}</span>
                        <p className="text-gray-300 font-lato text-[13px] leading-relaxed italic mt-1">
                            {content.trim()}
                        </p>
                    </div>
                </div>
            );
          }

          return (
              <div key={idx} className="mb-10 animate-fadeIn" style={{ animationDelay: `${idx * 150}ms` }}>
                  {title && (
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-gold/40 text-sm">{icon}</span>
                        <span className="text-[10px] font-cinzel text-gold uppercase tracking-[0.3em]">{title}</span>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/40 to-transparent"></div>
                    </div>
                  )}
                  <p className={`text-white/90 font-lato text-[15px] leading-relaxed italic ${!title ? 'text-center opacity-60 text-[13px]' : ''}`}>
                    {content.trim()}
                  </p>
              </div>
          );
      });
  };

  return (
    <div className="relative z-10 p-3 max-w-lg mx-auto h-[100dvh] flex flex-col justify-between overflow-hidden animate-fadeIn select-none">
      
      <div className="flex-1 flex flex-col min-h-0">
        <header className="flex justify-between items-center mb-4 border-b border-white/5 pb-2 shrink-0">
            <div className="flex flex-col">
                <h1 className="text-base font-cinzel text-white leading-tight uppercase tracking-widest">ЭТЕРИЯ</h1>
                <p className="text-[8px] text-gold/80 font-cinzel uppercase tracking-wider">{todayDate}</p>
            </div>
            <div className="text-right flex flex-col items-end">
                <p className="text-[10px] text-white font-cinzel uppercase tracking-widest">{user.zodiacSign}</p>
                <p className="text-[7px] text-gold/50 font-lato uppercase tracking-wider">{user.name}</p>
            </div>
        </header>

        <section className="mb-4 shrink-0">
            <div className="relative w-full h-20 bg-white/5 rounded-3xl border border-white/10 flex items-center px-8 gap-8 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10 opacity-50"></div>
                <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(212,175,55,0.6)] group-hover:scale-110 transition-transform duration-500">{prediction.tarotCard.icon}</span>
                <div className="flex flex-col">
                    <span className="text-[8px] text-gold/50 uppercase font-cinzel tracking-[0.3em]">Аркан Судьбы</span>
                    <span className="text-[14px] text-gold font-cinzel uppercase tracking-[0.2em] font-bold">{prediction.tarotCard.name}</span>
                </div>
            </div>
        </section>

        <section className="relative flex-1 min-h-0 flex flex-col mb-4">
            <div className="relative flex-1 bg-void/80 border border-white/10 rounded-[3rem] flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden">
                <div className="p-8 sm:p-10 flex-1 flex flex-col overflow-hidden relative">
                    {/* Floating Intro */}
                    <div className="relative z-10 shrink-0 mb-10 text-center animate-fadeIn">
                       <p className="text-white font-cinzel text-[17px] leading-relaxed italic px-4 drop-shadow-2xl">
                            {introText}
                        </p>
                        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-6"></div>
                    </div>

                    <div className="relative flex-1 overflow-hidden">
                        <div className={`transition-all duration-[1200ms] h-full custom-scrollbar overflow-y-auto px-2 ${isLocked ? 'blur-[15px] opacity-10 pointer-events-none' : 'blur-0 opacity-100'}`}>
                            {renderStructuredText(mainContent)}
                            
                            {!isLocked && (
                                <div className="mt-12 space-y-8 pb-24">
                                    <button onClick={handleShare} className="w-full bg-gradient-to-b from-white/10 to-transparent border border-white/20 py-6 rounded-2xl flex items-center justify-center gap-4 active:scale-95 transition-all group shadow-xl">
                                        <span className="text-gold text-xl animate-pulse">✨</span>
                                        <span className="text-[11px] font-cinzel uppercase tracking-[0.4em] text-white">Разделить откровение</span>
                                    </button>
                                    <div className="flex flex-col items-center p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                                        <p className="text-[9px] text-white/30 uppercase tracking-[0.5em] mb-3">Смена цикла через</p>
                                        <p className="text-3xl font-cinzel text-gold tracking-[0.3em] font-bold">{timeLeft}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Centered Paywall Trigger */}
                        {isLocked && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-10">
                                <div className="w-full space-y-6">
                                    <button 
                                        onClick={() => setShowPayOptions(true)}
                                        className="group relative w-full bg-gold text-black font-cinzel font-bold py-6 rounded-2xl shadow-[0_25px_50px_rgba(212,175,55,0.3)] active:scale-95 transition-all flex flex-col items-center overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
                                        <span className="text-[13px] tracking-[0.3em] uppercase">Прочесть свою истину</span>
                                        <span className="text-[8px] opacity-70 uppercase mt-1 tracking-[0.1em] font-lato font-bold">Оракул готов говорить</span>
                                    </button>
                                    <p className="text-[10px] text-gold/50 uppercase tracking-[0.5em] text-center italic animate-pulse">Персональный разбор сформирован</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
      </div>

      <div className="shrink-0 pb-2">
        <div className="grid grid-cols-3 gap-4">
            <StatCard label="Карма" value={prediction.karma} color="from-purple-900/40" textColor="text-purple-300" icon="🌀" />
            <StatCard label="Удача" value={prediction.luck} color="from-gold/40" textColor="text-gold" icon="✴️" />
            <StatCard label="Любовь" value={prediction.love} color="from-pink-900/40" textColor="text-pink-300" icon="⚛️" />
        </div>
        <button onClick={onReset} className="w-full text-center text-[8px] text-white/10 hover:text-white/30 uppercase tracking-[0.6em] font-cinzel py-5 mt-2 transition-all">
            — ИСЧЕЗНУТЬ ИЗ ПОТОКА —
        </button>
      </div>

      {showPayOptions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/98 backdrop-blur-3xl animate-fadeIn" onClick={() => setShowPayOptions(false)}>
              <div className="w-full max-w-md bg-[#030303] border-t border-white/20 rounded-t-[4rem] p-12 shadow-[0_-20px_100px_rgba(212,175,55,0.15)]" onClick={e => e.stopPropagation()}>
                  <div className="w-20 h-1.5 bg-white/10 rounded-full mx-auto mb-12"></div>
                  <h3 className="text-3xl font-cinzel text-white text-center mb-12 uppercase tracking-[0.5em]">Вход в Обитель</h3>
                  
                  <div className="space-y-6">
                      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                          <button onClick={() => { if(tg) tg.openTelegramLink(CHANNEL_URL); else window.open(CHANNEL_URL); }} className="w-full flex items-center justify-between group">
                              <div className="text-left">
                                  <p className="text-[14px] font-cinzel text-gold tracking-[0.2em] uppercase font-bold">Путь Послушника</p>
                                  <p className="text-[10px] text-gray-500 uppercase mt-2 font-lato tracking-wider">Доступ за подписку на круг</p>
                              </div>
                              <span className="text-3xl group-hover:rotate-12 transition-transform">📢</span>
                          </button>
                          <div className="h-[1px] bg-white/10"></div>
                          <button 
                            onClick={verifySubscription} 
                            disabled={isCheckingSub}
                            className={`w-full py-6 rounded-2xl font-cinzel text-[12px] uppercase tracking-[0.4em] transition-all ${isCheckingSub ? 'opacity-50 cursor-not-allowed' : 'bg-gold/10 text-gold border border-gold/50 hover:bg-gold/25 active:scale-95'}`}
                          >
                              {isCheckingSub ? 'Связь с астралом...' : 'Я вступил в круг'}
                          </button>
                      </div>

                      <div className="flex items-center gap-8 py-2 opacity-30">
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white"></div>
                          <span className="text-[11px] font-cinzel uppercase tracking-[0.3em]">ИЛИ</span>
                          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white"></div>
                      </div>

                      <button onClick={() => { onUnlockPremium(); setShowPayOptions(false); }} className="w-full bg-gradient-to-b from-gold to-[#B8860B] text-black p-7 rounded-[2.5rem] flex items-center justify-between shadow-[0_30px_60px_rgba(212,175,55,0.3)] active:scale-95 transition-all">
                          <div className="text-left">
                              <p className="text-[14px] font-cinzel font-bold tracking-[0.3em] uppercase leading-none">Путь Мастера</p>
                              <p className="text-[10px] opacity-80 uppercase font-bold font-lato mt-2">Вечный доступ (199₽)</p>
                          </div>
                          <span className="text-3xl">👑</span>
                      </button>
                  </div>
                  <button onClick={() => setShowPayOptions(false)} className="w-full mt-12 text-[10px] text-gray-700 uppercase tracking-[0.6em] font-lato font-bold hover:text-gray-500 transition-colors">Закрыть Завесу</button>
              </div>
          </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string; textColor: string; icon: string }> = ({ label, value, color, textColor, icon }) => (
    <div className={`bg-gradient-to-b ${color} to-black/60 border border-white/10 rounded-[1.5rem] p-5 flex flex-col items-center gap-3 shadow-2xl backdrop-blur-md`}>
        <span className="text-xl filter drop-shadow-md opacity-70">{icon}</span>
        <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase text-white/40 font-cinzel tracking-[0.3em] leading-none mb-2">{label}</span>
            <span className={`text-base font-bold font-cinzel ${textColor} tracking-widest`}>{value}%</span>
        </div>
    </div>
);

export default Dashboard;