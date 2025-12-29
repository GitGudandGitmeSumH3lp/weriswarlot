'use client';

import { useState, useEffect, useRef } from 'react';
import { useApplication, useTick } from '@pixi/react';
import { Texture, Container as PixiContainer, Sprite as PixiSprite } from 'pixi.js';
import { generateGameTextures, AssetType } from '@/utils/AssetGenerator';
import { rng } from '@/utils/rng';
import { useGameStore } from '@/store/gameStore';
import { SoundSynth } from '@/utils/SoundSynth';

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

const SCENARIO_ZONES = [
    { x: 115, y: 100, r: 80 },  // Q1
    { x: 640, y: 140, r: 100 }, // Q2
    { x: 130, y: 450, r: 80 },  // Q3
    { x: 600, y: 480, r: 90 },  // Q4 (Crime)
];



// --- HELPER: Map Archetype to Clue ---
const getClueForArchetype = (archetype: string): AssetType => {
    if (archetype.includes('artist')) return 'clue_paint';
    if (archetype.includes('glutton')) return 'clue_wrapper';
    if (archetype.includes('gardener')) return 'clue_shears';
    if (archetype.includes('bodybuilder')) return 'clue_shaker';
    if (archetype.includes('guitarist') || archetype.includes('punk')) return 'clue_pick';
    if (archetype.includes('commuter') || archetype.includes('tourist')) return 'clue_ticket';
    return 'clue_ticket'; // Fallback
};

