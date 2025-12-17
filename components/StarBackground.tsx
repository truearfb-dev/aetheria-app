import React from 'react';

const StarBackground: React.FC = () => {
  // Generate random positions for stars once
  const stars = React.useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      size: Math.random() > 0.8 ? '3px' : '2px',
      opacity: Math.random() * 0.7 + 0.3
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-[#1a0b2e] to-void opacity-90"></div>
      
      {/* Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-pulse-slow"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            opacity: star.opacity
          }}
        />
      ))}
      
      {/* Mystical Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-neon opacity-10 blur-[100px] rounded-full animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-gold opacity-10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};

export default StarBackground;