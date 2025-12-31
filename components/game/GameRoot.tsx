'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { GameUI } from '@/components/game/GameUI';
import ScalableContainer from '@/components/layout/ScalableContainer';

// --- PIXI v8 REGISTRATION ---
import { extend } from '@pixi/react';
import { Container, Sprite, Graphics, Text } from 'pixi.js';

extend({
  Container, Sprite, Graphics, Text,
  pixiContainer: Container,
  pixiSprite: Sprite,
  pixiGraphics: Graphics,
  pixiText: Text,
});
// 2. DYNAMIC IMPORT (SSR False)
const GameCanvas = dynamic(() => import('./GameCanvas').then(mod => mod.GameCanvas), { 
  ssr: false,
  loading: () => <div className="text-white font-mono">INITIALIZING NEURAL LINK...</div>
});

export function GameRoot() {
  return (
    <main className="h-screen w-screen bg-slate-950 overflow-hidden flex items-center justify-center">
      <ScalableContainer>
        
        {/* LAYER 1: The Game Engine (Canvas) */}
        <div className="absolute inset-0 z-0">
            <GameCanvas />
        </div>

        {/* LAYER 2: The UI Overlay (HUD/Modals) */}
        <div className="absolute inset-0 z-50 pointer-events-none">
            <GameUI />
        </div>

      </ScalableContainer>
    </main>
  );
}