export default function World() {
  const { app } = useApplication();

  const gameState = useGameStore((state) => state.gameState);

  const level = useGameStore((state) => state.level);

  const resetCount = useGameStore((state) => state.resetCount); 

  const foundKiller = useGameStore((state) => state.foundKiller);

  const setKillerArchetype = useGameStore((state) => state.setKillerArchetype);
  
  const setScanLog = useGameStore((state) => state.setScanLog);
  
  const [textures, setTextures] = useState<Record<string, Texture> | null>(null);
  
  const actorsRef = useRef<Entity[]>([]);
  const [decals, setDecals] = useState<Entity[]>([]); 
  
  const [isReady, setIsReady] = useState(false);

  // --- INTERACTION LOGIC ---
  const handleDecalInteraction = (id: string, type: string, x: number, y: number) => {
        if (gameState !== 'PLAYING') return;

        if (type === 'mud_patch') {
            SoundSynth.playClick(); // <--- Sound Added
            setScanLog("Mud. Fresh prints... someone was running."); // <--- Noir Text
            setDecals(prev => {
                const filtered = prev.filter(d => d.id !== id);
                // Keep the logic that reveals the footprint
                filtered.push({ id: `revealed_print_${id}`, type: 'footprints', x, y });
                return filtered;
            });
        } else if (type === 'chalk_mark') {
            SoundSynth.playClick();
            setScanLog("Gym chalk. Magnesium carbonate. A lifter was here.");
            setDecals(prev => prev.filter(d => d.id !== id));
        } else if (type.startsWith('pile_')) {
            SoundSynth.playReveal(); // <--- Distinct "Discovery" Sound
            setScanLog("Moved the debris. What was hidden underneath?");
            setDecals(prev => prev.filter(d => d.id !== id));
        } else if (type.startsWith('clue_')) {
            SoundSynth.playClick();
            
            // Noir Detective Logic
            const map: Record<string, string> = {
                'clue_paint': "Red paint. Messy. I'm looking for an Artist.",
                'clue_wrapper': "Greasy wrapper. Still warm. Suspect is a Glutton.",
                'clue_shears': "Garden shears. Distinctive. Suspect is a Gardener.",
                'clue_shaker': "Protein shaker. Cheap plastic. Suspect is a Gym Bro.",
                'clue_pick': "Guitar pick. Heavy gauge. Suspect is a Musician.",
                'clue_ticket': "Metro ticket. One-way. Suspect is a Commuter or Tourist."
            };
            setScanLog(map[type] || "Just debris. Doesn't mean anything.");
        }
    };

  const isValidSpawn = (x: number, y: number) => {
    if (y > PATH_Y_TOP && y < PATH_Y_BOTTOM) return false;
    if (x > PATH_X_LEFT && x < PATH_X_RIGHT) return false;
    const distPlaza = Math.sqrt((x - PLAZA_CENTER_X)**2 + (y - PLAZA_CENTER_Y)**2);
    if (distPlaza < PLAZA_RADIUS) return false;
    for (const zone of SCENARIO_ZONES) {
        const dist = Math.sqrt((x - zone.x)**2 + (y - zone.y)**2);
        if (dist < zone.r) return false;
    }
    return true;
  };

  useEffect(() => {
    let mounted = true;

    // ADD THIS CLEANUP CHECK:
    // If we are resetting, we might want to clear existing state first
    setIsReady(false);
    setDecals([]);
    actorsRef.current = [];

    const initWorld = () => {
        if (!app || !app.renderer) {
            setTimeout(() => { if (mounted) initWorld(); }, 50);
            return;
        }
        if (isReady) return;

        try {
            const generated = generateGameTextures(app);
            setTextures(generated);
            
            const newActors: Entity[] = [];
            const newDecals: Entity[] = [];
            let idCounter = 0;

            const addActor = (type: EntityType, x: number, y: number, speed = 0, texOverride?: string) => {
              newActors.push({
                id: `actor_${type}_${idCounter++}`,
                type,
                textureKey: texOverride, 
                x, y, speed, targetX: x, targetY: y, waitTimer: 0
              });
            };

            const addDecal = (type: EntityType, x: number, y: number, texOverride?: string) => {
                newDecals.push({
                    id: `decal_${type}_${idCounter++}`,
                    type, textureKey: texOverride, x, y
                });
            }

            // --- 0. PRE-CALCULATE KILLER IDENTITY ---
            // We do this FIRST so the crime scene matches the killer.
            const possibleKillers = [
                'human_elder', 'human_punk', 'human_suit', 'clown', 'kid_balloon', 
                'hipster', 'guitarist', 'bodybuilder', 'cyclist', 'tourist', 'goth',
                'artist', 'gardener', 'commuter', 'glutton'
            ];
            const killerBase = possibleKillers[rng.int(0, possibleKillers.length - 1)];
            setKillerArchetype(killerBase); 
            console.log(`DEBUG: Killer identified as ${killerBase}`);   
            const killerSkin = rng.int(0, (killerBase === 'clown' ? 0 : 2));
            const killerFullType = `${killerBase}_${killerSkin}`;
            
            const weapon = rng.bool() ? 'gun' : 'knife';
            const signatureClue = getClueForArchetype(killerBase);
            const bloodType = weapon === 'gun' ? 'blood_gun' : 'blood_knife';

            console.log(`DEBUG: Killer is ${killerFullType} with ${weapon}. Clue: ${signatureClue}`);

            // --- 1. CORE LAYOUT ---
            addDecal('fountain', PLAZA_CENTER_X, PLAZA_CENTER_Y);
            addDecal('bench', 200, PATH_Y_TOP - 10); addDecal('bench', 600, PATH_Y_TOP - 10);
            addDecal('bench', 200, PATH_Y_BOTTOM + 20); addDecal('bench', 600, PATH_Y_BOTTOM + 20);
            addDecal('lamppost', 340, 240); addDecal('lamppost', 460, 240);
            addDecal('lamppost', 340, 360); addDecal('lamppost', 460, 360);
            addDecal('trashcan', 150, 250); addDecal('trashcan', 650, 350);

            // --- 2. GRID JITTER FLORA ---
            const placeFlora = (xMin: number, xMax: number, yMin: number, yMax: number) => {
                const cellSize = 60;
                for(let x = xMin; x < xMax; x += cellSize) {
                    for(let y = yMin; y < yMax; y += cellSize) {
                        if (!isValidSpawn(x + 30, y + 30)) continue;
                        if (rng.float(0, 1) > 0.4) {
                            const type = rng.float(0, 1) > 0.5 ? 'tree' : 'bush';
                            const jX = x + rng.float(5, 45); 
                            const jY = y + rng.float(5, 45);
                            if (isValidSpawn(jX, jY)) addDecal(type, jX, jY);
                        }
                    }
                }
            };
            placeFlora(0, 360, 0, 260); placeFlora(440, 800, 0, 260); 
            placeFlora(0, 360, 340, 600); placeFlora(440, 800, 340, 600); 

            // --- RED HERRINGS (Trash Expansion) ---
            // These are interactable piles that behave exactly like the main clue pile
            // (click -> sound -> remove), but reveal NOTHING. This wastes the player's time.
            const trashCount = 2 + Math.floor(level * 1.5); // Escalate trash density
            for(let i=0; i<trashCount; i++) {
                const rx = rng.float(50, 750);
                const ry = rng.float(350, 550);
                
                // Ensure we don't spawn on top of the actual crime scene (approximate check)
                const distToCrime = Math.sqrt((rx - 600)**2 + (ry - 480)**2);
                
                if(isValidSpawn(rx, ry) && distToCrime > 100) {
                        const type = rng.bool() ? 'pile_trash' : 'pile_leaves';
                        addDecal(type, rx, ry);
                }
            }

            // --- 3. SCENARIOS ---
            // Q1: Joy
            addDecal('ice_cream_cart', 100, 100); addDecal('balloon_stand', 130, 95);
            addActor('human_worker_0', 100, 80); 
            for(let i=0; i<3; i++) addDecal('ice_cream_stain', rng.float(80, 150), rng.float(120, 180));

            // Q2: Leisure
            addDecal('picnic_blanket', 600, 100); addDecal('picnic_basket', 600, 90); addDecal('picnic_blanket', 680, 180);
            for(let i=0; i<2; i++) addDecal('mud_patch', rng.float(550, 750), rng.float(50, 250));
            
            // Q3: Activity
            addDecal('pullup_bar', 100, 450); addDecal('pullup_bar', 160, 450);
            for(let i=0; i<4; i++) addDecal('chalk_mark', rng.float(80, 180), rng.float(480, 520));
            
            // Q4: CRIME SCENE (Dynamic)
            const graveX = 600; const graveY = 480;
            addDecal('fresh_grave', graveX, graveY);
            addDecal('casket_open', graveX, graveY - 10); 
            addDecal('shovel_ground', graveX + 40, graveY + 10);
            
            // DYNAMIC BLOOD: Based on weapon
            addDecal(bloodType, graveX - 30, graveY + 20);
            
            // FOOTPRINTS
            addDecal('footprints', graveX - 50, graveY + 40);
            addDecal('footprints', graveX - 70, graveY + 55);

            // DYNAMIC CLUE + CONCEALMENT
            // 1. Add Clue (Bottom)
            const clueX = graveX - rng.float(20, 60);
            const clueY = graveY + rng.float(60, 80);
            addDecal(signatureClue, clueX, clueY);
            
            // 2. Add Pile (Top - Covering Clue)
            const pileType = rng.bool() ? 'pile_trash' : 'pile_leaves';
            addDecal(pileType, clueX, clueY);

            // --- 4. POPULATION ---
            // As level increases, add more crowd noise to make finding the killer harder.
            const difficultyMod = Math.floor((level - 1) * 2); // +2 people per level
            const spawnInZone = (base: string, count: number, zone?: {x:number, y:number, w:number, h:number}) => {
              // Apply difficulty modifier to the count
              const finalCount = count + (base === 'tourist' || base === 'commuter' ? difficultyMod : 0);                
              
              for(let i=0; i<count; i++) {
                    const max = base === 'clown' ? 0 : 2; 
                    const validId = rng.int(0, max);
                    const finalType = `${base}_${validId}`;
                    
                    // IF this random civ happens to match the Killer we pre-selected, SKIP IT.
                    // We will spawn the "Real" Killer manually at the end.
                    if (finalType === killerFullType) continue; 

                    let x, y;
                    if (zone) {
                        x = rng.float(zone.x, zone.x + zone.w);
                        y = rng.float(zone.y, zone.y + zone.h);
                    } else {
                        x = rng.float(50, WIDTH-50);
                        y = rng.float(50, HEIGHT-50);
                    }
                    let speed = 0.8;
                    if (base.includes('punk') || base.includes('kid')) speed = 1.3;
                    if (base.includes('cyclist')) speed = 2.0;
                    if (base.includes('elder')) speed = 0.5;
                    
                    addActor(finalType, x, y, speed + rng.float(-0.1, 0.1));
                }
            };

            // Spawn Civilians (Logic same as before, shortened for brevity)
            spawnInZone('clown', 1, {x:50, y:50, w:300, h:200});
            spawnInZone('kid_balloon', 5, {x:50, y:50, w:300, h:200});
            spawnInZone('hipster', 4, {x:450, y:50, w:300, h:200});
            spawnInZone('guitarist', 2, {x:450, y:50, w:300, h:200});
            spawnInZone('human_elder', 3, {x:450, y:50, w:300, h:200});
            spawnInZone('bodybuilder', 5, {x:50, y:350, w:300, h:200});
            spawnInZone('cyclist', 3, {x:50, y:350, w:300, h:200});
            spawnInZone('tourist', 6);
            spawnInZone('goth', 4);
            spawnInZone('human_suit', 5);
            spawnInZone('human_punk', 5);
            spawnInZone('artist', 2, {x:550, y:400, w:150, h:100}); 
            spawnInZone('gardener', 3);
            spawnInZone('commuter', 4);
            spawnInZone('glutton', 3, {x:400, y:50, w:300, h:200});

            // --- 5. SPAWN THE KILLER ---
            const killerTexKey = `killer_${killerFullType}_${weapon}`;
            addActor('killer', rng.float(500, 700), rng.float(400, 550), 0.95, killerTexKey);

            actorsRef.current = newActors;
            setDecals(newDecals);
            setIsReady(true);
        } catch (err) { console.error(err); }
    };
    initWorld();
    return () => { mounted = false; };
  }, [app, resetCount]); 

  useTick((ticker) => {
    if (!isReady || (gameState !== 'PLAYING' && gameState !== 'IDLE')) return;
    const delta = ticker.deltaTime;

    actorsRef.current.forEach(entity => {
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
            actors={actorsRef.current}
            decals={decals}
            textures={textures} 
            gameState={gameState}
            onFound={foundKiller}
            onDecalClick={handleDecalInteraction}
         />
       )}
    </>
  );
}

function WorldRenderer({ actors, decals, textures, gameState, onFound, onDecalClick }: any) {
  const debugMode = useGameStore((state) => state.debugMode)
  const actorContainerRef = useRef<PixiContainer>(null);
  const spriteMap = useRef<Map<string, PixiSprite>>(new Map());

  useTick(() => {
    actors.forEach((entity: Entity) => {
        const sprite = spriteMap.current.get(entity.id);
        if (sprite) { sprite.x = entity.x; sprite.y = entity.y; sprite.zIndex = entity.y; }
    });
    if (actorContainerRef.current) actorContainerRef.current.sortChildren();
  });

  return (
    <>
        <pixiContainer zIndex={0} sortableChildren={false}>
            {decals.map((entity: Entity) => {
                const texKey = entity.textureKey || entity.type;
                if (!textures[texKey]) return null;
                
                // Added 'clue_' check so we can click them after the pile is gone
                const isInteractive = ['mud_patch', 'chalk_mark', 'pile_trash', 'pile_leaves'].includes(entity.type) || entity.type.startsWith('clue_');
                return (
                    <pixiSprite
                        key={entity.id}
                        texture={textures[texKey]}
                        anchor={0.5}
                        x={entity.x}
                        y={entity.y}
                        eventMode={isInteractive ? 'static' : 'none'}
                        cursor={isInteractive ? 'pointer' : 'default'}
                        onPointerDown={() => {
                            if(isInteractive) onDecalClick(entity.id, entity.type, entity.x, entity.y);
                        }}
                    />
                )
            })}
        </pixiContainer>

        <pixiContainer ref={actorContainerRef} zIndex={1} sortableChildren={true}>
            {actors.map((entity: Entity) => {
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
    </>
  );
}