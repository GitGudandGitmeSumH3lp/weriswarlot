'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import GameUI from '@/components/game/GameUI';
import { useGameStore } from '@/store/gameStore';

const GameRoot = dynamic(() => import('./GameRoot'), {
  ssr: false,
  loading: () => <div className="text-white">LOADING...</div>,
});

export default function GameCanvas() {
  const resetCount = useGameStore((state) => state.resetCount);

  return (
    <div className="relative w-[800px] h-[600px] bg-black mx-auto border-4 border-neutral-800 shadow-2xl overflow-hidden">
      
      {/* LAYER 0: GAME */}
      <div className="absolute inset-0 z-0">
        <GameRoot resetCount={resetCount} />
      </div>

      {/* LAYER 1: UI (Inherits 800x600 from parent) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <GameUI />
      </div>
      
    </div>
  );
}