'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useApplication, useTick, extend } from '@pixi/react';
import { Container, Sprite, Graphics, Texture } from 'pixi.js';
import { generateCity, TileType, TILE_SIZE, CityData, isSolid } from '@/utils/CityGenerator';
import { useGameTextures } from '@/hooks/useGameTextures';
import { generateWorldData, Entity } from '@/utils/WorldGenerator';
import { rng } from '@/utils/rng';
import { useGameStore } from '@/store/gameStore';
import { SoundSynth } from '@/utils/SoundSynth';
import { generateDialogue, getEvidenceAnalysis } from '@/utils/DialogueGenerator';

extend({ Container, Sprite, Graphics });

// --- CONSTANTS ---
const WIDTH = 800;
const HEIGHT = 600;

// --- PALETTE: "STARDEW NOIR" (Lush but Serious) ---
const PALETTE = {
    // Ground
    GRASS_BASE: 0x3a5a40,   // Rich Forest Green
    GRASS_HIGHLIGHT: 0x588157, // Lighter Blade
    DIRT_BASE: 0x5c4033,    // Dark Loam
    DIRT_HIGHLIGHT: 0x8d6e63, // Pebbles
    STONE_BASE: 0x4a4e69,   // Blue-Grey Cobble
    STONE_LIGHT: 0x9a8c98,
    WATER_DEEP: 0x1d3557,
    WATER_SHALLOW: 0x457b9d,

    // Props
    TREE_TRUNK: 0x4a3b2a,
    TREE_LEAF_DARK: 0x132a13,
    TREE_LEAF_MID: 0x31572c,
    TREE_LEAF_LIGHT: 0x4f772d,
    
    SHADOW: 0x000000
};

interface RuntimeEntity extends Entity {
  targetX?: number; targetY?: number; waitTimer?: number;
}

// --- TEXTURE FACTORY (The "Stardew" Volume Style) ---
const useProceduralTextures = (app: any) => {
    const [staticTextures, setTextures] = useState<Record<string, Texture>>({});
    useEffect(() => {
        if (!app || !app.renderer) return;
        const gen = (drawFn: (g: Graphics) => void, key: string) => {
            const g = new Graphics(); drawFn(g);
            return { [key]: app.renderer.generateTexture(g) };
        };

        // 1. OAK TREE (Volumetric Cloud Style)
        const treeTex = gen((g) => {
            // Shadow
            g.beginFill(PALETTE.SHADOW, 0.4); g.drawEllipse(0, 40, 24, 10); g.endFill();
            
            // Trunk (Curved)
            g.beginFill(PALETTE.TREE_TRUNK); 
            g.drawRect(-6, 0, 12, 40); 
            g.endFill();
            
            // Canopy: Stacked "Cloud" Circles
            const drawCloud = (x: number, y: number, r: number, color: number) => {
                g.beginFill(color); g.drawCircle(x, y, r); g.endFill();
            };
            
            // Bottom Layer (Dark)
            drawCloud(-15, 10, 18, PALETTE.TREE_LEAF_DARK);
            drawCloud(15, 10, 18, PALETTE.TREE_LEAF_DARK);
            drawCloud(0, 15, 20, PALETTE.TREE_LEAF_DARK);

            // Mid Layer
            drawCloud(-12, -5, 16, PALETTE.TREE_LEAF_MID);
            drawCloud(12, -5, 16, PALETTE.TREE_LEAF_MID);
            drawCloud(0, -20, 18, PALETTE.TREE_LEAF_MID);

            // Top Highlight Layer
            drawCloud(-5, -25, 12, PALETTE.TREE_LEAF_LIGHT);
            drawCloud(5, -25, 12, PALETTE.TREE_LEAF_LIGHT);
        }, 'tree');

        // 2. BUSH (Berry Style)
        const bushTex = gen((g) => {
            g.beginFill(PALETTE.SHADOW, 0.3); g.drawEllipse(0, 10, 18, 6); g.endFill();
            
            // Leafy blobs
            g.beginFill(PALETTE.TREE_LEAF_DARK); g.drawCircle(-8, 5, 10); g.drawCircle(8, 5, 10);
            g.beginFill(PALETTE.TREE_LEAF_MID); g.drawCircle(0, -2, 12);
            g.beginFill(PALETTE.TREE_LEAF_LIGHT); g.drawCircle(0, -5, 8); g.endFill();
            
            // Berries?
            g.beginFill(0xba181b); g.drawCircle(-4, 2, 2); g.drawCircle(5, -2, 2); g.endFill();
        }, 'bush');

        // 3. STATUE (Weathered Stone)
        const statueTex = gen((g) => {
            g.beginFill(PALETTE.SHADOW, 0.4); g.drawEllipse(0, 20, 25, 8); g.endFill();
            
            // Pedestal (Stepped)
            g.beginFill(PALETTE.STONE_BASE); g.drawRect(-15, 10, 30, 10); g.endFill();
            g.beginFill(0x6c757d); g.drawRect(-10, 0, 20, 10); g.endFill();
            
            // Bust
            g.beginFill(0xadb5bd); 
            g.drawCircle(0, -15, 14); // Head
            g.drawRect(-6, 0, 12, 5); // Neck
            g.endFill();
        }, 'statue');

        // 4. LAMP (Wrought Iron)
        const lampTex = gen((g) => {
            g.beginFill(PALETTE.SHADOW, 0.4); g.drawEllipse(0, 0, 8, 4); g.endFill();
            g.beginFill(0x212529); g.drawRect(-2, -45, 4, 45); g.endFill(); // Pole
            // Fancy Top
            g.beginFill(0x212529); g.drawRect(-6, -45, 12, 2); g.endFill();
            // Lantern Glass
            g.beginFill(0xffaa00, 0.6); g.drawRect(-4, -43, 8, 10); g.endFill();
            g.beginFill(0xffd60a); g.drawCircle(0, -38, 3); g.endFill();
        }, 'lamp');

        setTextures({ ...treeTex, ...statueTex, ...bushTex, ...lampTex });
    }, [app]);
    return staticTextures;
};

