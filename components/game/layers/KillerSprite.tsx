import { useCallback, useRef } from 'react';
import { Graphics } from 'pixi.js';
import { useGameStore } from '@/store/gameStore';

interface KillerProps {
  x?: number;
  y?: number;
}

export default function KillerSprite({ x = 400, y = 300 }: KillerProps) {
  const foundKiller = useGameStore((state) => state.foundKiller);
  const gameState = useGameStore((state) => state.gameState);

  const handleClick = useCallback(() => {
    if (gameState === 'PLAYING') {
      foundKiller();
    }
  }, [gameState, foundKiller]);

  // If found, we might change color or position, but for now just Red
  const color = gameState === 'FOUND' ? 0xffffff : 0xef4444; // Flash white if found

  return (
    <pixiGraphics
      eventMode="static" // Enables interaction
      cursor="pointer"
      onPointerDown={handleClick}
      draw={(g: Graphics) => {
        g.clear();
        g.beginFill(color);
        // Draw Killer (Slightly smaller than NPCs to be harder to click)
        g.drawRect(x, y, 30, 60); 
        g.endFill();
      }}
    />
  );
}