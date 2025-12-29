'use client';

import { Application, extend } from '@pixi/react';
import { Container, Sprite, Graphics, Text } from 'pixi.js';
import World from '@/components/game/World';

// --- PIXI V8 REGISTRATION ---
// We must register the components we want to use in JSX.
// This replaces the old "import { Sprite } from '@pixi/react'" pattern.
extend({
  Container,
  Sprite,
  Graphics,
  Text,
});

interface GameRootProps {
  resetCount: number;
}

export default function GameRoot({ resetCount }: GameRootProps) {
  return (
    <Application 
      key={resetCount} 
      width={800} 
      height={600} 
      backgroundColor={0x2e3b28} // In v8, props are passed directly, not via 'options' object
      backgroundAlpha={1}
    >
      <World />
    </Application>
  );
}