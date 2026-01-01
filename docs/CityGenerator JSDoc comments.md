/**
 * @file CityGenerator.ts
 * @description The "Physical Layer" of the world generation stack.
 * Responsible for creating the grid layout, placing static walls/obstacles,
 * and defining strategic spawn zones for gameplay.
 */

import { generateTerrainGrid } from '@/utils/TerrainFactory';
import { TILE_SIZE, COLS, ROWS, TileType } from '@/data/Constants';

// Re-export constants for legacy compatibility
export { TILE_SIZE, COLS, ROWS, TileType };

/**
 * Defines the complete physical layout of a level.
 */
export interface CityData {
  /** The 2D grid of TileTypes (0=Grass, 1=Dirt, 3=Wall, etc.) */
  grid: number[][];
  /** Pre-calculated spawn points for gameplay logic */
  spawns: { 
      /** Well-lit, open areas for Civilians */
      safe: { x: number, y: number, type: string }[]; 
      /** Hidden, dark areas for Bodies/Evidence */
      danger: { x: number, y: number, type: string }[]; 
      /** Where the Detective starts */
      player: { x: number; y: number } 
  };
  /** Static visual props (Trees, Benches) that block movement */
  staticProps: { id: string; type: 'tree' | 'statue' | 'bush' | 'bench'; x: number; y: number }[];
}

/**
 * Converts Grid Coordinates (Col, Row) to Pixel Coordinates (Center of Tile).
 * @param c Column Index (0-24)
 * @param r Row Index (0-18)
 */
export const gridToWorld = (c: number, r: number) => ({
  x: c * TILE_SIZE + (TILE_SIZE / 2),
  y: r * TILE_SIZE + (TILE_SIZE / 2)
});

/**
 * Checks if a tile blocks movement or vision.
 * @param t The TileType ID
 */
export const isSolid = (t: number) => t === TileType.WALL || t === TileType.WATER || t === TileType.DENSE_FOLIAGE;

/**
 * Generates the City Layout.
 * Currently uses a hybrid approach: Procedural Terrain + Hand-Placed POIs.
 * @returns {CityData} The complete map definition.
 */
export const generateCity = (): CityData => {
  // 1. Base Layer: Fetch the visual grid from Terrain Factory
  const grid = generateTerrainGrid();

  const staticProps: any[] = [];
  const safeSpawns: any[] = [];
  const dangerSpawns: any[] = [];

  // === STEP 2: STATIC PROP PLACEMENT (Points of Interest) ===
  // These are "Hard-coded" set pieces to ensure the level has structure.
  
  // -- 1. Pond-side Benches --
  staticProps.push({ id: 'pond_bench_1', type: 'bush', ...gridToWorld(12, 2) });
  staticProps.push({ id: 'pond_bench_2', type: 'bush', ...gridToWorld(11, 3) });
  staticProps.push({ id: 'pond_bush', type: 'bush', ...gridToWorld(13, 5) });

  // -- 2. Asymmetric Tree Groves (Blocking Line of Sight) --
  
  // NW Grove (Blind Spot)
  const nwGrove = [
    [1, 1], [2, 1], [3, 1],
    [1, 2], [2, 2],
    [1, 3], [2, 3], [3, 3],
    [1, 4]
  ];
  nwGrove.forEach(([c, r], i) => {
    grid[c][r] = TileType.WALL; // Sync Physics
    staticProps.push({ id: `nw_grove_${i}`, type: 'tree', ...gridToWorld(c, r) });
  });

  // Mid-West (Partial Cover)
  [[4, 5], [5, 5], [4, 6], [6, 8]].forEach(([c, r], i) => {
    grid[c][r] = TileType.WALL;
    staticProps.push({ id: `mid_west_tree_${i}`, type: 'tree', ...gridToWorld(c, r) });
  });

  // Southern Tree Line (Map Bounds)
  [[2, 10], [3, 10], [4, 10], [10, 11], [11, 11], [12, 10], [13, 10]].forEach(([c, r], i) => {
    grid[c][r] = TileType.WALL;
    staticProps.push({ id: `south_tree_${i}`, type: 'tree', ...gridToWorld(c, r) });
  });

  // Central East (Intersection Blocker)
  [[10, 5], [11, 5], [11, 6], [10, 6]].forEach(([c, r], i) => {
    grid[c][r] = TileType.WALL;
    staticProps.push({ id: `center_east_tree_${i}`, type: 'tree', ...gridToWorld(c, r) });
  });

  // Lonely Trees (Ambush Points/Hiding Spots)
  [[6, 3], [15, 8], [1, 9], [14, 10]].forEach(([c, r], i) => {
    if (grid[c][r] === TileType.GRASS || grid[c][r] === TileType.DIRT) {
      grid[c][r] = TileType.WALL;
      staticProps.push({ id: `lonely_tree_${i}`, type: 'tree', ...gridToWorld(c, r) });
    }
  });

  // -- 3. Monuments --
  grid[9][6] = TileType.WALL; 
  staticProps.push({ id: 'bandstand', type: 'statue', ...gridToWorld(5, 6) }); 
  grid[12][1] = TileType.WALL;
  staticProps.push({ id: 'memorial', type: 'statue', ...gridToWorld(12, 1) });
  staticProps.push({ id: 'fountain', type: 'statue', ...gridToWorld(8, 8) });

  // -- 4. Furniture (Visuals Only) --
  [[9, 2], [6, 3], [3, 6], [8, 7], [11, 8], [6, 10]].forEach(([c, r], i) => {
    staticProps.push({ id: `bench_${i}`, type: 'bush', ...gridToWorld(c, r) });
  });

  [[2, 5], [7, 4], [9, 4], [12, 6], [7, 8], [11, 9], [5, 9], [13, 9]].forEach(([c, r], i) => {
    staticProps.push({ id: `bush_${i}`, type: 'bush', ...gridToWorld(c, r) });
  });

  // === STEP 3: DEFINE SPAWN ZONES ===
  // Used by WorldGenerator to place dynamic actors/items.

  safeSpawns.push(
    { ...gridToWorld(8, 11), type: 'lamp' },
    { ...gridToWorld(13, 7), type: 'lamp' },
    { ...gridToWorld(8, 2), type: 'lamp' },
    { ...gridToWorld(2, 6), type: 'lamp' },
    { ...gridToWorld(5, 6), type: 'lamp' },
    { ...gridToWorld(12, 1), type: 'lamp' },
    { ...gridToWorld(9, 9), type: 'lamp' }
  );

  dangerSpawns.push(
    { ...gridToWorld(2, 2), type: 'grave' },
    { ...gridToWorld(14, 3), type: 'grave' },
    { ...gridToWorld(6, 3), type: 'grave' },
    { ...gridToWorld(10, 5), type: 'grave' },
    { ...gridToWorld(4, 7), type: 'grave' },
    { ...gridToWorld(7, 6), type: 'grave' },
    { ...gridToWorld(11, 9), type: 'grave' },
    { ...gridToWorld(1, 9), type: 'grave' },
    { ...gridToWorld(13, 10), type: 'grave' },
    { ...gridToWorld(9, 4), type: 'grave' }
  );

  return { 
    grid, 
    spawns: { 
      safe: safeSpawns, 
      danger: dangerSpawns, 
      player: gridToWorld(7, 11) 
    },
    staticProps
  };
};