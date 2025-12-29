import { useMemo } from 'react';
import { Graphics } from 'pixi.js';

export default function CrowdLayer({ count = 20 }: { count?: number }) {
  // Generate random positions once on mount
  const npcs = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 700 + 50, // Keep away from edges
      y: Math.random() * 500 + 50,
      width: 30 + Math.random() * 20,
      height: 60 + Math.random() * 20,
      color: 0x3b82f6, // Blue-ish
    }));
  }, [count]);

  return (
    <pixiContainer>
      {npcs.map((npc) => (
        <pixiGraphics
          key={npc.id}
          draw={(g: Graphics) => {
            g.clear();
            g.beginFill(npc.color);
            g.drawRect(npc.x, npc.y, npc.width, npc.height);
            g.endFill();
          }}
        />
      ))}
    </pixiContainer>
  );
}