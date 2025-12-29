// --- FILE: components/game/World.tsx ---

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

  // State Subscriptions
  const gameState = useGameStore((state) => state.gameState);
  const level = useGameStore((state) => state.level);
  const resetCount = useGameStore((state) => state.resetCount); 
  const logEvidence = useGameStore((state) => state.logEvidence);
  const logMistake = useGameStore((state) => state.logMistake);
  const increasePanic = useGameStore((state) => state.increasePanic);
  const foundKiller = useGameStore((state) => state.foundKiller);
  const setKillerArchetype = useGameStore((state) => state.setKillerArchetype);
  const setScanLog = useGameStore((state) => state.setScanLog);
  const tickTimer = useGameStore((state) => state.tickTimer); 
  const startDefusal = useGameStore((state) => state.startDefusal);

  const [textures, setTextures] = useState<Record<string, Texture> | null>(null);
  
  const actorsRef = useRef<Entity[]>([]);
  const [decals, setDecals] = useState<Entity[]>([]); 
  
  // Track if we have already initialized the bomb phase for this round
  const bombPhaseInitRef = useRef(false);
  
  const [isReady, setIsReady] = useState(false);

  // --- BOMB SPAWN LOGIC ---
  // Triggered when gameState switches to BOMB_SEARCH
  useEffect(() => {
    if (gameState === 'BOMB_SEARCH' && !bombPhaseInitRef.current) {
        bombPhaseInitRef.current = true;
        
        // 1. Find all potential hiding spots (Trash Piles)
        // We only care about visual piles that are currently on screen
        const existingPiles = decals.filter(d => d.type === 'pile_trash' || d.type === 'pile_leaves');
        
        // 2. Select 3 Random Piles to be "The Bomb Sites"
        // We shuffle the array and pick the first 3
        const targets = existingPiles
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            .slice(0, 3);

        if (targets.length === 0) {
            console.warn("CRITICAL: No trash piles found for bomb parts! Spawning backups.");
            // Fallback: Just spawn parts in the open if no piles exist (rare edge case)
            const backups: Entity[] = [];
            for(let i=0; i<3; i++) {
                backups.push({
                    id: `bomb_part_backup_${i}`,
                    type: 'device_part',
                    x: 400 + rng.float(-100, 100),
                    y: 300 + rng.float(-100, 100)
                });
            }
            setDecals(prev => [...prev, ...backups]);
            return;
        }

        // 3. Inject the Bomb Parts
        // We don't "put them inside" the object. We spawn the part at the exact same coordinates,
        // but BEFORE the pile in the array (so it renders under it), OR we rely on the click logic.
        // Actually, the easiest way:
        // When we click a pile, if it is a TARGET, we spawn the part then. 
        // BUT, for "revealing" logic, let's pre-spawn them as hidden entities?
        // No, let's keep it simple: Add a 'hasBomb' flag to the entity? 
        // Entity interface doesn't have it. 
        
        // BETTER APPROACH: Spawn the 'device_part' decal immediately, but ensure it is rendered 
        // *underneath* the pile. Pixi renders in order. 
        // So we need to remove the pile, add the part, then add the pile back.
        
        setDecals(prev => {
            const newDecals = [...prev];
            targets.forEach(targetPile => {
                // Remove the pile temporarily (filter out by ID)
                // Actually, just find its index
                const idx = newDecals.findIndex(d => d.id === targetPile.id);
                if (idx !== -1) {
                    // Inject device_part at this location
                    const part: Entity = {
                        id: `device_part_${targetPile.id}`,
                        type: 'device_part',
                        x: targetPile.x,
                        y: targetPile.y
                    };
                    // Insert BEFORE the pile so it draws behind it (if transparent)
                    // or just rely on the click removing the pile to reveal it.
                    // We'll push it to the list. The Pile covers it.
                    newDecals.splice(idx, 0, part);
                }
            });
            return newDecals;
        });
        
       SoundSynth.playError(); // Alarm sound
    }
  }, [gameState, decals]); // Depend on gameState

  // --- INTERACTION LOGIC ---
  const handleDecalInteraction = (id: string, type: string, x: number, y: number) => {
        // [NEW] Bomb Search Logic
        if (gameState === 'BOMB_SEARCH') {
            if (type === 'device_part') {
                SoundSynth.playClick(); // Technical beep
                startDefusal(); // Store action (Check victory)
                // Remove the part from world to show it was collected
                setDecals(prev => prev.filter(d => d.id !== id));
                return;
            }

            if (type.startsWith('pile_')) {
                SoundSynth.playReveal();
                // Remove pile. If a bomb part was underneath (pre-spawned), it becomes visible/clickable.
                setDecals(prev => prev.filter(d => d.id !== id));
                return;
            }
            // Ignore other clicks during bomb search to reduce noise? 
            // Or allow them but they waste time? Let's allow them.
        }

        if (gameState !== 'PLAYING') return;

        // Normal Detective Logic
        if (type === 'mud_patch') {
            SoundSynth.playClick(); 
            setScanLog("Mud. Fresh prints... someone was running."); 
            setDecals(prev => {
                const filtered = prev.filter(d => d.id !== id);
                filtered.push({ id: `revealed_print_${id}`, type: 'footprints', x, y });
                return filtered;
            });
        } else if (type === 'item_wallet') {
            SoundSynth.playClick();
            logEvidence(); 
            setScanLog("Civilian Wallet secured. Evidence logged.");
            setDecals(prev => prev.filter(d => d.id !== id));
            
        } else if (type === 'item_receipt') {
            SoundSynth.playClick();
            logMistake(); 
            setScanLog("Useless garbage. Focus!");
            
        } else if (type === 'item_glass') {
            SoundSynth.playError();
            logMistake(); 
            increasePanic(15);
            setScanLog("SUIT PUNCTURE DETECTED. HAZARD.");
            setDecals(prev => prev.filter(d => d.id !== id));        
        } else if (type === 'chalk_mark') {
            SoundSynth.playClick();
            setScanLog("Gym chalk. Magnesium carbonate. A lifter was here.");
            setDecals(prev => prev.filter(d => d.id !== id));
        } else if (type.startsWith('pile_')) {
            SoundSynth.playReveal(); 
            setScanLog("Moved the debris. What was hidden underneath?");
            setDecals(prev => prev.filter(d => d.id !== id));
        } else if (type.startsWith('clue_')) {
            SoundSynth.playClick();
            
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

  // --- TIMER HEARTBEAT ---
  useEffect(() => {
    const interval = setInterval(() => {
        tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  // --- WORLD INIT ---
  useEffect(() => {
    let mounted = true;

    setIsReady(false);
    setDecals([]);
    actorsRef.current = [];
    bombPhaseInitRef.current = false; // Reset bomb init logic on new level

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

            // --- 2. GRID JITTER FLORA & FLOWERS ---
            const placeFlora = (xMin: number, xMax: number, yMin: number, yMax: number) => {
                const cellSize = 60;
                for(let x = xMin; x < xMax; x += cellSize) {
                    for(let y = yMin; y < yMax; y += cellSize) {
                        if (!isValidSpawn(x + 30, y + 30)) continue;
                        
                        const roll = rng.float(0, 1);
                        
                        if (roll > 0.6) {
                            const type = rng.float(0, 1) > 0.5 ? 'tree' : 'bush';
                            const jX = x + rng.float(5, 45); 
                            const jY = y + rng.float(5, 45);
                            if (isValidSpawn(jX, jY)) addDecal(type, jX, jY);
                        } 
                        else if (roll < 0.2) {
                            const jX = x + rng.float(5, 45); 
                            const jY = y + rng.float(5, 45);
                            if (isValidSpawn(jX, jY)) addDecal('flower_patch', jX, jY);
                        }
                    }
                }
            };

            placeFlora(0, 360, 0, 260); placeFlora(440, 800, 0, 260); 
            placeFlora(0, 360, 340, 600); placeFlora(440, 800, 340, 600); 

            // --- RED HERRINGS (Trash with Hidden Items) ---
            const trashCount = 5 + Math.floor(level * 2); 
            for(let i=0; i<trashCount; i++) {
                const rx = rng.float(50, 750);
                const ry = rng.float(350, 550);
                const distToCrime = Math.sqrt((rx - 600)**2 + (ry - 480)**2);
                
                if(isValidSpawn(rx, ry) && distToCrime > 100) {
                    const roll = rng.float(0, 1);
                    let hiddenItem = null;

                    if (roll > 0.85) hiddenItem = 'item_wallet'; 
                    else if (roll > 0.60) hiddenItem = 'item_receipt'; 
                    else if (roll > 0.40) hiddenItem = 'item_glass';   

                    if (hiddenItem) {
                        addDecal(hiddenItem, rx, ry);
                    }

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
            
            // Q4: CRIME SCENE
            const graveX = 600; const graveY = 480;
            addDecal('fresh_grave', graveX, graveY);
            addDecal('casket_open', graveX, graveY - 10); 
            addDecal('shovel_ground', graveX + 40, graveY + 10);
            
            addDecal(bloodType, graveX - 30, graveY + 20);
            
            addDecal('footprints', graveX - 50, graveY + 40);
            addDecal('footprints', graveX - 70, graveY + 55);

            // DYNAMIC CLUE
            const clueX = graveX - rng.float(20, 60);
            const clueY = graveY + rng.float(60, 80);
            addDecal(signatureClue, clueX, clueY);
            
            const pileType = rng.bool() ? 'pile_trash' : 'pile_leaves';
            addDecal(pileType, clueX, clueY);

            // --- 4. POPULATION ---
            const difficultyMod = Math.floor((level - 1) * 2);
            const spawnInZone = (base: string, count: number, zone?: {x:number, y:number, w:number, h:number}) => {
              const finalCount = count + (base === 'tourist' || base === 'commuter' ? difficultyMod : 0);                
              
              for(let i=0; i<count; i++) {
                    const max = base === 'clown' ? 0 : 2; 
                    const validId = rng.int(0, max);
                    const finalType = `${base}_${validId}`;
                    
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
    if (!isReady || (gameState !== 'PLAYING' && gameState !== 'IDLE' && gameState !== 'BOMB_SEARCH')) return; // Allow tick in Bomb Search
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
         // [NEW] Visual Feedback for Bomb Search: DARKNESS
         const isEmergency = gameState === 'BOMB_SEARCH' || gameState === 'MINIGAME';
         
         const grassColor = isEmergency ? 0x0a110a : 0x2e3b28; // Very dark green vs normal
         const pathColor = isEmergency ? 0x1a1a1a : 0x4a4a4a; // Almost black vs gray
         
         g.beginFill(grassColor); g.drawRect(0, 0, WIDTH, HEIGHT); g.endFill();
         g.beginFill(pathColor); 
         g.drawRect(0, PATH_Y_TOP, WIDTH, PATH_Y_BOTTOM - PATH_Y_TOP); 
         g.drawRect(PATH_X_LEFT, 0, PATH_X_RIGHT - PATH_X_LEFT, HEIGHT);
         g.drawCircle(PLAZA_CENTER_X, PLAZA_CENTER_Y, PLAZA_RADIUS);
         g.endFill();
         g.beginFill(grassColor); g.drawCircle(PLAZA_CENTER_X, PLAZA_CENTER_Y, PLAZA_RADIUS - 20); g.endFill();
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
  const killerEntity = actors.find((a: Entity) => a.type === 'killer');

  useTick(() => {
    actors.forEach((entity: Entity) => {
        const sprite = spriteMap.current.get(entity.id);
        if (sprite) { sprite.x = entity.x; sprite.y = entity.y; sprite.zIndex = entity.y; }
    });
    if (actorContainerRef.current) actorContainerRef.current.sortChildren();
  });

  return (
    <>
        {/* LAYER 0: DECALS (Dimmed if Game Over) */}
        <pixiContainer zIndex={0} sortableChildren={false} alpha={gameState === 'GAME_OVER' ? 0.3 : 1}>
            {decals.map((entity: Entity) => {
                const texKey = entity.textureKey || entity.type;
                if (!textures[texKey]) return null;
                // Interactive rules updated for Bomb Search
                const isInteractive = ['mud_patch', 'chalk_mark', 'pile_trash', 'pile_leaves', 'device_part'].includes(entity.type) || entity.type.startsWith('clue_') || entity.type.startsWith('item_');
                
                // If it's BOMB_SEARCH, only Piles and Device Parts are interactive to save time
                const clickableNow = gameState === 'BOMB_SEARCH' 
                    ? (entity.type === 'device_part' || entity.type.startsWith('pile_')) 
                    : isInteractive;

                return (
                    <pixiSprite
                        key={entity.id}
                        texture={textures[texKey]}
                        anchor={0.5}
                        x={entity.x}
                        y={entity.y}
                        eventMode={clickableNow ? 'static' : 'none'}
                        cursor={clickableNow ? 'pointer' : 'default'}
                        onPointerDown={() => {
                            if(clickableNow) onDecalClick(entity.id, entity.type, entity.x, entity.y);
                        }}
                    >
                         {/* [NEW] DEBUG OVERLAY FOR BOMB PARTS */}
                         {debugMode && entity.type === 'device_part' && (
                             <pixiGraphics draw={(g) => {
                                 g.clear();
                                 g.lineStyle(2, 0x00FF00);
                                 g.drawCircle(0, 0, 20);
                             }} />
                         )}
                    </pixiSprite>
                )
            })}
        </pixiContainer>

        {/* LAYER 1: ACTORS */}
        <pixiContainer ref={actorContainerRef} zIndex={1} sortableChildren={true}>
            {actors.map((entity: Entity) => {
                const texKey = entity.textureKey || entity.type;
                if (!textures[texKey]) return null;

                let alpha = 1;
                let visible = true;

                if (gameState === 'FOUND') {
                    visible = false; 
                } else if (gameState === 'GAME_OVER') {
                    if (entity.type !== 'killer') alpha = 0.2;
                } else if (gameState === 'BOMB_SEARCH') {
                    // [NEW] Hide civilians during Bomb Search to reduce visual noise?
                    // Or keep them for panic effect? Let's keep them but dim them slightly.
                    alpha = 0.5;
                }

                return (
                    <pixiSprite
                        key={entity.id}
                        ref={(el) => { if (el) spriteMap.current.set(entity.id, el); else spriteMap.current.delete(entity.id); }}
                        texture={textures[texKey]}
                        anchor={0.5}
                        visible={visible}
                        alpha={alpha}
                        eventMode={entity.type === 'killer' ? 'static' : 'none'}
                        cursor={entity.type === 'killer' ? 'pointer' : 'default'}
                        onPointerDown={() => { 
                            if (gameState === 'PLAYING' && entity.type === 'killer') onFound(); 
                        }}
                    >
                        {debugMode && entity.type === 'killer' && (
                            <pixiGraphics draw={(g) => {
                                g.clear();
                                g.lineStyle(2, 0xFF0000);
                                g.drawRect(-15, -30, 30, 30);
                            }} />
                        )}
                        {gameState === 'GAME_OVER' && entity.type === 'killer' && (
                             <pixiGraphics draw={(g) => {
                                g.clear();
                                g.lineStyle(2, 0xFF0000, 1);
                                g.drawRect(-20, -40, 40, 50);
                                g.beginFill(0xFF0000);
                                g.moveTo(0, -60); g.lineTo(-10, -70); g.lineTo(10, -70);
                                g.endFill();
                             }} />
                        )}
                    </pixiSprite>
                );
            })}
        </pixiContainer>

        {/* LAYER 2: THE CONFRONTATION (Zoomed Suspect) */}
        {gameState === 'FOUND' && killerEntity && textures[killerEntity.textureKey || 'killer'] && (
            <pixiContainer zIndex={100}>
                <pixiGraphics draw={g => {
                    g.beginFill(0x000000, 0.8);
                    g.drawRect(0, 0, 800, 600);
                    g.endFill();
                }} />
                
                <pixiSprite
                    texture={textures[killerEntity.textureKey || 'killer']}
                    anchor={0.5}
                    x={400} 
                    y={300} 
                    scale={{ x: 12, y: 12 }} 
                />
            </pixiContainer>
        )}
    </>
  );
}