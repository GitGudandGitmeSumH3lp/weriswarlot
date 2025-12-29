'use client';

import { useGameStore } from '@/store/gameStore';

export default function PanicOverlay() {
  const { panicLevel, timeLeft } = useGameStore();
  
  // Calculate intensity based on panicLevel (0-100) and low time
  // If time < 10, panic spikes
  const effectivePanic = timeLeft < 10 ? 100 : panicLevel;
  
  // Opacity varies from 0.0 to 0.8 based on panic
  const opacity = (effectivePanic / 100) * 0.8;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply transition-opacity duration-1000 ease-in-out"
      style={{
        opacity: opacity,
        background: `radial-gradient(circle, transparent 40%, #500000 100%)`
      }}
    >
      {/* Optional: Grain or Noise could go here later */}
    </div>
  );
}