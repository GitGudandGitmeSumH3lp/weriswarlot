// --- FILE: utils/WorldGenerator.ts ---

import { rng } from './rng';
import { CityData, TileType, TILE_SIZE, isSolid } from './CityGenerator';
import { VIGNETTES, VignetteType } from './VignetteRegistry';

export interface Entity {
  id: string;
  type: string;
  x: number;
  y: number;
  textureKey: string; 
  rotation?: number; 
  speed?: number;
  targetX?: number;
  targetY?: number;
  waitTimer?: number;
  quality?: VignetteType;
}

// Master Roster (Unchanged)
const MASTER_CHARACTER_ROSTER = [
    'elder_0', 'elder_1', 'elder_2', 'elder_3', 'elder_4', 'elder_5',
    'punk_0', 'punk_1', 'punk_2', 'punk_3', 'punk_4', 'punk_5',
    'suit_0', 'suit_1', 'suit_2', 'suit_3', 'suit_4', 'suit_5',
    'clown_0', 'clown_1', 'clown_2', 'clown_3', 'clown_4', 'clown_5',
    'kid_balloon_0', 'kid_balloon_1', 'kid_balloon_2', 'kid_balloon_3', 'kid_balloon_4', 'kid_balloon_5',
    'hipster_0', 'hipster_1', 'hipster_2', 'hipster_3', 'hipster_4', 'hipster_5',
    'guitarist_0', 'guitarist_1', 'guitarist_2', 'guitarist_3', 'guitarist_4', 'guitarist_5',
    'bodybuilder_0', 'bodybuilder_1', 'bodybuilder_2', 'bodybuilder_3', 'bodybuilder_4', 'bodybuilder_5',
    'cyclist_0', 'cyclist_1', 'cyclist_2', 'cyclist_3', 'cyclist_4', 'cyclist_5',
    'tourist_0', 'tourist_1', 'tourist_2', 'tourist_3', 'tourist_4', 'tourist_5',
    'goth_0', 'goth_1', 'goth_2', 'goth_3', 'goth_4', 'goth_5',
    'artist_0', 'artist_1', 'artist_2', 'artist_3', 'artist_4', 'artist_5',
    'gardener_0', 'gardener_1', 'gardener_2', 'gardener_3', 'gardener_4', 'gardener_5',
    'commuter_0', 'commuter_1', 'commuter_2', 'commuter_3', 'commuter_4', 'commuter_5',
    'glutton_0', 'glutton_1', 'glutton_2', 'glutton_3', 'glutton_4', 'glutton_5'
];

const isOccupied = (c: number, r: number, staticProps: any[]) => {
    const x = c * TILE_SIZE + (TILE_SIZE / 2);
    const y = r * TILE_SIZE + (TILE_SIZE / 2);
    return staticProps.some(p => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10);
};

// --- NEW: Safe Spawn Logic ---
const findSafeSpawn = (layout: CityData, targetX: number, targetY: number): {x: number, y: number} => {
    // 1. Convert to Grid Coords
    const c = Math.floor(targetX / TILE_SIZE);
    const r = Math.floor(targetY / TILE_SIZE);
    
    const grid = layout.grid;
    const gridW = grid.length;
    const gridH = grid[0]?.length || 0;

    // Helper to check validity
    const isValid = (nc: number, nr: number) => {
        if (nc < 0 || nc >= gridW || nr < 0 || nr >= gridH) return false;
        // Check solid terrain (walls/water)
        if (isSolid(grid[nc][nr])) return false;
        return true;
    };

    // 2. Check original spot
    if (isValid(c, r)) {
        return { x: targetX, y: targetY };
    }

    // 3. Spiral Search for nearest valid neighbor (Radius 1-3)
    for (let d = 1; d <= 3; d++) {
        for (let dx = -d; dx <= d; dx++) {
            for (let dy = -d; dy <= d; dy++) {
                const nc = c + dx;
                const nr = r + dy;
                if (isValid(nc, nr)) {
                    // Found valid spot! Return center of that tile.
                    return {
                        x: nc * TILE_SIZE + (TILE_SIZE / 2),
                        y: nr * TILE_SIZE + (TILE_SIZE / 2)
                    };
                }
            }
        }
    }

    // 4. Fallback (Center Map)
    return { x: 400, y: 300 };
};

