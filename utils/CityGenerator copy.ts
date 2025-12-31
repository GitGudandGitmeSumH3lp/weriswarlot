// utils/ParkGenerator.ts

// --- Constants ---
export const TILE_SIZE = 50;
export const COLS = 20; // Expanded for more breathing room
export const ROWS = 16;

// --- Types ---
export enum TileType {
  STREET = 0,      // Paved paths (Lit, exposed)
  WALL = 1,        // Park boundary
  GRASS = 4,       // Open lawn (Medium visibility)
  DIRT = 5,        // Worn trails
  WATER = 6,       // Pond (blocker)
  DENSE_FOLIAGE = 7, // Hiding spots
  PLAYGROUND = 8,   // Equipment clusters
}

export interface CityData {
  grid: number[][];
  spawns: {
    safe: { x: number; y: number; type: 'bench' | 'vendor' | 'lamp' }[];
    danger: { x: number; y: number; type: 'bush' | 'tree' | 'grave' }[];
    player: { x: number; y: number };
  };
  zones: {
    sightlines: { x: number; y: number }[]; // Open areas = risky
    cover: { x: number; y: number }[];      // Dense areas = safe
  };
}

export const gridToWorld = (col: number, row: number) => ({
  x: col * TILE_SIZE + (TILE_SIZE / 2),
  y: row * TILE_SIZE + (TILE_SIZE / 2)
});

export const isSolid = (type: number): boolean => 
  type === TileType.WALL || type === TileType.WATER;

export const providesConcealment = (type: number): boolean =>
  type === TileType.DENSE_FOLIAGE || type === TileType.PLAYGROUND;

// --- Perlin-style Noise Helper ---
const noise = (x: number, y: number, seed: number = 42) => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
};

