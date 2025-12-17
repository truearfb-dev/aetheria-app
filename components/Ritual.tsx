import React, { useEffect, useState, useRef } from 'react';
import { triggerHaptic } from '../services/telegram';

interface RitualProps {
  zodiac: string;
  onComplete: () => void;
  onStart: () => void;
}

const Ritual: React.FC<RitualProps> = ({ zodiac, onComplete, onStart }) => {
  const [text, setText] = useState("Выравнивание Звездной Пыли...");
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        onStart(); // Trigger AI loading
        triggerHaptic('medium');
    }

    const texts = [
      "Чтение Небесной Карты...",
      `Связь с энергией знака ${zodiac}...`,
      "Анализ линий судьбы...",
      "⚠️ Обнаружено важное послание..." // The Hook
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < texts.length) {
        setText(texts[step]);
        if (step === texts.length - 1) {
            triggerHaptic('heavy'); // Strong vibration on the "Warning" step
        } else {
            triggerHaptic('light');
        }
        step++;
      }
    }, 1500);

    const timer = setTimeout(() => {
      onComplete();
    }, 6500); // Increased duration slightly for the hook

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [zodiac, onComplete, onStart]);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
      {/* Rotating Mandala/Circle CSS */}
      <div className="relative w-64 h-64 mb-12">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-gold/30 animate-spin-slow"></div>
        <div className="absolute inset-4 rounded-full border border-gold/50 animate-pulse-slow"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] animate-pulse"></div>
        </div>
        
        {/* Mysterious Runes/Particles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-gold/50 text-xs font-cinzel">✦</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-gold/50 text-xs font-cinzel">✦</div>
        
        <div className="absolute top-1/2 left-0 -translate-x-2 -translate-y-1/2 text-neon/50 text-xs font-cinzel">☾</div>
        <div className="absolute top-1/2 right-0 translate-x-2 -translate-y-1/2 text-neon/50 text-xs font-cinzel">☽</div>
      </div>

      <h2 className="text-2xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-white via-gold to-white animate-pulse transition-all duration-500 tracking-wider">
        {text}
      </h2>
      <p className="text-gray-500 text-xs mt-4 font-lato uppercase tracking-[0.3em] animate-pulse">Не закрывайте приложение</p>
    </div>
  );
};

export default Ritual;