export function generateWorldData(
  level: number, 
  layout: CityData, 
  setKillerArchetype: (t: string) => void
): { newActors: Entity[], newDecals: Entity[] } {
  
  const newActors: Entity[] = [];
  const newDecals: Entity[] = [];

  // --- 1. ACTORS (Population using the ROSTER system) ---
  
  const shuffledRoster = rng.shuffle([...MASTER_CHARACTER_ROSTER]);
  const killerTextureKey = shuffledRoster.pop() || 'suit_0'; 
  const killerArchetype = killerTextureKey.split('_')[0]; 
  if (setKillerArchetype) setKillerArchetype(killerArchetype);
  
  const population = 25; 
  for (let i = 0; i < population; i++) {
    const isKiller = i === 0;
    const texKey = isKiller ? killerTextureKey : (shuffledRoster.pop() || `commuter_${i}`);

    let validSpawns = layout.spawns && layout.spawns.safe ? layout.spawns.safe : [];
    if (validSpawns.length === 0) {
        validSpawns = [{ x: 400, y: 300, type: 'safe' }];
    }
    
    // Pick raw spawn point
    const rawSpawn = rng.pick(validSpawns);
    const jitterX = rawSpawn.x + rng.float(-10, 10);
    const jitterY = rawSpawn.y + rng.float(-10, 10);

    // FIX: validate location
    const safePos = findSafeSpawn(layout, jitterX, jitterY);
    
    newActors.push({
      id: `actor_${i}`,
      type: isKiller ? 'killer' : 'civilian',
      textureKey: texKey, 
      x: safePos.x,
      y: safePos.y,
      speed: 30,
      waitTimer: 0,
      targetX: safePos.x, // Start target at safe pos too
      targetY: safePos.y,
      rotation: 0
    });
  }

  // --- 2. VIGNETTE GENERATION ---
  // (Unchanged from previous version)
  const gridWidth = layout.grid.length;
  const gridHeight = layout.grid[0]?.length || 0;
  
  for (let c = 1; c < gridWidth - 1; c++) {
      for (let r = 1; r < gridHeight - 1; r++) {
          const tile = layout.grid[c][r];
          if (isSolid(tile)) continue; 
          if (isOccupied(c, r, layout.staticProps)) continue;

          let context = 'PATH';
          if (tile === TileType.GRASS) context = 'PARK';
          const neighbors = [];
          if (layout.grid[c+1]) neighbors.push(layout.grid[c+1][r]);
          if (layout.grid[c-1]) neighbors.push(layout.grid[c-1][r]);
          if (layout.grid[c][r+1] !== undefined) neighbors.push(layout.grid[c][r+1]);
          if (layout.grid[c][r-1] !== undefined) neighbors.push(layout.grid[c][r-1]);
          if (neighbors.includes(TileType.WALL)) context = 'ALLEY';

          if (rng.float(0, 1) > 0.40) continue;

          const validVignettes = VIGNETTES.filter(v => v.context === 'ANY' || v.context === context);
          if (validVignettes.length === 0) continue;

          const roll = rng.float(0, 1);
          let chosenVignette = null;
          
          const crimes = validVignettes.filter(v => v.type === 'CRIME');
          const herrings = validVignettes.filter(v => v.type === 'HERRING');
          const ambiance = validVignettes.filter(v => v.type === 'AMBIANCE');

          if (roll < 0.1 && crimes.length > 0) chosenVignette = rng.pick(crimes);
          else if (roll < 0.3 && herrings.length > 0) chosenVignette = rng.pick(herrings);
          else if (ambiance.length > 0) chosenVignette = rng.pick(ambiance);

          if (!chosenVignette) continue;

          const centerX = c * TILE_SIZE + (TILE_SIZE / 2);
          const centerY = r * TILE_SIZE + (TILE_SIZE / 2);
          const vignetteId = `v_${c}_${r}`;

          chosenVignette.items.forEach(item => {
              newDecals.push({
                  id: `${vignetteId}_${item.idSuffix}`,
                  type: 'prop',
                  textureKey: item.texture,
                  x: centerX + item.x,
                  y: centerY + item.y,
                  rotation: item.rot || 0,
                  quality: item.quality || 'AMBIANCE'
              });
          });
      }
  }

  return { newActors, newDecals };
}