// --- MAIN WORLD COMPONENT ---
export function World() {
  const { app } = useApplication();
  
  // Logic
  const gameState = useGameStore((state) => state.gameState);
  const activeScenario = useGameStore((state) => state.activeScenario); 
  const killerArchetype = useGameStore((state) => state.killerArchetype);
  const debugMode = useGameStore((state) => state.debugMode);
  const logEvidence = useGameStore((state) => state.logEvidence);
  const triggerConfrontation = useGameStore((state) => state.triggerConfrontation);
  const postFeed = useGameStore((state) => state.postFeed);
  const completeLevel = useGameStore((state) => state.completeLevel);
  const tickTimer = useGameStore((state) => state.tickTimer);

  // Asset Merger
  const dynamicTextures = useGameTextures(app);
  const staticTextures = useProceduralTextures(app);
  const textures = useMemo(() => ({...dynamicTextures, ...staticTextures}), [dynamicTextures, staticTextures]);
  
  // State
  const [cityData, setCityData] = useState<CityData | null>(null);
  const actorsRef = useRef<Entity[]>([]);
  const [decals, setDecals] = useState<Entity[]>([]); 
  const [isReady, setIsReady] = useState(false);
  const scenarioInitRef = useRef(false);
  const [scenarioProgress, setScenarioProgress] = useState(0);
  const [infectedIds, setInfectedIds] = useState<string[]>([]);
  const [accompliceId, setAccompliceId] = useState<string | null>(null);

  // --- INIT ---
  useEffect(() => {
    const city = generateCity();
    setCityData(city);
    const { newActors, newDecals } = generateWorldData(1, city, () => {});
    actorsRef.current = newActors;
    setDecals(prev => [...prev, ...newDecals]);
    setIsReady(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  // --- LOGIC: Scenarios (Preserved) ---
  useEffect(() => {
    if (gameState === 'SCENARIO_ACTIVE' && !scenarioInitRef.current) {
        scenarioInitRef.current = true;
        setScenarioProgress(0);
        if (activeScenario === 'BOMB') {
            const existingPiles = decals.filter(d => d.type.startsWith('pile_'));
            const targets = existingPiles.sort(() => 0.5 - Math.random()).slice(0, 3);
            const newParts: Entity[] = [];
            if (targets.length === 0) {
                 for(let i=0; i<3; i++) newParts.push({ id: `bomb_part_${i}`, type: 'device_part', textureKey: 'clue_generic', x: 400 + rng.float(-100, 100), y: 300 + rng.float(-100, 100) });
            } else {
                 targets.forEach(t => newParts.push({ id: `device_part_${t.id}`, type: 'device_part', textureKey: 'clue_generic', x: t.x, y: t.y }));
            }
            setDecals(prev => [...prev, ...newParts]);
            SoundSynth.playError();
        }
        else if (activeScenario === 'POISON') {
            const innocents = actorsRef.current.filter(a => a.type !== 'killer');
            const victims = innocents.sort(() => 0.5 - Math.random()).slice(0, 3);
            setInfectedIds(victims.map(v => v.id));
            postFeed('SYSTEM', 'TOXIN DETECTED. ADMINISTER ANTIDOTE.', 'ALERT');
        }
    }
  }, [gameState, activeScenario, decals, postFeed]);

  // --- LOGIC: Interaction (Preserved) ---
  const handleActorClick = (entity: Entity) => {
      if (gameState === 'PLAYING') {
          if (entity.type === 'killer') triggerConfrontation();
          else {
              SoundSynth.playClick();
              const text = generateDialogue(entity, actorsRef.current.find(a => a.type === 'killer'));
              postFeed('VOICE', text, entity.textureKey || 'CIVILIAN');
          }
      } else if (gameState === 'SCENARIO_ACTIVE') {
          if (activeScenario === 'POISON' && infectedIds.includes(entity.id)) {
              SoundSynth.playReveal();
              setInfectedIds(prev => prev.filter(id => id !== entity.id));
              const newProgress = scenarioProgress + 1;
              setScenarioProgress(newProgress);
              if (newProgress >= 3) {
                  postFeed('SYSTEM', "TARGETS CLEARED.", 'SUCCESS');
                  completeLevel(true);
              }
          }
      }
  };

  const handleDecalClick = (id: string, type: string) => {
      if (gameState === 'SCENARIO_ACTIVE' && type === 'device_part') {
          SoundSynth.playClick();
          setDecals(prev => prev.filter(d => d.id !== id));
          const newProgress = scenarioProgress + 1;
          setScenarioProgress(newProgress);
          if (newProgress >= 3) {
              postFeed('SYSTEM', "DEVICE NEUTRALIZED.", 'SUCCESS');
              completeLevel(true);
          }
          return;
      }
      if (gameState !== 'PLAYING') return;
      if (['mud_patch', 'chalk_mark', 'clue_generic'].includes(type) || type.startsWith('item_') || type.startsWith('pile_')) {
          SoundSynth.playClick();
          logEvidence(type);
          if (!type.startsWith('pile_')) {
              const analysis = getEvidenceAnalysis(type, killerArchetype);
              postFeed('ANALYSIS', analysis.text, analysis.isValid ? 'VALID' : 'TRASH');
          }
          setDecals(prev => prev.filter(d => d.id !== id));
      }
  };

  // --- LOGIC: Physics (Preserved) ---
  useTick((ticker) => {
    if (!isReady || !cityData || (gameState !== 'PLAYING' && gameState !== 'SCENARIO_ACTIVE')) return;
    const delta = ticker.deltaTime;
    
    actorsRef.current.forEach((_entity) => {
      const entity = _entity as RuntimeEntity;
      if (entity.speed && entity.speed > 0) {
          if (entity.targetX === undefined || entity.targetY === undefined) {
               if (entity.waitTimer && entity.waitTimer > 0) entity.waitTimer -= delta;
               else {
                   entity.targetX = rng.float(50, WIDTH-50); 
                   entity.targetY = rng.float(50, HEIGHT-50);
                   entity.waitTimer = rng.float(100, 300);
               }
               return;
          }
          const dx = entity.targetX - entity.x;
          const dy = entity.targetY - entity.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 5) {
              entity.targetX = undefined; entity.targetY = undefined;
          } else {
              const speed = entity.speed * delta;
              const nextX = entity.x + (dx/dist)*speed;
              const nextY = entity.y + (dy/dist)*speed;
              const c = Math.floor(nextX / TILE_SIZE);
              const r = Math.floor(nextY / TILE_SIZE);
              if (!isSolid(cityData.grid[c]?.[r])) {
                  entity.x = nextX; entity.y = nextY;
              } else {
                  entity.targetX = undefined; entity.targetY = undefined;
              }
          }
      }
    });
  });

  return (
    <>
       {/* LAYER 1: LUSH FLOOR (Stardew Style) */}
       {cityData && (
        <pixiGraphics draw={(g) => {
           g.clear();
           g.beginFill(PALETTE.GRASS_BASE); g.drawRect(0, 0, WIDTH, HEIGHT); g.endFill();

           for (let r = 0; r < 12; r++) {      
             for (let c = 0; c < 16; c++) {    
               const tile = cityData.grid[c][r];
               const x = c * TILE_SIZE;
               const y = r * TILE_SIZE;
               const hash = (c * 53 + r * 17) % 100;

               if (tile === TileType.DIRT) {
                   // Organic Dirt
                   g.beginFill(PALETTE.DIRT_BASE); g.drawRect(x, y, TILE_SIZE, TILE_SIZE); g.endFill();
                   // Pebbles
                   if (hash > 70) {
                       g.beginFill(PALETTE.DIRT_HIGHLIGHT); g.drawCircle(x+15, y+20, 3); g.endFill();
                   }
                   if (hash < 30) {
                       g.beginFill(PALETTE.DIRT_HIGHLIGHT); g.drawCircle(x+35, y+35, 2); g.endFill();
                   }
               } 
               else if (tile === TileType.WATER) {
                   // Deep Water
                   g.beginFill(PALETTE.WATER_DEEP); g.drawRect(x, y, TILE_SIZE, TILE_SIZE); g.endFill();
                   // Shoreline / Surface
                   g.beginFill(PALETTE.WATER_SHALLOW, 0.3); g.drawRect(x, y, TILE_SIZE, 5); g.endFill();
                   if (hash % 10 === 0) {
                        g.beginFill(0xffffff, 0.2); g.drawRect(x+10, y+20, 10, 2); g.endFill();
                   }
               }
               else if (tile === TileType.STREET) {
                   // Cobblestone
                   g.beginFill(PALETTE.STONE_BASE); g.drawRect(x, y, TILE_SIZE, TILE_SIZE); g.endFill();
                   // Stones
                   g.beginFill(PALETTE.STONE_LIGHT, 0.5); 
                   g.drawRect(x+5, y+5, 20, 15);
                   g.drawRect(x+28, y+25, 15, 15);
                   g.endFill();
               }
               else {
                   // GRASS (The Tufts)
                   // We don't draw a base rect (already filled screen), we add texture
                   if (hash % 3 === 0) {
                       g.beginFill(PALETTE.GRASS_HIGHLIGHT);
                       // 3-pixel blade cluster
                       g.drawRect(x+10, y+15, 2, 6);
                       g.drawRect(x+13, y+17, 2, 4);
                       g.endFill();
                   }
               }
             }
           }
         }} />
       )}

       {/* LAYER 2: SORTED WORLD */}
       {isReady && textures && (
         <WorldRenderer 
            staticProps={cityData?.staticProps || []}
            actors={actorsRef.current}
            decals={decals}
            textures={textures}
            gameState={gameState}
            activeScenario={activeScenario}
            onActorClick={handleActorClick}
            onDecalClick={handleDecalClick}
         />
       )}
    </>
  );
}

// --- RENDERER (Preserved) ---
function WorldRenderer({ staticProps, actors, decals, textures, gameState, activeScenario, onActorClick, onDecalClick }: any) {
  const containerRef = useRef<Container>(null);
  const [frame, setFrame] = useState(0);

  useTick(() => {
      setFrame(f => f + 1);
      if (containerRef.current) containerRef.current.sortChildren();
  });

  const renderList = [
      ...staticProps.map((p: any) => ({ ...p, kind: 'prop', z: p.y })),
      ...decals.map((d: any) => ({ ...d, kind: 'decal', z: 0 })), 
      ...actors.map((a: any) => ({ ...a, kind: 'actor', z: a.y }))
  ];

  return (
    <pixiContainer ref={containerRef} sortableChildren={true}>
        {renderList.map((item) => {
            let texKey = item.type;
            if (item.kind === 'actor') texKey = item.textureKey || item.type;
            if (item.kind === 'decal') texKey = item.textureKey || item.type;

            const texture = textures[texKey] || textures['clue_generic']; 
            if (!texture) return null;

            const isActor = item.kind === 'actor';
            const isDecal = item.kind === 'decal';
            
            let isInteractive = false;
            let cursor = 'default';

            if (gameState === 'PLAYING') {
                if (isActor) { isInteractive = true; cursor = 'pointer'; }
                if (isDecal && ['mud_patch', 'chalk_mark', 'clue_generic'].includes(item.type)) { isInteractive = true; cursor = 'pointer'; }
                if (isDecal && item.type.startsWith('pile_')) { isInteractive = true; cursor = 'pointer'; }
            } else if (gameState === 'SCENARIO_ACTIVE') {
                 if (isActor && activeScenario === 'POISON') { isInteractive = true; cursor = 'pointer'; }
                 if (isDecal && item.type === 'device_part') { isInteractive = true; cursor = 'pointer'; }
            }

            return (
                <pixiSprite 
                    key={item.id}
                    texture={texture}
                    anchor={0.5}
                    x={item.x}
                    y={item.y}
                    zIndex={item.y}
                    eventMode={isInteractive ? 'static' : 'none'}
                    cursor={cursor}
                    // @ts-ignore
                    onpointerdown={() => {
                        if (isActor) onActorClick(item);
                        if (isDecal) onDecalClick(item.id, item.type);
                    }}
                />
            );
        })}
    </pixiContainer>
  );
}