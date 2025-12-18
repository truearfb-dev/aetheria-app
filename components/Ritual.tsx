import React, { useEffect, useState, useRef } from 'react';
import { triggerHaptic } from '../services/telegram';

interface RitualProps {
  zodiac: string;
  onComplete: () => void;
  onStart: () => void;
}

const Ritual: React.FC<RitualProps> = ({ zodiac, onComplete, onStart }) => {
  const [text, setText] = useState("Прикоснитесь к сфере...");
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (isPressing && !hasStartedRef.current) {
        hasStartedRef.current = true;
        onStart();
        triggerHaptic('medium');
    }
    
    let interval: any;
    if (isPressing && progress < 100) {
        interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 1.5;
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 800);
                    return 100;
                }
                if (Math.floor(next) % 10 === 0) triggerHaptic('light');
                return next;
            });
        }, 50);
    }
    
    return () => clearInterval(interval);
  }, [isPressing, progress, onStart, onComplete]);

  useEffect(() => {
    if (progress > 10 && progress < 40) setText("Считывание вибраций...");
    if (progress > 40 && progress < 70) setText(`Связь с энергией ${zodiac}...`);
    if (progress > 70 && progress < 95) setText("Формирование линий судьбы...");
    if (progress >= 95) setText("Откровение готово...");
  }, [progress, zodiac]);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center select-none">
      <div 
        onMouseDown={() => setIsPressing(true)}
        onMouseUp={() => setIsPressing(false)}
        onTouchStart={() => setIsPressing(true)}
        onTouchEnd={() => setIsPressing(false)}
        className="relative w-72 h-72 mb-12 cursor-pointer group"
      >
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
                cx="144" cy="144" r="130"
                fill="none" stroke="currentColor"
                strokeWidth="2" className="text-white/5"
            />
            <circle
                cx="144" cy="144" r="130"
                fill="none" stroke="currentColor"
                strokeWidth="4" className="text-gold transition-all duration-200"
                strokeDasharray={2 * Math.PI * 130}
                strokeDashoffset={2 * Math.PI * 130 * (1 - progress / 100)}
                strokeLinecap="round"
            />
        </svg>

        <div className={`absolute inset-8 rounded-full border border-gold/20 flex items-center justify-center transition-all duration-500 ${isPressing ? 'scale-110' : 'scale-100'}`}>
            <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-gold/40 to-neon/40 blur-2xl animate-pulse transition-opacity duration-300 ${isPressing ? 'opacity-100' : 'opacity-40'}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-4xl transition-transform duration-500 ${isPressing ? 'scale-150 rotate-180' : 'scale-100'}`}>🔮</span>
            </div>
        </div>
        
        {!isPressing && progress < 100 && (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full animate-ping border border-gold/40 opacity-20"></div>
            </div>
        )}
      </div>

      <h2 className="text-xl font-cinzel text-white tracking-widest min-h-[1.5em] duration-300">
        {text}
      </h2>
      
      <div className="mt-8 flex flex-col items-center gap-2">
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gold transition-all duration-200" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">
            {isPressing ? "Энергия передается..." : "Удерживайте для связи"}
          </p>
      </div>
    </div>
  );
};

export default Ritual;