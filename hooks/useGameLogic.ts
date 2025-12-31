// --- FILE: hooks/useGameLogic.ts ---

import { useState, useEffect, useRef } from 'react';
import { useTick } from '@pixi/react';
import { generateCity } from '@/utils/CityGenerator';
import { generateWorldData, Entity } from '@/utils/WorldGenerator';
import { useGameStore } from '@/store/gameStore';
import { SoundSynth } from '@/utils/SoundSynth';
import { updateEntityMovement, MovableEntity } from '@/systems/MovementSystem'; 
import { rng } from '@/utils/rng'; 
import { routeInteraction } from '@/systems/gameplay/InteractionRouter';
import { GameContext, LocalScenarioState } from '@/types/GameContext';

export const useGameLogic = () => {
  // Global Store
  const store = useGameStore();
  const { gameState, activeScenario, postFeed } = store;

  // World State
  const [cityData, setCityData] = useState<any>(null);
  const actorsRef = useRef<Entity[]>([]); 
  const [decals, setDecals] = useState<Entity[]>([]);
  const [isReady, setIsReady] = useState(false);
  
  // Scenario State (Bundled)
  const [scenarioState, setScenarioState] = useState<LocalScenarioState>({
      progress: 0,
      infectedIds: []
  });
  const scenarioInitRef = useRef(false);

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const city = generateCity();
    setCityData(city);
    const { newActors, newDecals } = generateWorldData(1, city, () => {});
    actorsRef.current = newActors;
    setDecals(newDecals); 
    setIsReady(true);
  }, []);

  // --- 2. SCENARIO INITIALIZATION (Logic Only) ---
  useEffect(() => {
    if (gameState === 'SCENARIO_ACTIVE' && !scenarioInitRef.current) {
        scenarioInitRef.current = true;
        setScenarioState({ progress: 0, infectedIds: [] });

        if (activeScenario === 'BOMB') {
            // Spawn Bomb Parts
            const existingPiles = decals.filter(d => d.textureKey === 'pile_trash');
            const targets = existingPiles.sort(() => 0.5 - Math.random()).slice(0, 3);
            const newParts: Entity[] = [];
            
            const spawnPart = (x: number, y: number, idSuffix: string) => ({
                id: `device_part_${idSuffix}`,
                type: 'device_part',
                textureKey: 'clue_generic',
                x, y, rotation: 0
            });

            if (targets.length === 0) {
                 for(let i=0; i<3; i++) newParts.push(spawnPart(400 + rng.float(-100, 100), 300 + rng.float(-100, 100), `${i}`));
            } else {
                 targets.forEach(t => newParts.push(spawnPart(t.x, t.y, t.id)));
            }
            setDecals(prev => [...prev, ...newParts]);
            SoundSynth.playError();

        } else if (activeScenario === 'POISON') {
            // Infect Actors
            const innocents = actorsRef.current.filter(a => a.type !== 'killer');
            const victims = innocents.sort(() => 0.5 - Math.random()).slice(0, 3);
            setScenarioState(prev => ({ ...prev, infectedIds: victims.map(v => v.id) }));
            postFeed('SYSTEM', 'TOXIN DETECTED. ADMINISTER ANTIDOTE.', 'ALERT');
        }
    }
  }, [gameState, activeScenario, decals, postFeed]);

  // --- 3. PHYSICS LOOP ---
  useTick((ticker) => {
    if (!isReady || !cityData) return;
    const isPhysicsActive = gameState === 'PLAYING' || gameState === 'SCENARIO_ACTIVE';
    if (!isPhysicsActive) return;
    
    actorsRef.current.forEach((actor) => {
        updateEntityMovement(actor as MovableEntity, cityData.grid, ticker.deltaTime);
    });
  });

  // --- 4. UNIFIED INTERACTION HANDLER ---
  const handleInteraction = (entity: Entity) => {
      // Create Context Snapshot
      const ctx: GameContext = {
          store,
          gameState,
          activeScenario: activeScenario || 'NONE',
          decals,
          setDecals,
          actors: actorsRef.current,
          scenarioState,
          setScenarioState
      };

      // Route the Click
      routeInteraction(entity, ctx);
  };

  return {
    cityData,
    actors: actorsRef.current,
    decals,
    isReady,
    handleActorClick: handleInteraction, // Unified Handler
    handleDecalClick: (id: string) => {
        const entity = decals.find(d => d.id === id);
        if (entity) handleInteraction(entity);
    },
    gameState,
    activeScenario
  };
};