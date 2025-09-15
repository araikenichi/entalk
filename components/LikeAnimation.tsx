import React, { useState, useEffect } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface LikeAnimationProps {
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

const LikeAnimation: React.FC<LikeAnimationProps> = ({ isAnimating, onAnimationComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isAnimating) {
      // 创建简单的爆炸式粒子
      const newParticles: Particle[] = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const velocity = 1 + Math.random() * 1.5;
        
        newParticles.push({
          id: i,
          x: 0,
          y: 0,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 60 + Math.random() * 20,
          maxLife: 60 + Math.random() * 20,
          size: 2 + Math.random() * 2
        });
      }
      setParticles(newParticles);

      // 动画循环
      const animationLoop = () => {
        setParticles(prev => {
          const updated = prev.map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
            vx: particle.vx * 0.98,
            vy: particle.vy * 0.98 + 0.1 // 重力效果
          })).filter(particle => particle.life > 0);
          
          if (updated.length === 0) {
            onAnimationComplete();
          }
          
          return updated;
        });
      };

      const interval = setInterval(animationLoop, 16); // ~60fps
      
      return () => clearInterval(interval);
    }
  }, [isAnimating, onAnimationComplete]);

  if (!isAnimating || particles.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 1000 }}>
      {particles.map(particle => {
        const opacity = particle.life / particle.maxLife;
        const scale = 1 - (particle.life / particle.maxLife) * 0.5;
        
        return (
          <div
            key={particle.id}
            className="absolute bg-red-500 rounded-full"
            style={{
              left: `calc(50% + ${particle.x}px)`,
              top: `calc(50% + ${particle.y}px)`,
              opacity,
              transform: `scale(${scale})`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        );
      })}
    </div>
  );
};

export default LikeAnimation;