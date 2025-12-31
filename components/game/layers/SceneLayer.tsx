import React, { useRef, useMemo, useCallback } from 'react';
import { Container, Graphics } from 'pixi.js'; 
import { useTick } from '@pixi/react';
import { getPropDef } from '@/data/PropRegistry';
import { TILE_SIZE, TileType } from '@/data/Constants';
import { drawPatternRect } from '@/utils/AssetGenerator'; 

// Declare intrinsic elements for TypeScript
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
    decals: any[];
    textures: Record<string, (g: Graphics) => void>;
    onInteract: (type: 'actor' | 'decal', item: any) => void;
}

export const SceneLayer = ({ grid, staticProps, actors, decals, textures, onInteract }: SceneLayerProps) => {
    const containerRef = useRef<Container>(null);

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

    useTick(() => {
        if (containerRef.current) {
            containerRef.current.sortChildren();
            containerRef.current.children.forEach((child: any) => {
                if (child.label && child.label.startsWith('actor_')) {
                    const actorId = child.label.replace('actor_', '');
                    const actorData = actors.find((a: any) => a.id === actorId);
                    if (actorData) {
                        child.x = actorData.x;
                        child.y = actorData.y;
                        child.zIndex = actorData.y;
                    }
                }
            });
        }
    });

// --- STARDEW VALLEY-STYLE TERRAIN WITH DEPTH ---
    const drawTerrain = useCallback((g: Graphics) => {
        g.clear();
        if (!grid) return;

        // Create a set of grid positions that have props/trees for grass rendering
        const propPositions = new Set<string>();
        staticProps.forEach(p => {
            const gridCol = Math.floor(p.x / TILE_SIZE);
            const gridRow = Math.floor(p.y / TILE_SIZE);
            propPositions.add(`${gridCol},${gridRow}`);
        });

        grid.forEach((col, c) => {
            col.forEach((type, r) => {
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;
                
                // Override tile type to grass if there's a prop here
                const hasProp = propPositions.has(`${c},${r}`);
                const renderType = hasProp ? TileType.GRASS : type;

                if (renderType === TileType.GRASS) {
                    // Rich, vibrant grass with multiple shades for depth
                    g.beginFill(0x5EAD2B); // Base bright green
                    g.drawRect(x, y, TILE_SIZE, TILE_SIZE);
                    g.endFill();
                    
                    // Add darker grass patches for texture
                    g.beginFill(0x4A8F22);
                    for (let i = 0; i < 3; i++) {
                        const px = x + (Math.sin(c * 7 + r * 5 + i * 3) * 0.5 + 0.5) * TILE_SIZE * 0.7;
                        const py = y + (Math.cos(c * 5 + r * 7 + i * 2) * 0.5 + 0.5) * TILE_SIZE * 0.7;
                        g.drawCircle(px, py, TILE_SIZE * 0.15);
                    }
                    g.endFill();
                    
                    // Light highlights for dimension
                    g.beginFill(0x78C83F);
                    for (let i = 0; i < 2; i++) {
                        const px = x + (Math.cos(c * 6 + r * 4 + i * 4) * 0.5 + 0.5) * TILE_SIZE;
                        const py = y + (Math.sin(c * 4 + r * 6 + i * 3) * 0.5 + 0.5) * TILE_SIZE;
                        g.drawCircle(px, py, TILE_SIZE * 0.1);
                    }
                    g.endFill();
                    
                } else if (renderType === TileType.DIRT) {
                    // Warm, textured dirt with depth
                    g.beginFill(0x8B5A3C); // Base dirt color
                    g.drawRect(x, y, TILE_SIZE, TILE_SIZE);
                    g.endFill();
                    
                    // Dark soil patches
                    g.beginFill(0x6B4423);
                    for (let i = 0; i < 4; i++) {
                        const px = x + (Math.sin(c * 9 + r * 7 + i * 2) * 0.5 + 0.5) * TILE_SIZE;
                        const py = y + (Math.cos(c * 7 + r * 9 + i * 3) * 0.5 + 0.5) * TILE_SIZE;
                        g.drawRect(px - 2, py - 2, 4, 4);
                    }
                    g.endFill();
                    
                    // Lighter highlights
                    g.beginFill(0xA87449);
                    for (let i = 0; i < 2; i++) {
                        const px = x + (Math.cos(c * 8 + r * 6 + i * 5) * 0.5 + 0.5) * TILE_SIZE;
                        const py = y + (Math.sin(c * 6 + r * 8 + i * 4) * 0.5 + 0.5) * TILE_SIZE;
                        g.drawCircle(px, py, TILE_SIZE * 0.08);
                    }
                    g.endFill();
                    
                } else if (renderType === TileType.WATER) {
                    // Animated-looking water with depth
                    const wobble = Math.sin((c + r) * 0.5) * 0.1;
                    
                    // Deep blue base
                    g.beginFill(0x1976D2);
                    g.drawRect(x, y, TILE_SIZE, TILE_SIZE);
                    g.endFill();
                    
                    // Mid-tone for dimension
                    g.beginFill(0x2196F3);
                    g.drawRect(x, y, TILE_SIZE, TILE_SIZE * 0.7);
                    g.endFill();
                    
                    // Light ripples
                    g.beginFill(0x4FC3F7);
                    const rippleY = y + TILE_SIZE * (0.3 + wobble);
                    g.drawEllipse(x + TILE_SIZE / 2, rippleY, TILE_SIZE * 0.3, TILE_SIZE * 0.15);
                    g.endFill();
                    
                    // Bright highlights
                    g.beginFill(0xB3E5FC);
                    g.drawCircle(x + TILE_SIZE * 0.7, y + TILE_SIZE * 0.3, TILE_SIZE * 0.1);
                    g.endFill();
                    
                } else if (renderType === TileType.WALL) {
                    // Stone wall with depth and detail
                    g.beginFill(0x616161); // Base stone
                    g.drawRect(x, y, TILE_SIZE, TILE_SIZE);
                    g.endFill();
                    
                    // Dark mortar lines
                    g.lineStyle(2, 0x424242, 1);
                    g.moveTo(x, y + TILE_SIZE / 2);
                    g.lineTo(x + TILE_SIZE, y + TILE_SIZE / 2);
                    g.moveTo(x + TILE_SIZE / 2, y);
                    g.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE);
                    
                    // Stone texture spots
                    g.lineStyle(0);
                    g.beginFill(0x757575);
                    for (let i = 0; i < 3; i++) {
                        const px = x + (Math.sin(c * 11 + r * 13 + i * 7) * 0.5 + 0.5) * TILE_SIZE * 0.8;
                        const py = y + (Math.cos(c * 13 + r * 11 + i * 5) * 0.5 + 0.5) * TILE_SIZE * 0.8;
                        g.drawCircle(px, py, 1.5);
                    }
                    g.endFill();
                    
                    // Light edge highlight for 3D effect
                    g.beginFill(0x9E9E9E);
                    g.drawRect(x, y, TILE_SIZE, 2);
                    g.drawRect(x, y, 2, TILE_SIZE);
                    g.endFill();
                    
                } else {
                    g.beginFill(0x1A1A1A);
                    g.drawRect(x, y, TILE_SIZE, TILE_SIZE);
                    g.endFill();
                }
            });
        });

        // Subtle grid for clarity (helps people with glasses)
        g.lineStyle(1, 0x000000, 0.08);
        for (let c = 0; c < grid.length; c++) {
            g.moveTo(c * TILE_SIZE, 0);
            g.lineTo(c * TILE_SIZE, grid[0].length * TILE_SIZE);
        }
        for (let r = 0; r < grid[0].length; r++) {
            g.moveTo(0, r * TILE_SIZE);
            g.lineTo(grid.length * TILE_SIZE, r * TILE_SIZE);
        }

    }, [grid, staticProps]);

    const drawFallback = useCallback((g: Graphics) => {
        g.clear(); g.beginFill(0x0000FF); g.drawRect(-10, -20, 20, 20); g.endFill();
    }, []);

    return (
        <pixiContainer ref={containerRef} sortableChildren={true}>
            {/* 1. RENDER TERRAIN (Single Object) */}
            <pixiGraphics
                draw={drawTerrain}
                zIndex={-9999} // Force to bottom
            />

            {/* 2. RENDER PROPS & DECALS */}
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

            {/* 3. RENDER ACTORS */}
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