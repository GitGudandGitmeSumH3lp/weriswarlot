'use client';

import { useApplication } from '@pixi/react';
import { Texture, Sprite } from 'pixi.js';
import { useRef, useEffect } from 'react';

interface LightingLayerProps {
    texture: Texture;
}

export function LightingLayer({ texture }: LightingLayerProps) {
    const { app } = useApplication();
    const spriteRef = useRef<Sprite>(null);

    useEffect(() => {
        // Safety Barrier: Even if Hook runs, do nothing if app is missing
        if (!app) return;

        const onMouseMove = (e: MouseEvent) => {
            if (!spriteRef.current) return;
            
            // Cross-Version Compatibility (v7 vs v8)
            const canvas = (app as any)?.canvas || (app as any)?.view;

            // If canvas is somehow missing, abort frame
            if (!canvas) return;

            // Safe Math
            const rect = canvas.getBoundingClientRect();
            if (!rect) return;

            const scaleX = 800 / rect.width;
            const scaleY = 600 / rect.height;

            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            spriteRef.current.x = x;
            spriteRef.current.y = y;
        };

        window.addEventListener('mousemove', onMouseMove);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [app]);

    if (!app) return null;

    return (
        <pixiSprite 
            ref={spriteRef}
            texture={texture}
            anchor={0.5}
            alpha={0.94} // The "Darkness" Opacity
            x={400} 
            y={300}
            zIndex={50} // High Z-Index to cover the world
            eventMode="none" // Essential: allows clicking through the darkness
        />
    );
}