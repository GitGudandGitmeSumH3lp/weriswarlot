import { useMemo } from 'react';
import { Graphics } from 'pixi.js';

export default function ForegroundLayer({ count = 15 }: { count?: number }) {
  const props = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 800,
      y: Math.random() * 600,
      width: 60 + Math.random() * 60, // Wider bushes
      height: 60 + Math.random() * 60,
      opacity: 0.9, // Nearly opaque, blocks view
    }));
  }, [count]);

  return (
    <pixiContainer>
      {props.map((prop) => (
        <pixiGraphics
          key={prop.id}
          // Important: We do NOT set eventMode, so clicks pass through to the Killer below
          draw={(g: Graphics) => {
            g.clear();
            g.beginFill(0x15803d, prop.opacity); // Green
            g.drawRect(prop.x, prop.y, prop.width, prop.height);
            g.endFill();
          }}
        />
      ))}
    </pixiContainer>
  );
}