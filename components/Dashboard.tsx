import React, { useState, useEffect } from 'react';
import { UserProfile, DailyPrediction } from '../types';
import { triggerHaptic, triggerNotification, getTelegramWebApp } from '../services/telegram';

// ==========================================
// НАСТРОЙКИ КАНАЛА:
const CHANNEL_URL = "https://t.me/durov"; 
const CHANNEL_ID = "@durov"; 
// ==========================================

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
  const mainText = parts[1]?.trim() || "";

  // Таймер до полуночи
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

  const handleUnlockClick = () => {
    triggerHaptic('medium');
    setShowPayOptions(true);
  };

  const handleShare = () => {
    triggerHaptic('light');
    const shareText = `🔮 Моё пророчество на сегодня: "${prediction.tarotCard.name}". Узнай свою судьбу в Этерии!`;
    const shareUrl = "https://t.me/your_bot_user_name/app"; // Замените на вашу ссылку
    
    if (tg && (tg as any).shareToStory) {
        (tg as any).shareToStory(shareUrl, { text: shareText });
    } else {
        const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        if (tg) tg.openTelegramLink(fullUrl);
        else window.open(fullUrl, '_blank');
    }
  };

  const verifySubscription = async () => {
    const userId = tg?.initDataUnsafe?.user?.id;
    if (!userId) {
        alert("Ошибка ID. Перезапустите приложение.");
        return;
    }
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
            alert("Вы еще не подписались на канал.");
        }
    } catch (e) {
        alert("Ошибка проверки.");
    } finally {
        setIsCheckingSub(false);
    }
  };

  const handleChannelAction = () => {
    if (tg) tg.openTelegramLink(CHANNEL_URL);
    else window.open(CHANNEL_URL, '_blank');
  };

  return (
    <div className="relative z-10 p-3 max-w-lg mx-auto h-[100dvh] flex flex-col justify-between overflow-hidden animate-fadeIn select-none">
      
      <div className="flex-1 flex flex-col min-h-0">
        <header className="flex justify-between items-start mb-1.5 border-b border-white/5 pb-1 shrink-0">
            <div className="flex flex-col">
                <h1 className="text-base font-cinzel text-white leading-tight uppercase tracking-widest">Этерия</h1>
                <p className="text-[8px] text-gold/80 font-cinzel uppercase tracking-wider">{todayDate}</p>
            </div>
            <div className="text-right flex flex-col items-end">
                <p className="text-[9px] text-white font-cinzel uppercase">{user.zodiacSign}</p>
                <div className="flex items-center gap-1">
                   <div className="w-1 h-1 rounded-full bg-gold animate-pulse"></div>
                   <p className="text-[6px] text-gray-500 font-lato uppercase tracking-tighter">Связь установлена</p>
                </div>
            </div>
        </header>

        <section className="mb-1.5 shrink-0">
            <div className="relative w-full h-[40px] bg-white/5 rounded-lg border border-white/10 flex items-center px-4 gap-3">
                <span className="text-lg shrink-0">{prediction.tarotCard.icon}</span>
                <div className="flex flex-col">
                    <span className="text-[5px] text-gold/40 uppercase font-cinzel tracking-widest leading-none">Аркан</span>
                    <span className="text-[9px] text-gold font-cinzel uppercase tracking-wider">{prediction.tarotCard.name}</span>
                </div>
            </div>
        </section>

        <section className="relative flex-1 min-h-0 flex flex-col mb-2">
            <div className="relative flex-1 bg-black/40 border border-white/10 rounded-2xl flex flex-col shadow-2xl backdrop-blur-md overflow-hidden">
                <div className="p-4 sm:p-5 flex-1 flex flex-col overflow-hidden relative">
                    <h2 className="font-cinzel text-center text-gold/30 text-[7px] font-bold tracking-[0.8em] mb-3 uppercase shrink-0">✧ ПРОРОЧЕСТВО СУДЬБЫ ✧</h2>
                    
                    <div className="relative flex-1 flex flex-col overflow-hidden">
                        <div className="relative z-10 shrink-0 mb-1">
                           <p className="text-white font-cinzel text-[14px] leading-[1.6] text-center italic px-1 drop-shadow-sm">
                                {introText}
                                {isLocked && (
                                    <span className="inline-block ml-1">
                                        <span className="text-gold">...</span>
                                        <span className="inline-block ml-2 animate-bounce text-gold not-italic">↓</span>
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="relative flex-1 overflow-hidden mt-2">
                            <div className={`transition-all duration-1000 h-full ${isLocked ? 'blur-[5px] opacity-30 scale-[1.01] tracking-tighter' : 'blur-0 opacity-100 overflow-y-auto pt-2 custom-scrollbar'}`}>
                                <p className="text-gray-100 font-lato text-[12px] leading-[1.8] text-center whitespace-pre-wrap px-3 italic pb-10">
                                    {mainText || "..."}
                                </p>
                                
                                {/* POST-REVEAL ACTIONS (When Unlocked) */}
                                {!isLocked && (
                                    <div className="mt-6 space-y-6 pb-20 animate-fadeIn">
                                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
                                        
                                        {/* SHARE BUTTON */}
                                        <button 
                                            onClick={handleShare}
                                            className="w-full bg-white/5 border border-white/10 py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
                                        >
                                            <span className="text-gold text-lg group-hover:rotate-12 transition-transform">✨</span>
                                            <span className="text-[10px] font-cinzel uppercase tracking-[0.2em] text-white">Поделиться Откровением</span>
                                        </button>

                                        {/* NEXT PROPHECY TIMER */}
                                        <div className="flex flex-col items-center gap-2 py-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[7px] text-gray-500 uppercase tracking-[0.4em] font-cinzel">Следующее пророчество через</p>
                                            <p className="text-xl font-cinzel text-gold tracking-widest">{timeLeft}</p>
                                        </div>

                                        <div className="text-center italic text-gray-500 text-[10px] px-6">
                                            «Звезды дали свой ответ. Теперь Твой ход в этом великом танце Вселенной...»
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-start z-20">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                                    <div className="relative z-30 w-full px-6 flex flex-col items-center gap-4 mt-8">
                                        <button 
                                            onClick={handleUnlockClick}
                                            className="group relative w-full max-w-[260px] bg-gradient-to-b from-gold via-gold to-[#B8860B] text-black font-cinzel font-bold py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,1)] active:scale-95 transition-all flex flex-col items-center overflow-hidden border border-white/40"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
                                            <span className="text-[11px] tracking-[0.15em] uppercase drop-shadow-sm leading-none pt-1">Раскрыть Откровение</span>
                                            <div className="w-1/2 h-[1px] bg-black/20 my-1.5"></div>
                                            <span className="text-[11px] uppercase font-lato font-black tracking-[0.1em] text-black/90 px-2 drop-shadow-sm">Узнать продолжение</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </div>

      <div className="shrink-0 pb-1">
        <div className="grid grid-cols-3 gap-2 mb-2">
            <StatCard label="Карма" value={prediction.karma} color="from-purple-900/40 to-black" borderColor="border-purple-500/20" textColor="text-purple-300" />
            <StatCard label="Удача" value={prediction.luck} color="from-gold/30 to-black" borderColor="border-gold/20" textColor="text-gold" />
            <StatCard label="Любовь" value={prediction.love} color="from-pink-900/40 to-black" borderColor="border-pink-500/20" textColor="text-pink-300" />
        </div>
        <button onClick={onReset} className="w-full text-center text-[7px] text-white/20 uppercase tracking-[0.4em] font-cinzel py-1 hover:text-white/40 transition-colors">
            — Обновить Поток —
        </button>
      </div>

      {showPayOptions && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-md animate-fadeIn" onClick={() => setShowPayOptions(false)}>
              <div className="w-full max-w-sm bg-[#0a0a0a] border-t border-white/10 rounded-t-[2.5rem] p-8 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
                  <h3 className="text-xl font-cinzel text-white text-center mb-1 uppercase tracking-[0.2em]">Принять Судьбу</h3>
                  <p className="text-gray-500 text-[10px] text-center mb-8 font-lato uppercase tracking-widest text-balance">Звезды не говорят бесплатно с теми, кто не готов к истине</p>
                  
                  <div className="space-y-3">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                          <button onClick={handleChannelAction} className="w-full flex items-center justify-between group active:scale-[0.98] transition-all">
                              <div className="text-left">
                                  <p className="text-[11px] font-cinzel text-gold tracking-widest uppercase">1. Подписаться на канал</p>
                                  <p className="text-[8px] text-gray-500 uppercase mt-0.5 font-lato">Вступить в наш круг Этерии</p>
                              </div>
                              <span className="text-lg">📢</span>
                          </button>
                          <div className="h-[1px] bg-white/5 w-full"></div>
                          <button 
                            onClick={verifySubscription} 
                            disabled={isCheckingSub}
                            className={`w-full py-3 rounded-xl border border-gold/30 font-cinzel text-[10px] uppercase tracking-widest transition-all ${isCheckingSub ? 'opacity-50' : 'bg-gold/10 text-gold active:scale-95'}`}
                          >
                              {isCheckingSub ? 'Спрашиваю Звезды...' : '2. Проверить подписку и открыть'}
                          </button>
                      </div>

                      <div className="flex items-center gap-2 py-1">
                          <div className="h-[1px] flex-1 bg-white/5"></div>
                          <span className="text-[8px] text-gray-600 font-cinzel uppercase tracking-[0.3em]">или</span>
                          <div className="h-[1px] flex-1 bg-white/5"></div>
                      </div>

                      <button onClick={() => { onSingleUnlock(); setShowPayOptions(false); }} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all">
                          <div className="text-left">
                              <p className="text-[11px] font-cinzel text-white tracking-widest uppercase">Разовый Доступ</p>
                              <p className="text-[8px] text-gray-500 uppercase mt-0.5 font-lato">Открыть без подписок</p>
                          </div>
                          <span className="text-gold font-bold font-cinzel text-base">99₽</span>
                      </button>

                      <button onClick={() => { onUnlockPremium(); setShowPayOptions(false); }} className="w-full bg-gradient-to-r from-gold to-[#B8860B] p-5 rounded-2xl flex items-center justify-between shadow-[0_10px_40px_rgba(212,175,55,0.2)] group active:scale-[0.98] transition-all">
                          <div className="text-left">
                              <p className="text-[11px] font-cinzel text-black font-bold tracking-widest uppercase">Путь Мастера</p>
                              <p className="text-[8px] text-black/70 uppercase mt-0.5 font-bold font-lato">Подписка на месяц</p>
                          </div>
                          <span className="text-black font-black font-cinzel text-base">199₽</span>
                      </button>
                  </div>
                  <button onClick={() => setShowPayOptions(false)} className="w-full mt-6 text-[9px] text-gray-700 uppercase tracking-[0.4em] py-2 font-lato font-bold">Вернуться назад</button>
              </div>
          </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string; borderColor: string; textColor: string }> = ({ label, value, color, borderColor, textColor }) => (
    <div className={`bg-gradient-to-b ${color} ${borderColor} border rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 shadow-lg`}>
        <span className="text-[8px] uppercase text-white/30 font-cinzel tracking-wider leading-none">{label}</span>
        <span className={`text-[13px] sm:text-[14px] font-bold font-cinzel ${textColor}`}>{value}%</span>
    </div>
);

export default Dashboard;