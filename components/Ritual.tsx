import React, { useEffect, useState } from 'react';

interface RitualProps {
  zodiac: string;
  onComplete: () => void;
}

const Ritual: React.FC<RitualProps> = ({ zodiac, onComplete }) => {
  const [text, setText] = useState("Выравнивание Звездной Пыли...");

  useEffect(() => {
    const texts = [
      "Чтение Небесной Карты...",
      `Связь с энергией: ${zodiac}...`,
      "Открытие Бездны..."
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < texts.length) {
        setText(texts[step]);
        step++;
      }
    }, 1000);

    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [zodiac, onComplete]);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
      {/* Rotating Mandala/Circle CSS */}
      <div className="relative w-48 h-48 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-gold/30 animate-spin-slow"></div>
        <div className="absolute inset-4 rounded-full border border-gold/50 animate-pulse-slow"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
        </div>
        {/* Particles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-neon rounded-full shadow-[0_0_10px_#B026FF]"></div>
      </div>

      <h2 className="text-xl font-cinzel text-white animate-pulse transition-all duration-500">
        {text}
      </h2>
    </div>
  );
};

export default Ritual;