// --- Core Generator ---
export const generateCity = (): CityData => {
  const grid: number[][] = Array.from({ length: COLS }, () => 
    Array(ROWS).fill(TileType.GRASS)
  );
  
  const safeSpawns: { x: number; y: number; type: 'bench' | 'vendor' | 'lamp' }[] = [];
  const dangerSpawns: { x: number; y: number; type: 'bush' | 'tree' | 'grave' }[] = [];
  const sightlines: { x: number; y: number }[] = [];
  const coverSpots: { x: number; y: number }[] = [];

  // === STEP 1: Boundary Wall ===
  for (let c = 0; c < COLS; c++) {
    grid[c][0] = grid[c][ROWS - 1] = TileType.WALL;
  }
  for (let r = 0; r < ROWS; r++) {
    grid[0][r] = grid[COLS - 1][r] = TileType.WALL;
  }

  // === STEP 2: Main Pathways (L-Shape + Loop) ===
  // Entrance path (bottom center)
  const entranceX = Math.floor(COLS / 2);
  for (let r = ROWS - 2; r >= ROWS - 5; r--) {
    grid[entranceX][r] = grid[entranceX + 1][r] = TileType.STREET;
  }

  // Outer loop path
  for (let c = 3; c < COLS - 3; c++) {
    grid[c][4] = grid[c][ROWS - 5] = TileType.STREET;
  }
  for (let r = 4; r < ROWS - 4; r++) {
    grid[4][r] = grid[COLS - 5][r] = TileType.STREET;
  }

  // Center spoke (connects entrance to loop)
  for (let r = ROWS - 6; r >= 5; r--) {
    grid[entranceX][r] = TileType.STREET;
  }

  // === STEP 3: Organic Dirt Trails ===
  const createTrail = (startX: number, startY: number, steps: number) => {
    let x = startX, y = startY;
    for (let i = 0; i < steps; i++) {
      if (grid[x]?.[y] === TileType.GRASS) {
        grid[x][y] = TileType.DIRT;
      }
      const dir = Math.floor(noise(x, y, i) * 4);
      if (dir === 0 && x > 1) x--;
      else if (dir === 1 && x < COLS - 2) x++;
      else if (dir === 2 && y > 1) y--;
      else if (dir === 3 && y < ROWS - 2) y++;
    }
  };

  createTrail(7, 8, 25);
  createTrail(13, 6, 20);
  createTrail(10, ROWS - 7, 18);

  // === STEP 4: The Pond (Irregular Shape) ===
  const pondCenterX = 15;
  const pondCenterY = 9;
  for (let x = pondCenterX - 2; x <= pondCenterX + 2; x++) {
    for (let y = pondCenterY - 1; y <= pondCenterY + 2; y++) {
      if (noise(x, y, 7) > 0.3) {
        grid[x][y] = TileType.WATER;
      }
    }
  }

  // === STEP 5: Dense Foliage Clusters (Cover) ===
  const foliageZones = [
    { x: 7, y: 6, size: 3 },
    { x: 12, y: 12, size: 2 },
    { x: 6, y: ROWS - 7, size: 2 },
    { x: COLS - 8, y: 7, size: 3 },
  ];

  foliageZones.forEach(zone => {
    for (let dx = -zone.size; dx <= zone.size; dx++) {
      for (let dy = -zone.size; dy <= zone.size; dy++) {
        const x = zone.x + dx;
        const y = zone.y + dy;
        if (grid[x]?.[y] === TileType.GRASS && Math.abs(dx) + Math.abs(dy) <= zone.size) {
          grid[x][y] = TileType.DENSE_FOLIAGE;
        }
      }
    }
  });

  // === STEP 6: Playground Equipment (Maze-like) ===
  const playgroundX = 8;
  const playgroundY = ROWS - 8;
  for (let x = playgroundX; x < playgroundX + 3; x++) {
    for (let y = playgroundY; y < playgroundY + 3; y++) {
      if ((x + y) % 2 === 0) grid[x][y] = TileType.PLAYGROUND;
    }
  }

  // === STEP 7: Spawn Classification ===
  for (let c = 1; c < COLS - 1; c++) {
    for (let r = 1; r < ROWS - 1; r++) {
      const tile = grid[c][r];
      const pos = gridToWorld(c, r);

      // Urban props (exposed, lit)
      if (tile === TileType.STREET) {
        if (noise(c, r) > 0.7) {
          safeSpawns.push({ ...pos, type: 'bench' });
        } else if (noise(c, r) > 0.85) {
          safeSpawns.push({ ...pos, type: 'lamp' });
        }
        sightlines.push(pos);
      }

      // Nature props (concealment)
      if (tile === TileType.DENSE_FOLIAGE) {
        dangerSpawns.push({ ...pos, type: Math.random() > 0.5 ? 'bush' : 'tree' });
        coverSpots.push(pos);
      }

      if (tile === TileType.GRASS && noise(c, r, 99) > 0.92) {
        dangerSpawns.push({ ...pos, type: 'grave' }); // Easter egg
      }

      if (tile === TileType.PLAYGROUND) {
        coverSpots.push(pos);
      }
    }
  }

  // Player spawns at entrance
  const playerStart = gridToWorld(entranceX, ROWS - 3);

  return { 
    grid, 
    spawns: { 
      safe: safeSpawns, 
      danger: dangerSpawns,
      player: playerStart
    },
    zones: { sightlines, cover: coverSpots }
  };
};

// === GAMEPLAY HELPER: Line-of-Sight Check ===
export const hasLineOfSight = (
  fromX: number, 
  fromY: number, 
  toX: number, 
  toY: number, 
  grid: number[][]
): boolean => {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  
  for (let i = 0; i <= steps; i++) {
    const x = Math.floor(fromX + (dx / steps) * i);
    const y = Math.floor(fromY + (dy / steps) * i);
    const tile = grid[x]?.[y];
    
    if (providesConcealment(tile) || isSolid(tile)) return false;
  }
  return true;
};