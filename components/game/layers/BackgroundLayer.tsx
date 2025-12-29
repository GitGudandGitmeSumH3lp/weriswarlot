import { Graphics } from 'pixi.js';

export default function BackgroundLayer({ width, height }: { width: number; height: number }) {
  return (
    <pixiGraphics
      draw={(g: Graphics) => {
        g.clear();
        // Dark Earthy Ground
        g.beginFill(0x2d2d2d); 
        g.drawRect(0, 0, width, height);
        g.endFill();
        
        // Draw a faint grid for reference
        g.lineStyle(2, 0x444444, 0.3);
        for (let x = 0; x <= width; x += 50) {
          g.moveTo(x, 0);
          g.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += 50) {
          g.moveTo(0, y);
          g.lineTo(width, y);
        }
      }}
    />
  );
}