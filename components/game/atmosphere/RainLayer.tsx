'use client';

import { useTick } from '@pixi/react';
import { Texture } from 'pixi.js';
import { useMemo, useRef } from 'react';
import { rng } from '@/utils/rng';

interface RainLayerProps {
    texture: Texture;
}

// Particle Class
class RainDrop {
    x: number;
    y: number;
    speed: number;
    scale: number;
    alpha: number;

    constructor() {
        this.x = rng.float(0, 800);
        this.y = rng.float(0, 600);
        this.speed = rng.float(15, 25); // Fast rain
        this.scale = rng.float(0.5, 1.2); // Depth perception
        this.alpha = rng.float(0.3, 0.7);
    }

    update(delta: number) {
        this.y += this.speed * delta;
        this.x -= 2 * delta; // Slight wind to left
        
        if (this.y > 600) {
            this.y = -50;
            this.x = rng.float(0, 850); // Reset top, account for wind drift
        }
    }
}

export function RainLayer({ texture }: RainLayerProps) {
    const drops = useMemo(() => Array.from({ length: 150 }, () => new RainDrop()), []);
    const containerRef = useRef<any>(null);

    // We use a Container logic to update children manually for performance
    // Or we map them. For 150 sprites, React mapping is fine in PixiReact v8.
    
    // Actually, to update positions efficiently without re-rendering React tree every frame:
    // We should use a ref to access the sprites directly, OR stick to React state?
    // React state at 60fps is bad.
    // Solution: We render the Sprites *once*, and update their PIXI properties in useTick.
    // We need refs to the sprites.
    
    const spriteRefs = useRef<(any)[]>([]);

    useTick((ticker) => {
        const delta = ticker.deltaTime;
        drops.forEach((drop, i) => {
            drop.update(delta);
            const sprite = spriteRefs.current[i];
            if (sprite) {
                sprite.y = drop.y;
                sprite.x = drop.x;
            }
        });
    });

    return (
        <pixiContainer zIndex={60} eventMode="none">
            {drops.map((drop, i) => (
                <pixiSprite
                    key={i}
                    ref={(el: any) => (spriteRefs.current[i] = el)}
                    texture={texture}
                    x={drop.x}
                    y={drop.y}
                    scale={{ x: 1, y: drop.scale }} // Stretch vertically based on depth
                    alpha={drop.alpha}
                    tint={0x88ccff}
                />
            ))}
        </pixiContainer>
    );
}