// src/utils/TerrainFactory.ts
import { COLS, ROWS, TileType } from '../data/Constants'; 

export const generateTerrainGrid = (): number[][] => {
  const grid = Array.from({ length: COLS }, () => Array(ROWS).fill(TileType.GRASS));

  // 1. The Serpentine Path
  const serpentine = [
    [7, 11], [8, 11], [7, 10], [8, 10], // Entrance
    [9, 10], [10, 10], [11, 9], [12, 8], [13, 7], // East Curve
    [13, 6], [12, 5], [11, 4], [10, 3], [9, 3], [8, 2], [7, 2], // North Arc
    [6, 2], [5, 3], [4, 4], [3, 5], [2, 6], // West Drop
    [3, 7], [4, 7], [5, 7], [6, 6], [7, 6], [8, 6], [9, 7], // Mid Loop
    [10, 8], [9, 9], [8, 9], [7, 9], [6, 9], [5, 8], [4, 9] // South Tail
  ];
  serpentine.forEach(([c, r]) => { 
      if(grid[c] && grid[c][r] !== undefined) grid[c][r] = TileType.DIRT; 
  });

  // 2. The Pond
  const pond = [
    [13, 2], [14, 2], [15, 2],
    [12, 3], [13, 3], [14, 3], [15, 3],
    [13, 4], [14, 4], [15, 4],
    [14, 5]
  ];
  pond.forEach(([c, r]) => {
      if(grid[c] && grid[c][r] !== undefined) grid[c][r] = TileType.WATER; 
  });

  // 3. Wall/Obstacle Bases (Base logic for where walls will go)
  // We mark the floor under walls as DIRT or WALL so grass doesn't bleed through
  const wallBases = [
      [9, 6] // Bandstand base
  ];
  wallBases.forEach(([c, r]) => grid[c][r] = TileType.WALL);

  return grid;
};