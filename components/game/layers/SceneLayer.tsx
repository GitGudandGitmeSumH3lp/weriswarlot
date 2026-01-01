import React, { useRef, useMemo, useCallback } from 'react';
import { Container, Graphics } from 'pixi.js'; 
import { useTick } from '@pixi/react';
import { getPropDef } from '@/data/PropRegistry';
import { TILE_SIZE, TileType } from '@/data/Constants';
import { useKillerSystem } from '@/systems/gameplay/KillerSystem';
import { useCivilianSystem } from '@/systems/gameplay/CivilianSystem';
import { CityData } from '@/utils/CityGenerator';

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
                        // @ts-ignore
                        onpointerdown={() => onInteract('decal', item)}
                    />
                );
            })}

            {/* Actors (Dynamic Position) */}
            {actors.map((actor: any) => {
                const drawKey = actor.textureKey || actor.type || 'clue_generic';
                const drawFn = textures[drawKey] || textures[actor.type] || drawFallback;
                return (
                    <pixiGraphics
                        key={actor.id}
                        label={`actor_${actor.id}`}
                        draw={drawFn}
                        x={actor.x}
                        y={actor.y}
                        zIndex={actor.y}
                        eventMode="static"
                        cursor="pointer"
                        // @ts-ignore
                        onpointerdown={() => onInteract('actor', actor)}
                    />
                );
            })}
        </pixiContainer>
    );
};