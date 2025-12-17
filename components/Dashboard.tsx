import React, { useState } from 'react';
import { UserProfile, DailyPrediction } from '../types';
import Paywall from './Paywall';
import { getTelegramWebApp, triggerHaptic, triggerNotification } from '../services/telegram';
import { askTheOracle } from '../services/geminiService';

interface DashboardProps {
  user: UserProfile;
  prediction: DailyPrediction;
  isLocked: boolean;
  onUnlock: () => void;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, prediction, isLocked, onUnlock, onReset }) => {
  const tg = getTelegramWebApp();
  const [oracleOpen, setOracleOpen] = useState(false);
  const [oracleQuestion, setOracleQuestion] = useState('');
  const [oracleAnswer, setOracleAnswer] = useState<string | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);

  const handleShare = () => {
    triggerHaptic('medium');
    const text = `✨ ЭТЕРИЯ: Моя карта дня — ${prediction.tarotCard.name}.\n🔮 Знак: ${user.zodiacSign}\n\nУзнай, что звезды говорят о тебе:`;
    const url = "https://t.me/AetheriaBot/app"; // Replace with your actual bot link
    
    if (tg) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    } else {
        alert("Поделиться можно только в Telegram.");
    }
  };

  const handleOracleConsult = async () => {
    if (!oracleQuestion.trim()) return;
    triggerHaptic('heavy');
    setIsConsulting(true);
    setOracleAnswer(null);
    const answer = await askTheOracle(oracleQuestion, user.zodiacSign, user.name);
    triggerNotification('success');
    setOracleAnswer(answer);
    setIsConsulting(false);
  };

  const toggleOracle = () => {
      triggerHaptic('light');
      setOracleOpen(!oracleOpen);
  }

  return (
    <div className="relative z-10 p-6 max-w-lg mx-auto pb-24 animate-fadeIn">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
        <div>
            <h1 className="text-2xl font-cinzel text-white">Привет, {user.name}</h1>
            <p className="text-xs text-gold uppercase tracking-widest">{new Date().toLocaleDateString('ru-RU')}</p>
        </div>
        <div className="flex flex-col items-center">
            <span className="text-2xl text-gold">{getZodiacIcon(user.zodiacSign)}</span>
            <span className="text-[10px] uppercase text-gray-400">{user.zodiacSign}</span>
        </div>
      </header>

      {/* Tarot Card of the Day */}
      <section className="mb-8 flex flex-col items-center" onClick={() => triggerHaptic('light')}>
        <h2 className="font-cinzel text-gray-400 text-xs tracking-[0.2em] mb-4 uppercase">Карта Дня</h2>
        <div className="w-48 h-72 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-xl border border-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.1)] flex flex-col items-center justify-center p-4 relative group hover:border-gold/60 transition-all duration-500 transform active:scale-95">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {prediction.tarotCard.icon}
            </div>
            <h3 className="text-gold font-cinzel text-lg text-center mb-2">{prediction.tarotCard.name}</h3>
            <p className="text-gray-400 text-xs text-center font-lato italic opacity-80">{prediction.tarotCard.meaning}</p>
            
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-gold/50"></div>
            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-gold/50"></div>
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-gold/50"></div>
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-gold/50"></div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCircle label="Карма" value={prediction.karma} color="#B026FF" />
        <StatCircle label="Удача" value={prediction.luck} color="#D4AF37" />
        <StatCircle label="Любовь" value={prediction.love} color="#FF69B4" />
      </div>

      {/* Main Prediction Card (Locked/Unlocked) */}
      <section className="relative mb-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden min-h-[150px] flex items-center justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-gold shadow-[0_0_20px_#D4AF37]"></div>
        
        <div className={`relative transition-all duration-700 w-full ${isLocked ? 'blur-md opacity-50 select-none' : 'opacity-100'}`}>
             {/* If prediction.text starts with default value, it means AI failed or loading, but we show it anyway */}
            <p className="font-lato text-gray-200 leading-relaxed text-center italic text-sm">
                "{prediction.text}"
            </p>
        </div>
        {isLocked && <Paywall onUnlock={onUnlock} />}
      </section>

      {/* Lucky Color */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-8">
        <span className="font-cinzel text-sm text-gray-300">Цвет Дня</span>
        <div className="flex items-center gap-3">
            <span className="font-lato text-xs uppercase tracking-wide">{prediction.luckyColor}</span>
            <div 
                className="w-8 h-8 rounded-full shadow-inner border border-white/20" 
                style={{ backgroundColor: prediction.luckyColorHex }}
            ></div>
        </div>
      </div>

      {/* Oracle Feature */}
      <section className="mb-8">
          <button 
            onClick={toggleOracle}
            className="w-full py-3 border border-neon/50 bg-neon/5 rounded-xl text-neon font-cinzel text-sm uppercase tracking-widest hover:bg-neon/10 transition-colors active:scale-95 duration-200"
          >
              {oracleOpen ? "Закрыть Глаз" : "Спросить Оракула"}
          </button>
          
          {oracleOpen && (
              <div className="mt-4 p-4 rounded-xl bg-black/40 border border-neon/30 animate-float">
                  {!oracleAnswer ? (
                      <>
                        <input 
                            type="text" 
                            placeholder="Что ты ищешь?" 
                            className="w-full bg-transparent border-b border-white/20 p-2 text-white font-lato focus:outline-none focus:border-neon mb-4"
                            value={oracleQuestion}
                            onChange={(e) => setOracleQuestion(e.target.value)}
                        />
                        <button 
                            disabled={isConsulting || !oracleQuestion}
                            onClick={handleOracleConsult}
                            className="w-full bg-neon text-white font-cinzel text-xs py-2 rounded disabled:opacity-50 active:scale-95 transition-transform"
                        >
                            {isConsulting ? "Вопрошаю..." : "Узнать"}
                        </button>
                      </>
                  ) : (
                      <div className="text-center">
                          <p className="font-cinzel text-neon mb-2 text-sm">Оракул говорит:</p>
                          <p className="font-lato text-sm text-gray-300">{oracleAnswer}</p>
                          <button 
                            onClick={() => { triggerHaptic('light'); setOracleAnswer(null); setOracleQuestion(''); }}
                            className="mt-4 text-xs text-gray-500 hover:text-white"
                          >
                              Спросить еще
                          </button>
                      </div>
                  )}
              </div>
          )}
      </section>

      {/* Footer Actions */}
      <div className="flex flex-col gap-4">
        <button 
            onClick={handleShare}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-cinzel py-4 rounded-xl border border-white/20 transition-all uppercase tracking-widest text-sm active:scale-95"
        >
            Поделиться Судьбой
        </button>

        <button 
            onClick={onReset}
            className="text-xs text-gray-600 hover:text-red-500 mt-4 transition-colors font-lato"
        >
            [Сбросить данные]
        </button>
      </div>

    </div>
  );
};

const StatCircle: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="flex flex-col items-center">
        <div className="relative w-14 h-14 flex items-center justify-center rounded-full border-2 border-white/10 bg-black/20 mb-2">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                    cx="28" cy="28" r="24" 
                    fill="none" stroke={color} strokeWidth="2" 
                    strokeDasharray={`${(value / 100) * 150}, 150`}
                    strokeLinecap="round"
                    className="opacity-80 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-1000 ease-out"
                />
            </svg>
            <span className="font-lato font-bold text-xs text-white">{value}%</span>
        </div>
        <span className="font-cinzel text-[9px] uppercase text-gray-400">{label}</span>
    </div>
);

const getZodiacIcon = (sign: string) => {
    const icons: Record<string, string> = {
        "Овен": "♈", "Телец": "♉", "Близнецы": "♊", "Рак": "♋",
        "Лев": "♌", "Дева": "♍", "Весы": "♎", "Скорпион": "♏",
        "Стрелец": "♐", "Козерог": "♑", "Водолей": "♒", "Рыбы": "♓"
    };
    return icons[sign] || "✨";
};

export default Dashboard;