// src/components/game/layers/TerrainLayer.tsx
import React, { useMemo } from 'react';
// FIX 1: Import the native class from pixi.js for TYPE SAFETY only
import { Graphics as PixiGraphicsType } from 'pixi.js'; 
import { TILE_SIZE, TileType, PALETTE, WORLD_WIDTH, WORLD_HEIGHT } from '@/data/Constants';

interface TerrainLayerProps {
  grid: number[][];
}

export const TerrainLayer = React.memo(({ grid }: TerrainLayerProps) => {
  
  // FIX 2: Type the argument 'g' correctly
  const draw = useMemo(() => (g: PixiGraphicsType) => {
    g.clear();
    
    // Base Grass
    g.beginFill(PALETTE.GRASS_BASE); 
    g.drawRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT); 
    g.endFill();

    if (!grid) return;

    for (let c = 0; c < grid.length; c++) {
      for (let r = 0; r < grid[0].length; r++) {
        const tile = grid[c][r];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        const hash = (c * 53 + r * 17) % 100;

        if (tile === TileType.DIRT) {
           g.beginFill(PALETTE.DIRT_BASE); g.drawRect(x, y, TILE_SIZE, TILE_SIZE); g.endFill();
           if (hash > 70) { g.beginFill(PALETTE.DIRT_HIGHLIGHT); g.drawCircle(x+15, y+20, 3); g.endFill(); }
           if (hash < 30) { g.beginFill(PALETTE.DIRT_HIGHLIGHT); g.drawCircle(x+35, y+35, 2); g.endFill(); }
        } 
        else if (tile === TileType.WATER) {
           g.beginFill(PALETTE.WATER_DEEP); g.drawRect(x, y, TILE_SIZE, TILE_SIZE); g.endFill();
           g.beginFill(PALETTE.WATER_SHALLOW, 0.3); g.drawRect(x, y, TILE_SIZE, 5); g.endFill();
           if (hash % 10 === 0) { g.beginFill(0xffffff, 0.2); g.drawRect(x+10, y+20, 10, 2); g.endFill(); }
        }
        else if (tile === TileType.STREET) {
           g.beginFill(PALETTE.STONE_BASE); g.drawRect(x, y, TILE_SIZE, TILE_SIZE); g.endFill();
        }
        else if (tile === TileType.GRASS) {
           if (hash % 5 === 0) {
               g.beginFill(PALETTE.GRASS_HIGHLIGHT); g.drawRect(x+10, y+15, 2, 6); g.drawRect(x+13, y+17, 2, 4); g.endFill();
           }
        }
      }
    }
  }, [grid]);

  // FIX 3: Use the intrinsic element 'pixiGraphics' injected by extend() in World.tsx
  return <pixiGraphics draw={draw} />;
});

TerrainLayer.displayName = 'TerrainLayer';