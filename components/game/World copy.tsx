'use client';

import { useState, useEffect, useRef } from 'react';
// 1. Import Hooks from @pixi/react
import { useApplication, useTick, extend } from '@pixi/react';
// 2. Import Classes from pixi.js
import { Container, Sprite, Graphics } from 'pixi.js';

// 3. Register components for the Reconciler
extend({ Container, Sprite, Graphics });

// --- IMPORTS ---
import { generateCity, TileType, isSolid, TILE_SIZE, CityData } from '@/utils/CityGenerator';
import { useGameTextures } from '@/hooks/useGameTextures';
import { generateWorldData, Entity } from '@/utils/WorldGenerator';
import { rng } from '@/utils/rng';
import { useGameStore } from '@/store/gameStore';
import { SoundSynth } from '@/utils/SoundSynth';
import { generateDialogue, getEvidenceAnalysis } from '@/utils/DialogueGenerator';

// Constants
const WIDTH = 800;
const HEIGHT = 600;

// --- TYPE FIX ---
interface RuntimeEntity extends Entity {
  targetX?: number;
  targetY?: number;
  waitTimer?: number;
}

export function World() {
  const { app } = useApplication();

  // --- STORE SELECTORS ---
  const gameState = useGameStore((state) => state.gameState);
  const activeScenario = useGameStore((state) => state.activeScenario); 
  const killerArchetype = useGameStore((state) => state.killerArchetype);
  
  // Actions
  const logEvidence = useGameStore((state) => state.logEvidence);
  const triggerConfrontation = useGameStore((state) => state.triggerConfrontation);
  const postFeed = useGameStore((state) => state.postFeed);
  const completeLevel = useGameStore((state) => state.completeLevel); 

  const textures = useGameTextures(app);
  
  // --- STATE ---
  const [cityData, setCityData] = useState<CityData | null>(null);
  
  const actorsRef = useRef<Entity[]>([]);
  const [decals, setDecals] = useState<Entity[]>([]); 
  
  const scenarioInitRef = useRef(false);
  const [scenarioProgress, setScenarioProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const [infectedIds, setInfectedIds] = useState<string[]>([]);
  const [accompliceId, setAccompliceId] = useState<string | null>(null);

// --- INITIALIZATION ---
  useEffect(() => {
    // 1. Generate City Grid
    const city = generateCity();
    setCityData(city);

    // 2. Generate Entities using the City Data
    const { newActors, newDecals } = generateWorldData(
        1,       // Level 
        city,    // Layout
        (type) => console.log("Killer Archetype:", type) // Callback (Store dummy for now)
    );

    // 3. Assign Results
    actorsRef.current = newActors;
    setDecals(prev => [...prev, ...newDecals]);
    
    setIsReady(true);
  }, []);

  // --- SCENARIO LOGIC ---
  useEffect(() => {
    if (gameState === 'SCENARIO_ACTIVE' && !scenarioInitRef.current) {
        scenarioInitRef.current = true;
        setScenarioProgress(0);

if (activeScenario === 'BOMB') {
            const existingPiles = decals.filter(d => d.type.startsWith('pile_'));
            const targets = existingPiles.sort(() => 0.5 - Math.random()).slice(0, 3);
            
            if (targets.length === 0) {
                const backups: Entity[] = [];
                // FIX: Added textureKey
                for(let i=0; i<3; i++) backups.push({ id: `bomb_part_${i}`, type: 'device_part', textureKey: 'clue_generic', x: 400 + rng.float(-100, 100), y: 300 + rng.float(-100, 100) });
                setDecals(prev => [...prev, ...backups]);
            } else {
                setDecals(prev => {
                    const newDecals = [...prev];
                    targets.forEach(t => {
                        const idx = newDecals.findIndex(d => d.id === t.id);
                        // FIX: Added textureKey
                        if (idx !== -1) newDecals.splice(idx, 0, { id: `device_part_${t.id}`, type: 'device_part', textureKey: 'clue_generic', x: t.x, y: t.y });
                    });
                    return newDecals;
                });
            }
            SoundSynth.playError();
        }

if (activeScenario === 'EVIDENCE') {
            const existingPiles = decals.filter(d => d.type.startsWith('pile_'));
            const target = existingPiles[Math.floor(Math.random() * existingPiles.length)];
            
            if (target) {
                setDecals(prev => {
                    const newDecals = [...prev];
                    const idx = newDecals.findIndex(d => d.id === target.id);
                    // FIX: Added textureKey
                    if (idx !== -1) newDecals.splice(idx, 0, { id: `item_badge_${target.id}`, type: 'item_badge', textureKey: 'clue_generic', x: target.x, y: target.y });
                    return newDecals;
                });
            } else {
                 // FIX: Added textureKey
                 setDecals(prev => [...prev, { id: 'item_badge_fallback', type: 'item_badge', textureKey: 'clue_generic', x: 400, y: 300 }]);
            }
        }

        if (activeScenario === 'POISON') {
            const innocents = actorsRef.current.filter(a => a.type !== 'killer');
            const victims = innocents.sort(() => 0.5 - Math.random()).slice(0, 3);
            setInfectedIds(victims.map(v => v.id));
            postFeed('SYSTEM', 'DETECTING TOXINS... TARGETS MARKED GREEN.', 'ALERT');
        }

        if (activeScenario === 'ACCOMPLICE') {
            const innocents = actorsRef.current.filter(a => a.type !== 'killer');
            const target = innocents[Math.floor(Math.random() * innocents.length)];
            if (target) {
                setAccompliceId(target.id);
                const desc = target.textureKey?.split('_')[1] || 'civilian';
                postFeed('SYSTEM', `ACCOMPLICE ID: WEARING ${desc.toUpperCase()}`, 'HUNT');
            }
        }
    }
  }, [gameState, activeScenario, decals, postFeed]);

  // --- INTERACTION HANDLERS ---
  const handleActorClick = (entity: Entity) => {
      if (gameState === 'PLAYING') {
          if (entity.type === 'killer') {
              triggerConfrontation();
          } else {
              SoundSynth.playClick();
              const text = generateDialogue(entity, actorsRef.current.find(a => a.type === 'killer'));
              postFeed('VOICE', text, entity.textureKey || 'CIVILIAN');
          }
      } 
      else if (gameState === 'SCENARIO_ACTIVE') {
          if (activeScenario === 'POISON' && infectedIds.includes(entity.id)) {
              SoundSynth.playReveal();
              setInfectedIds(prev => prev.filter(id => id !== entity.id));
              const newProgress = scenarioProgress + 1;
              setScenarioProgress(newProgress);
              if (newProgress >= 3) {
                  postFeed('SYSTEM', "ALL VICTIMS STABILIZED.", 'SUCCESS');
                  completeLevel(true);
              }
          }
          else if (activeScenario === 'ACCOMPLICE' && entity.id === accompliceId) {
              SoundSynth.playClick();
              postFeed('SYSTEM', "ACCOMPLICE SECURED. REMOTE DISABLED.", 'SUCCESS');
              completeLevel(true);
          }
          else {
              SoundSynth.playError();
          }
      }
  };

  const handleDecalInteraction = (id: string, type: string, x: number, y: number) => {
        if (gameState === 'SCENARIO_ACTIVE') {
            if (activeScenario === 'EVIDENCE' && type === 'item_badge') {
                SoundSynth.playClick();
                setDecals(prev => prev.filter(d => d.id !== id));
                postFeed('SYSTEM', "EVIDENCE SECURED. DETECTIVE MILLER LOCATED.", 'SUCCESS');
                completeLevel(true);
                return;
            }
            if (type.startsWith('pile_')) {
                SoundSynth.playReveal();
                setDecals(prev => prev.filter(d => d.id !== id));
                return;
            }
        }

        if (gameState !== 'PLAYING') return;

if (type === 'mud_patch') {
            SoundSynth.playClick(); 
            logEvidence(type);
            const analysis = getEvidenceAnalysis(type, killerArchetype);
            postFeed('ANALYSIS', analysis.text, analysis.isValid ? 'VALID' : 'TRACE');
            setDecals(prev => {
                const filtered = prev.filter(d => d.id !== id);
                // FIX: Added textureKey
                filtered.push({ id: `revealed_print_${id}`, type: 'footprints', textureKey: 'footprints', x, y });
                return filtered;
            });
        }
        else if (type.startsWith('pile_')) {
            SoundSynth.playReveal(); 
            postFeed('SYSTEM', "OBSTRUCTION CLEARED. SCANNING AREA.", 'SEARCH');
            setDecals(prev => prev.filter(d => d.id !== id));
        } 
        else if (type.startsWith('clue_') || type.startsWith('item_') || type === 'chalk_mark') {
            SoundSynth.playClick();
            logEvidence(type);
            const analysis = getEvidenceAnalysis(type, killerArchetype);
            postFeed('ANALYSIS', analysis.text, analysis.isValid ? 'VALID' : 'TRASH');
            setDecals(prev => prev.filter(d => d.id !== id));
        }
  };

  const tickTimer = useGameStore((state) => state.tickTimer);
  useEffect(() => {
    const interval = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  // --- PHYSICS ENGINE (AABB) ---
  const checkCollision = (x: number, y: number, grid: number[][]) => {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (col < 0 || col >= 16 || row < 0 || row >= 12) return true;
    return isSolid(grid[col][row]);
  };

  useTick((ticker) => {
    if (!isReady || !cityData || (gameState !== 'PLAYING' && gameState !== 'IDLE' && gameState !== 'SCENARIO_ACTIVE')) return;
    
    const delta = ticker.deltaTime;
    
    actorsRef.current.forEach((_entity) => {
      // SURGICAL CAST: Enable physics props locally
      const entity = _entity as RuntimeEntity;

      if (entity.speed && entity.speed > 0) {
        if (entity.waitTimer && entity.waitTimer > 0) {
          entity.waitTimer -= delta;
        } else {
          if (entity.targetX === undefined || entity.targetY === undefined) {
              entity.targetX = rng.float(50, WIDTH - 50);
              entity.targetY = rng.float(50, HEIGHT - 50);
              return;
          }

          const dx = entity.targetX - entity.x;
          const dy = entity.targetY - entity.y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          if (dist < 5) {
            entity.waitTimer = rng.float(50, 200);
            entity.targetX = rng.float(50, WIDTH - 50);
            entity.targetY = rng.float(50, HEIGHT - 50);
          } else {
            const speed = entity.speed * delta;
            
            // X Move
            let nextX = entity.x + (dx / dist) * speed;
            if (checkCollision(nextX, entity.y, cityData.grid)) {
                nextX = entity.x; 
            }

            // Y Move
            let nextY = entity.y + (dy / dist) * speed;
            if (checkCollision(nextX, nextY, cityData.grid)) {
                nextY = entity.y; 
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
{/* 3. The Oblique Projector Renderer */}
       {cityData && (
<pixiGraphics draw={(g) => {
           g.clear();
           
           // LAYER 1: Base (Earth)
           g.beginFill(0x052e16); // Deep Green (Soil/Grass Base)
           g.drawRect(0, 0, WIDTH, HEIGHT);
           g.endFill();

           // LAYER 2: Tile Iteration
           for (let r = 0; r < 12; r++) {      
             for (let c = 0; c < 16; c++) {    
               const tile = cityData.grid[c][r];
               const x = c * TILE_SIZE;
               const y = r * TILE_SIZE;
               const hash = (c * 13 + r * 7) % 100; 

               if (tile === TileType.WALL) {
                 // --- PERIMETER FENCE ---
                 // Iron Bars look
                 g.beginFill(0x1e293b); // Dark base
                 g.drawRect(x + 10, y, 10, TILE_SIZE);
                 g.drawRect(x + 30, y, 10, TILE_SIZE);
                 g.endFill();
                 g.beginFill(0x020617); // Horizontal bar
                 g.drawRect(x, y + 10, TILE_SIZE, 5);
                 g.drawRect(x, y + 30, TILE_SIZE, 5);
                 g.endFill();
               } 
               else if (tile === TileType.WATER) {
                 // --- THE POND ---
                 g.beginFill(0x1e3a8a); // Deep Blue
                 g.drawRect(x, y, TILE_SIZE, TILE_SIZE);
                 g.endFill();
                 // Reflection/Ripples
                 if (hash > 50) {
                     g.beginFill(0x3b82f6, 0.5);
                     g.drawRect(x + 5, y + 5, 10, 2);
                     g.endFill();
                 }
               }
               else if (tile === TileType.GRASS) {
                 // --- PARK GRASS ---
                 g.beginFill(0x14532d); // Forest Green
                 g.drawRect(x, y, TILE_SIZE, TILE_SIZE);
                 g.endFill();
                 
                 // Grass Blades (Texture)
                 if (hash % 3 === 0) {
                     g.beginFill(0x166534); // Lighter Green
                     g.drawRect(x + 10, y + 10, 4, 8);
                     g.drawRect(x + 25, y + 30, 4, 6);
                     g.endFill();
                 }
               }
               else if (tile === TileType.DIRT) {
                 // --- DESIRE PATHS ---
                 g.beginFill(0x451a03); // Dark Brown
                 g.drawRect(x, y, TILE_SIZE, TILE_SIZE);
                 g.endFill();
                 // Pebbles
                 if (hash > 80) {
                     g.beginFill(0x78350f);
                     g.drawCircle(x + 20, y + 20, 3);
                     g.endFill();
                 }
               }
               else {
                 // --- PAVED PATHS (STREET) ---
                 g.beginFill(0x334155); // Slate
                 g.drawRect(x, y, TILE_SIZE, TILE_SIZE);
                 g.endFill();
                 
                 // Pavement Borders
                 g.lineStyle(2, 0x475569, 0.3);
                 g.drawRect(x, y, TILE_SIZE, TILE_SIZE);
                 g.lineStyle(0);
               }
             }
           }
         }} />
       )}

       {isReady && textures && (
         <WorldRenderer 
            actors={actorsRef.current}
            decals={decals}
            textures={textures} 
            gameState={gameState}
            activeScenario={activeScenario}
            onFound={triggerConfrontation} 
            onDecalClick={handleDecalInteraction}
            onActorClick={handleActorClick} 
         />
       )}
    </>
  );
}

// --- SUB-COMPONENT ---
function WorldRenderer({ actors, decals, textures, gameState, activeScenario, onFound, onDecalClick, onActorClick }: any) {
  const debugMode = useGameStore((state) => state.debugMode);
  
  const actorContainerRef = useRef<Container>(null);
  const spriteMap = useRef<Map<string, Sprite>>(new Map());
  const killerEntity = actors.find((a: Entity) => a.type === 'killer');
  const [pulse, setPulse] = useState(0);
  
  useTick((delta) => {
      setPulse(p => (p + 0.05) % (Math.PI * 2)); 
      actors.forEach((entity: Entity) => {
        const sprite = spriteMap.current.get(entity.id);
        if (sprite) { sprite.x = entity.x; sprite.y = entity.y; sprite.zIndex = entity.y; }
      });
      if (actorContainerRef.current) actorContainerRef.current.sortChildren();
  });

  const isEmergency = gameState === 'SCENARIO_ACTIVE';

  return (
    <>
        <pixiContainer zIndex={0} sortableChildren={false} alpha={gameState === 'GAME_OVER' ? 0.3 : 1}>
            {decals.map((entity: Entity) => {
                const texKey = entity.textureKey || entity.type;
                if (!textures[texKey]) return null;
                
                const isInteractive = ['mud_patch', 'chalk_mark', 'pile_trash', 'pile_leaves', 'device_part'].includes(entity.type) || entity.type.startsWith('clue_') || entity.type.startsWith('item_');
                const clickableNow = gameState === 'SCENARIO_ACTIVE' 
                    ? (entity.type === 'device_part' || entity.type.startsWith('pile_')) 
                    : isInteractive;

                let tint = 0xFFFFFF;
                if (debugMode) {
                    if (entity.type === 'device_part' || entity.type.startsWith('clue')) tint = 0x00FF00; 
                    else tint = 0x888888; 
                }

                return (
<pixiSprite
                        key={entity.id}
                        texture={textures[texKey]}
                        anchor={0.5}
                        x={entity.x}
                        y={entity.y}
                        tint={tint}
                        eventMode={clickableNow ? 'static' : 'none'}
                        cursor={clickableNow ? 'pointer' : 'default'}
                        // @ts-ignore - PixiJS v8 interaction prop
                        onpointerdown={() => {
                            if(clickableNow) onDecalClick(entity.id, entity.type, entity.x, entity.y);
                        }}
                    />
                )
            })}
        </pixiContainer>

        <pixiContainer ref={actorContainerRef} zIndex={1} sortableChildren={true}>
            {actors.map((entity: Entity) => {
                const texKey = entity.textureKey || entity.type;
                if (!textures[texKey]) return null;
                
                const canInteract = (gameState === 'PLAYING' || gameState === 'SCENARIO_ACTIVE');
                
                let alpha = 1;
                let visible = true;
                if (gameState === 'FOUND' || gameState === 'CONFRONTATION') visible = false; 
                else if (gameState === 'GAME_OVER' && entity.type !== 'killer') alpha = 0.2;

                let tint = 0xFFFFFF;
                if (debugMode) {
                    if (entity.type === 'killer') tint = 0xFF0000;
                    else tint = 0x444444;
                }

                return (
<pixiSprite
                        key={entity.id}
                        ref={(el) => { if (el) spriteMap.current.set(entity.id, el); else spriteMap.current.delete(entity.id); }}
                        texture={textures[texKey]}
                        anchor={0.5}
                        visible={visible}
                        alpha={alpha}
                        tint={tint} 
                        eventMode={canInteract ? 'static' : 'none'}
                        cursor={canInteract ? 'pointer' : 'default'}
                        // @ts-ignore - PixiJS v8 interaction prop
                        onpointerdown={() => { 
                            if (!canInteract) return;
                            if (onActorClick) onActorClick(entity); 
                        }}
                    />
                );
            })}
        </pixiContainer>

        {isEmergency && (
            <pixiGraphics zIndex={50} draw={(g) => {
                    g.clear();
                    g.beginFill(0x020617, 0.65); g.drawRect(0, 0, 800, 600); g.endFill();
                    const alpha = (Math.sin(pulse) + 1) * 0.1; 
                    g.beginFill(0xFF0000, alpha); g.drawRect(0, 0, 800, 600); g.endFill();
            }} />
        )}

        {(gameState === 'FOUND' || gameState === 'CONFRONTATION') && killerEntity && textures[killerEntity.textureKey || 'killer'] && (
            <pixiContainer zIndex={100}>
                <pixiGraphics draw={g => {
                    g.beginFill(0x000000, 0.85);
                    g.drawRect(0, 0, 800, 600);
                    g.endFill();
                }} />
                <pixiSprite texture={textures[killerEntity.textureKey || 'killer']} anchor={0.5} x={400} y={300} scale={{ x: 12, y: 12 }} />
            </pixiContainer>
        )}
    </>
  );
}