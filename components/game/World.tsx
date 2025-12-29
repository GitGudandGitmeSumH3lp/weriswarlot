'use client';

import { useState, useEffect, useRef } from 'react';
import { useApplication, useTick } from '@pixi/react';
import { Texture, Container as PixiContainer, Sprite as PixiSprite } from 'pixi.js';
import { generateGameTextures, AssetType } from '@/utils/AssetGenerator';
import { rng } from '@/utils/rng';
import { useGameStore } from '@/store/gameStore';

type EntityType = AssetType;

interface Entity {
  id: string;
  type: EntityType;
  textureKey?: string;
  x: number;
  y: number;
  speed?: number;
  targetX?: number;
  targetY?: number;
  waitTimer?: number;
}

const WIDTH = 800;
const HEIGHT = 600;

// Layout Constants
const PATH_Y_TOP = 260;
const PATH_Y_BOTTOM = 340;
const PATH_X_LEFT = 360;
const PATH_X_RIGHT = 440;
const PLAZA_CENTER_X = 400;
const PLAZA_CENTER_Y = 300;
const PLAZA_RADIUS = 120;
const FOUNTAIN_RADIUS = 40;

// --- NEW: SCENARIO EXCLUSION ZONES ---
// We define circles around our key props so trees don't spawn there.
const SCENARIO_ZONES = [
    { x: 115, y: 100, r: 80 },  // Q1: Ice Cream Area
    { x: 640, y: 140, r: 100 }, // Q2: Picnic Area (Covers both blankets)
    { x: 130, y: 450, r: 80 },  // Q3: Gym Area
    { x: 600, y: 480, r: 90 },  // Q4: Crime Scene
];

