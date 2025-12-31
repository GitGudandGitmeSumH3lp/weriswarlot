// src/utils/CityGenerator.ts

import { generateTerrainGrid } from '@/utils/TerrainFactory';

import { TILE_SIZE, COLS, ROWS, TileType } from '@/data/Constants';

// Re-export constants if legacy files import them from here (optional, but good for transition)
export { TILE_SIZE, COLS, ROWS, TileType };

export interface CityData {
  grid: number[][];
  spawns: { 
      safe: { x: number, y: number, type: string }[]; 
      danger: { x: number, y: number, type: string }[]; 
      player: { x: number; y: number } 
  };
  staticProps: { id: string; type: 'tree' | 'statue' | 'bush' | 'bench'; x: number; y: number }[];
}

export const gridToWorld = (c: number, r: number) => ({
  x: c * TILE_SIZE + (TILE_SIZE / 2),
  y: r * TILE_SIZE + (TILE_SIZE / 2)
});

// Helper for Physics/Pathfinding
export const isSolid = (t: number) => t === TileType.WALL || t === TileType.WATER || t === TileType.DENSE_FOLIAGE;

export const generateCity = (): CityData => {
  // 1. Base Layer: Fetch the visual grid from our new Terrain Factory
  // This ensures the renderer and physics start with the same ground truth.
  const grid = generateTerrainGrid();

  const staticProps: any[] = [];
  const safeSpawns: any[] = [];
  const dangerSpawns: any[] = [];

  // === STEP 2 PREP: PROP PLACEMENT ===
  // (Currently still logic-driven, will move to Data Arrays in Step 2)

  // -- 1. Pond-side Benches --
  staticProps.push({ id: 'pond_bench_1', type: 'bush', ...gridToWorld(12, 2) });
  staticProps.push({ id: 'pond_bench_2', type: 'bush', ...gridToWorld(11, 3) });
  staticProps.push({ id: 'pond_bush', type: 'bush', ...gridToWorld(13, 5) });

  // -- 2. Asymmetric Tree Groves --
  
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

  // Southern Tree Line (Corridors)
  [[2, 10], [3, 10], [4, 10], [10, 11], [11, 11], [12, 10], [13, 10]].forEach(([c, r], i) => {
    grid[c][r] = TileType.WALL;
    staticProps.push({ id: `south_tree_${i}`, type: 'tree', ...gridToWorld(c, r) });
  });

  // Central East (Intersection)
  [[10, 5], [11, 5], [11, 6], [10, 6]].forEach(([c, r], i) => {
    grid[c][r] = TileType.WALL;
    staticProps.push({ id: `center_east_tree_${i}`, type: 'tree', ...gridToWorld(c, r) });
  });

  // Lonely Trees (Ambush Points)
  [[6, 3], [15, 8], [1, 9], [14, 10]].forEach(([c, r], i) => {
    if (grid[c][r] === TileType.GRASS || grid[c][r] === TileType.DIRT) {
      grid[c][r] = TileType.WALL;
      staticProps.push({ id: `lonely_tree_${i}`, type: 'tree', ...gridToWorld(c, r) });
    }
  });

  // -- 3. Monuments --
  // Bandstand
  grid[9][6] = TileType.WALL; 
  staticProps.push({ id: 'bandstand', type: 'statue', ...gridToWorld(5, 6) }); // Note: x coord 5 seemed off in original, preserved.

  // Memorial
  grid[12][1] = TileType.WALL;
  staticProps.push({ id: 'memorial', type: 'statue', ...gridToWorld(12, 1) });

  // Fountain
  staticProps.push({ id: 'fountain', type: 'statue', ...gridToWorld(8, 8) });

  // -- 4. Furniture --
  const benches = [[9, 2], [6, 3], [3, 6], [8, 7], [11, 8], [6, 10]];
  benches.forEach(([c, r], i) => {
    staticProps.push({ id: `bench_${i}`, type: 'bush', ...gridToWorld(c, r) });
  });

  const bushes = [[2, 5], [7, 4], [9, 4], [12, 6], [7, 8], [11, 9], [5, 9], [13, 9]];
  bushes.forEach(([c, r], i) => {
    staticProps.push({ id: `bush_${i}`, type: 'bush', ...gridToWorld(c, r) });
  });

  // === SPAWNS ===
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