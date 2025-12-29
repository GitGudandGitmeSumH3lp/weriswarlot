'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import GameUI from '@/components/game/GameUI';
import { useGameStore } from '@/store/gameStore';

// Fix: Dynamically import the wrapper file, not the library directly
const GameRoot = dynamic(() => import('./GameRoot'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-black text-red-500 font-mono animate-pulse">
      INITIALIZING SYSTEM...
    </div>
  ),
});

export default function GameCanvas() {
  const resetCount = useGameStore((state) => state.resetCount);

  return (
    <div className="relative w-[800px] h-[600px] group border-4 border-gray-800 bg-black overflow-hidden mx-auto">
      
      {/* Z-0: The Game Render */}
      <div className="absolute inset-0 z-0">
        <GameRoot resetCount={resetCount} />
      </div>
      
      {/* Z-10: The UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <GameUI />
      </div>
    </div>
  );
}