export default function World() {
  const { app } = useApplication();
  const gameState = useGameStore((state) => state.gameState);
  const foundKiller = useGameStore((state) => state.foundKiller);
  
  const [textures, setTextures] = useState<Record<string, Texture> | null>(null);
  const entitiesRef = useRef<Entity[]>([]);
  const [isReady, setIsReady] = useState(false);

  // --- LOGIC: ZONING CHECK ---
  const isValidSpawn = (x: number, y: number) => {
    // 1. Exclude Paths
    if (y > PATH_Y_TOP && y < PATH_Y_BOTTOM) return false;
    if (x > PATH_X_LEFT && x < PATH_X_RIGHT) return false;
    
    // 2. Exclude Plaza
    const distPlaza = Math.sqrt((x - PLAZA_CENTER_X)**2 + (y - PLAZA_CENTER_Y)**2);
    if (distPlaza < PLAZA_RADIUS) return false;

    // 3. Exclude Scenario Stages (The New Logic)
    for (const zone of SCENARIO_ZONES) {
        const dist = Math.sqrt((x - zone.x)**2 + (y - zone.y)**2);
        if (dist < zone.r) return false;
    }

    return true;
  };

  useEffect(() => {
    let mounted = true;

    const initWorld = () => {
        if (!app || !app.renderer) {
            setTimeout(() => { if (mounted) initWorld(); }, 50);
            return;
        }
        if (isReady) return;

        try {
            const generated = generateGameTextures(app);
            setTextures(generated);
            const newEntities: Entity[] = [];
            let idCounter = 0;

            const add = (type: EntityType, x: number, y: number, speed = 0, texOverride?: string) => {
              newEntities.push({
                id: `${type}_${idCounter++}`,
                type,
                textureKey: texOverride, 
                x,
                y,
                speed,
                targetX: x,
                targetY: y,
                waitTimer: 0
              });
            };

            // --- 1. CORE LAYOUT ---
            add('fountain', PLAZA_CENTER_X, PLAZA_CENTER_Y);
            add('bench', 200, PATH_Y_TOP - 10); add('bench', 600, PATH_Y_TOP - 10);
            add('bench', 200, PATH_Y_BOTTOM + 20); add('bench', 600, PATH_Y_BOTTOM + 20);
            add('lamppost', 340, 240); add('lamppost', 460, 240);
            add('lamppost', 340, 360); add('lamppost', 460, 360);
            add('trashcan', 150, 250); add('trashcan', 650, 350);

            // --- 2. GRID JITTER FLORA ---
            // (Now respects the Scenario Zones via isValidSpawn)
            const placeFlora = (xMin: number, xMax: number, yMin: number, yMax: number) => {
                const cellSize = 60;
                for(let x = xMin; x < xMax; x += cellSize) {
                    for(let y = yMin; y < yMax; y += cellSize) {
                        // Check logic first
                        if (!isValidSpawn(x + 30, y + 30)) continue;
                        
                        if (rng.float(0, 1) > 0.4) { // Slightly increased density since we have less space now
                            const type = rng.float(0, 1) > 0.5 ? 'tree' : 'bush';
                            const jX = x + rng.float(5, 45); 
                            const jY = y + rng.float(5, 45);
                            
                            // Double check exact spot
                            if (isValidSpawn(jX, jY)) {
                                add(type, jX, jY);
                            }
                        }
                    }
                }
            };

            placeFlora(0, 360, 0, 260); // Q1
            placeFlora(440, 800, 0, 260); // Q2
            placeFlora(0, 360, 340, 600); // Q3
            placeFlora(440, 800, 340, 600); // Q4

            // --- 3. QUADRANT SCENARIOS ---
            // Q1: Joy
            add('ice_cream_cart', 100, 100);
            add('balloon_stand', 130, 95);
            add('human_worker_0', 100, 80); 

            // Q2: Leisure
            add('picnic_blanket', 600, 100);
            add('picnic_basket', 600, 90);
            add('picnic_blanket', 680, 180);
            
            // Q3: Activity
            add('pullup_bar', 100, 450);
            add('pullup_bar', 160, 450);
            
            // Q4: Crime
            const graveX = 600; const graveY = 480;
            add('fresh_grave', graveX, graveY);
            add('casket_open', graveX, graveY - 10); 
            add('shovel_ground', graveX + 40, graveY + 10);
            add('blood_stain', graveX - 30, graveY + 20);
            add('footprints', graveX - 50, graveY + 40);
            add('footprints', graveX - 70, graveY + 55);

            // --- 4. POPULATION (Smart Distribution) ---
            const civilians: string[] = [];
            
            // Helper to spawn a type in a specific rect, else global
            const spawnInZone = (base: string, count: number, zone?: {x:number, y:number, w:number, h:number}) => {
                for(let i=0; i<count; i++) {
                    const skinId = rng.int(0, 2); // Variation
                    const type = `${base}_${skinId}`; // Simplified variation mapping
                    // NOTE: asset generator makes human_elder_0, _1, _2. 
                    // So we pick a random index up to the max defined in AssetGen.
                    
                    // Actually, let's fix the ID lookup to be safe:
                    // If max is 3, pick 0-2.
                    const max = base === 'clown' ? 0 : 2; 
                    const validId = rng.int(0, max);
                    const finalType = `${base}_${validId}`;
                    
                    let x, y;
                    if (zone) {
                        x = rng.float(zone.x, zone.x + zone.w);
                        y = rng.float(zone.y, zone.y + zone.h);
                    } else {
                        x = rng.float(50, WIDTH-50);
                        y = rng.float(50, HEIGHT-50);
                    }

                    // Variation in speed
                    let speed = 0.8;
                    if (base.includes('punk') || base.includes('kid')) speed = 1.3;
                    if (base.includes('cyclist')) speed = 2.0;
                    if (base.includes('elder')) speed = 0.5;
                    
                    civilians.push(finalType);
                    add(finalType, x, y, speed + rng.float(-0.1, 0.1));
                }
            };

            // Q1: JOY (Kids, Clowns)
            spawnInZone('clown', 1, {x:50, y:50, w:300, h:200});
            spawnInZone('kid_balloon', 5, {x:50, y:50, w:300, h:200});

            // Q2: LEISURE (Hipsters, Guitarists, Elders)
            spawnInZone('hipster', 4, {x:450, y:50, w:300, h:200});
            spawnInZone('guitarist', 2, {x:450, y:50, w:300, h:200});
            spawnInZone('human_elder', 3, {x:450, y:50, w:300, h:200});

            // Q3: GYM (Bodybuilders, Cyclists)
            spawnInZone('bodybuilder', 5, {x:50, y:350, w:300, h:200});
            spawnInZone('cyclist', 3, {x:50, y:350, w:300, h:200});

            // GLOBAL / RANDOM (Tourists, Goths, Suits, Punks)
            spawnInZone('tourist', 6);
            spawnInZone('goth', 4);
            spawnInZone('human_suit', 5);
            spawnInZone('human_punk', 5);

            // --- RED HERRING DISTRIBUTION ---
            
            // 1. The Artist (Near the Crime Scene or Views)
            // Placing them in Q4 (Crime) makes them very suspicious!
            spawnInZone('artist', 2, {x:550, y:400, w:150, h:100}); 

            // 2. The Gardener (Near Bushes anywhere)
            spawnInZone('gardener', 3); // Random placement, but they hold "weapons"

            // 3. The Commuter (Walking along paths?)
            // We'll spawn them generally. The umbrella looks like a gun.
            spawnInZone('commuter', 4);

            // 4. The Glutton (Near Q1 Ice Cream or Q2 Picnic)
            spawnInZone('glutton', 3, {x:400, y:50, w:300, h:200});
            
            // --- THE KILLER ---
            // Killer is now hard to spot. 
            // Look for: The archetype with a tiny red dot on shoe/hand, or a handle at the waist.
            // NOT the one covered in paint, and NOT the one holding a giant umbrella.
            
            // We need to ensure the killer picks from the FULL list including new ones
            const allTypes = [...civilians, 'artist_0', 'gardener_0', 'commuter_0', 'glutton_0']; 
            // (Simplified logic for selecting disguise)
            
            const disguiseBase = civilians[rng.int(0, civilians.length - 1)]; // Pick a spawned civ type
            // OR pick a red herring type to be extra mean? 
            // Let's stick to the spawned pool so the killer blends in.

            const weapon = rng.bool() ? 'gun' : 'knife';
            const killerTexture = `killer_${disguiseBase}_${weapon}`;
            
            console.log(`DEBUG: Killer is ${disguiseBase} with ${weapon}`);
            add('killer', rng.float(500, 700), rng.float(400, 550), 0.95, killerTexture);

            entitiesRef.current = newEntities;
            setIsReady(true);
        } catch (err) { console.error(err); }
    };
    initWorld();
    return () => { mounted = false; };
  }, [app]);

  // UseTick
  useTick((ticker) => {
    if (!isReady) return;
    const delta = ticker.deltaTime;
    
    // --- UPDATED LOGIC ---
    // Pause the world simulation if we are in a menu, dialogue, or minigame.
    if (gameState !== 'PLAYING' && gameState !== 'IDLE') return;

    entitiesRef.current.forEach(entity => {
      if (entity.speed && entity.speed > 0) {
        if (entity.waitTimer && entity.waitTimer > 0) {
          entity.waitTimer -= delta;
        } else {
          const dx = (entity.targetX || entity.x) - entity.x;
          const dy = (entity.targetY || entity.y) - entity.y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          if (dist < 5) {
            entity.waitTimer = rng.float(50, 200);
            entity.targetX = Math.max(50, Math.min(WIDTH - 50, entity.x + rng.float(-200, 200)));
            entity.targetY = Math.max(50, Math.min(HEIGHT - 50, entity.y + rng.float(-200, 200)));
          } else {
            let nextX = entity.x + (dx / dist) * entity.speed * delta;
            let nextY = entity.y + (dy / dist) * entity.speed * delta;
            
            const distToFountain = Math.sqrt((nextX - PLAZA_CENTER_X)**2 + (nextY - PLAZA_CENTER_Y)**2);
            if (distToFountain < FOUNTAIN_RADIUS) {
                const angle = Math.atan2(nextY - PLAZA_CENTER_Y, nextX - PLAZA_CENTER_X);
                nextX = PLAZA_CENTER_X + Math.cos(angle) * (FOUNTAIN_RADIUS + 1);
                nextY = PLAZA_CENTER_Y + Math.sin(angle) * (FOUNTAIN_RADIUS + 1);
                entity.targetX = rng.float(50, WIDTH-50);
                entity.targetY = rng.float(50, HEIGHT-50);
            }
            entity.x = nextX;
            entity.y = nextY;
          }
        }
      }
    });
  });

  return (
    <>
       <pixiGraphics draw={g => {
         g.clear();
         g.beginFill(0x2e3b28); g.drawRect(0, 0, WIDTH, HEIGHT); g.endFill();
         g.beginFill(0x4a4a4a); 
         g.drawRect(0, PATH_Y_TOP, WIDTH, PATH_Y_BOTTOM - PATH_Y_TOP); 
         g.drawRect(PATH_X_LEFT, 0, PATH_X_RIGHT - PATH_X_LEFT, HEIGHT);
         g.drawCircle(PLAZA_CENTER_X, PLAZA_CENTER_Y, PLAZA_RADIUS);
         g.endFill();
         g.beginFill(0x2e3b28); g.drawCircle(PLAZA_CENTER_X, PLAZA_CENTER_Y, PLAZA_RADIUS - 20); g.endFill();
         g.beginFill(0x546E7A); g.drawCircle(PLAZA_CENTER_X, PLAZA_CENTER_Y, FOUNTAIN_RADIUS); g.endFill();
       }} />

       {isReady && textures && (
         <WorldRenderer 
            entities={entitiesRef.current} 
            textures={textures} 
            gameState={gameState}
            onFound={foundKiller}
         />
       )}
    </>
  );
}

