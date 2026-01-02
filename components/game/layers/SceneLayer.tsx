import React, { useRef, useMemo, useCallback } from 'react';
import { Container, Graphics, Rectangle } from 'pixi.js'; 
import { useTick } from '@pixi/react';
import { getPropDef } from '@/data/PropRegistry';
import { TILE_SIZE, TileType } from '@/data/Constants';
import { useKillerSystem } from '@/systems/gameplay/KillerSystem';
import { useCivilianSystem } from '@/systems/gameplay/CivilianSystem';
import { CityData } from '@/utils/CityGenerator';
import { useGameStore } from '@/store/gameStore';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      pixiContainer: any;
      pixiGraphics: any;
    }
  }
}

interface SceneLayerProps {
    grid: number[][]; 
    staticProps: any[];
    actors: any[];
    setActors: React.Dispatch<React.SetStateAction<any[]>>; // Added setter
    layout: CityData | null; // Added layout
    decals: any[];
    textures: Record<string, (g: Graphics) => void>;
    onInteract: (type: 'actor' | 'decal', item: any) => void;
}

const drawDebugBox = (g: Graphics) => {
    g.clear();
    // In Pixi v8, we can use the traditional way, but let's make it very thick
    g.setStrokeStyle({ width: 4, color: 0xFF0000, alpha: 1 });
    // Offset slightly to surround the character (-5, -5) to (40, 55)
    g.rect(-5, -5, 40, 60);
    g.stroke();
};

export const SceneLayer = ({ 
    grid, 
    staticProps, 
    actors, 
    setActors, // Destructured here
    layout,    // Destructured here
    decals, 
    textures, 
    onInteract 
}: SceneLayerProps) => {
    const containerRef = useRef<Container>(null);
    const debugMode = useGameStore(s => s.debugMode);
    // 1. Activate Systems
    useKillerSystem(); // The Heartbeat
    useCivilianSystem(actors, setActors, layout); // The Movement

    // 2. Render Lists (Memoized)
    const renderList = useMemo(() => {
        const list: any[] = [];
        staticProps.forEach(p => {
            const def = getPropDef ? getPropDef(p.type) : {}; 
            list.push({ ...def, ...p, kind: 'prop', zIndex: p.y });
        });
        decals.forEach(d => {
            const def = getPropDef ? getPropDef(d.type) : {};
            list.push({ ...def, ...d, kind: 'decal', zIndex: 0 }); 
        });
        return list;
    }, [staticProps, decals]); 

    // 3. Terrain Painter
    const drawTerrain = useCallback((g: Graphics) => {
        g.clear();
        if (!grid) return;

        grid.forEach((col, c) => {
            col.forEach((type, r) => {
                // Select Color
                if (type === TileType.GRASS) g.beginFill(0x2E7D32); 
                else if (type === TileType.DIRT) g.beginFill(0x795548); 
                else if (type === TileType.WATER) g.beginFill(0x29B6F6); 
                else if (type === TileType.WALL) g.beginFill(0x424242); 
                else g.beginFill(0x000000);

                g.drawRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                g.endFill();
            });
        });
    }, [grid]);

    const drawFallback = useCallback((g: Graphics) => {
        g.clear(); g.beginFill(0x0000FF); g.drawRect(-10, -20, 20, 20); g.endFill();
    }, []);

    return (
        <pixiContainer ref={containerRef} sortableChildren={true}>
            {/* Terrain */}
            <pixiGraphics draw={drawTerrain} zIndex={-9999} />

            {/* Props & Decals */}
            {renderList.map((item) => {
                const drawFn = textures[item.textureKey] || textures[item.type] || drawFallback;
                return (
                    <pixiGraphics
                        key={item.id}
                        draw={drawFn}
                        x={item.x}
                        y={item.y}
                        zIndex={item.zIndex}
                        eventMode={item.kind === 'decal' ? 'static' : 'none'}
                        cursor={item.kind === 'decal' ? 'pointer' : 'default'}
                        // FIXED: Correct event name and added hitArea for decals
                        hitArea={new Rectangle(-16, -16, 32, 32)}
                        onPointerDown={() => {
                            console.log("Clicked Decal:", item.textureKey);
                            onInteract('decal', item);
                        }}
                    />
                );
            })}

            {/* Actors (Dynamic Position) */}
            {actors.map((actor: any) => {
                const drawKey = actor.textureKey || actor.type || 'clue_generic';
                const drawFn = textures[drawKey] || textures[actor.type] || drawFallback;
                const isKiller = actor.type === 'killer';

                return (
                    <pixiContainer 
                        key={actor.id} 
                        x={actor.x} 
                        y={actor.y} 
                        zIndex={actor.y}
                        label={`actor_${actor.id}`}
                    >
                        {/* THE CHARACTER SPRITE (Static drawFn reference, no lag) */}
                        <pixiGraphics
                            draw={drawFn}
                            eventMode="static"
                            cursor="pointer"
                            hitArea={new Rectangle(0, 0, 32, 48)}
                            onPointerDown={() => onInteract('actor', actor)}
                        />
                        
                    {/* The Debug Highlight - Moved INSIDE the container */}
                    {debugMode && isKiller && (
                        <pixiGraphics 
                            draw={drawDebugBox} 
                            zIndex={9999} // Ensure it's on top of the character
                        />
                        )}
                    </pixiContainer>
                );
            })}
        </pixiContainer>
    );
};