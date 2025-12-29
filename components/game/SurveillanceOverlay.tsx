'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function SurveillanceOverlay() {
  const [time, setTime] = useState('');
  const scanLog = useGameStore((state) => state.scanLog);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').substring(0, 19));
    };
    const interval = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(interval);
  }, []);

  return (
    // CHANGE: 'fixed' instead of 'absolute'. 'z-[9999]' to force top layer.
    // We use calc/margins to align it perfectly over the 800x600 game area purely visually.
    <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center">
      
      {/* This container matches the exact size of your game canvas (800x600) */}
      <div className="relative w-[800px] h-[600px] border-4 border-transparent">
        
        {/* 1. TOP UI */}
        <div className="absolute top-4 left-4 flex flex-col">
            <div className="bg-black/60 px-2 py-1 border-l-4 border-red-500 text-xs font-mono text-white shadow-lg backdrop-blur-md">
                <span className="font-bold">CAM_04 [PLAZA]</span><br/>
                <span className="text-gray-300">{time}</span>
            </div>
        </div>
        
        <div className="absolute top-4 right-4">
             <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded border border-white/10 backdrop-blur-md">
                <span className="animate-pulse text-red-500 text-lg">●</span> 
                <span className="text-white font-bold font-mono text-sm tracking-widest">REC</span>
             </div>
        </div>

        {/* 2. CENTER CROSSHAIR */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
            <div className="w-16 h-0.5 bg-white"></div>
            <div className="h-16 w-0.5 bg-white absolute top-0 left-1/2 -translate-x-1/2"></div>
        </div>

        {/* 3. ANALYSIS LOG (The pink box test, styled properly) */}
        <div className="absolute bottom-6 left-6 max-w-sm">
            <div className="bg-black/80 backdrop-blur-md border-l-4 border-yellow-400 p-4 shadow-2xl">
              <div className="text-[10px] text-yellow-400 uppercase tracking-widest mb-1 font-bold">Evidence Scanner</div>
              <div className="font-mono text-sm text-white font-bold leading-snug uppercase drop-shadow-md">
                  {scanLog || "SYSTEM IDLE..."}
              </div>
            </div>
        </div>

        {/* 4. VISUAL FX LAYERS */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]" />
      </div>
    </div>
  );
}