function WorldRenderer({ entities, textures, gameState, onFound }: any) {
  const debugMode = useGameStore((state) => state.debugMode)
  const containerRef = useRef<PixiContainer>(null);
  const spriteMap = useRef<Map<string, PixiSprite>>(new Map());

  useTick(() => {
    entities.forEach((entity: Entity) => {
        const sprite = spriteMap.current.get(entity.id);
        if (sprite) { sprite.x = entity.x; sprite.y = entity.y; sprite.zIndex = entity.y; }
    });
    if (containerRef.current) containerRef.current.sortChildren();
  });

  return (
    <pixiContainer ref={containerRef} sortableChildren={true}>
      {entities.map((entity: Entity) => {
        const texKey = entity.textureKey || entity.type;
        if (!textures[texKey]) return null;

        return (
            <pixiSprite
              key={entity.id}
              ref={(el) => { if (el) spriteMap.current.set(entity.id, el); else spriteMap.current.delete(entity.id); }}
              texture={textures[texKey]}
              anchor={0.5}
              eventMode={entity.type === 'killer' ? 'static' : 'none'}
              cursor={entity.type === 'killer' ? 'pointer' : 'default'}
              onPointerDown={() => { 
                if (gameState === 'PLAYING' && entity.type === 'killer') onFound(); 
              }}
            >
              {/* --- CONDITIONAL DEBUG HINT --- */}
              {/* Only show if debugMode is TRUE AND entity is killer */}
              {debugMode && entity.type === 'killer' && (
                <pixiGraphics
                  draw={(g) => {
                    g.clear();
                    g.lineStyle(2, 0xFFFF00, 1);
                    g.drawRect(-20, -40, 40, 50);
                    g.beginFill(0xFF0000);
                    g.moveTo(0, -50);
                    g.lineTo(-10, -60);
                    g.lineTo(10, -60);
                    g.endFill();
                  }}
                />
              )}
            </pixiSprite>
        );
      })}
    </pixiContainer>
  );
}