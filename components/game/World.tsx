"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text, TilingSprite } from "pixi.js";
import { SceneLayer } from "./layers/SceneLayer";
import { GameHUD } from "../ui/GameHUD";
import { useGameStore } from "@/store/gameStore";
import { generateCity, CityData } from "@/utils/CityGenerator";
import { generateWorldData, spawnVignette, Entity } from "@/utils/WorldGenerator";
import { painters } from "@/utils/CharacterPainters";
import { propPainters } from "@/utils/PropPainters";
import { routeInteraction } from "@/systems/gameplay/InteractionRouter";
import { GameContext } from "@/types/GameContext";
import { rng } from "@/utils/rng";
import { getKillerProfile } from "@/data/KillerRegistry";

extend({ Container, Graphics, Sprite, Text, TilingSprite });

export const World = () => {
  const [mounted, setMounted] = useState(false);
  
  // --- STATE DEFINITIONS (Must be useState, not useMemo) ---
  const [layout, setLayout] = useState<CityData | null>(null);
  const [actors, setActors] = useState<Entity[]>([]);
  const [decals, setDecals] = useState<Entity[]>([]);

  const { 
    level, 
    gameState, 
    setKillerArchetype, 
    pendingVignetteSpawn,
    clearVignetteSpawn,
    pendingCrisisInit, // NEW
    clearCrisisInit    // NEW
  } = useGameStore();

  // 1. Initial World Generation
  useEffect(() => {
    const cityLayout = generateCity();
    const worldData = generateWorldData(level, cityLayout, setKillerArchetype);

    // Fetch the profile for the CURRENT killer archetype
    const currentKillerArchetype = useGameStore.getState().killerArchetype;
    const profile = getKillerProfile(currentKillerArchetype);
  
    // Map through the actors to find the killer and inject traits
    const actorsWithTraits = worldData.newActors.map(actor => {
        if (actor.type === 'killer') {
            return {
                ...actor,
                // Assign the visual traits defined in the KillerRegistry
                activeTraits: profile.inspectableTraits 
            };
        }
        return actor;
    });

    setLayout(cityLayout);
    setActors(actorsWithTraits);
    setDecals(worldData.newDecals);
  }, [level, setKillerArchetype]);

  // 2. Handle Killer Events + WITNESS RADIUS
  useEffect(() => {
    if (pendingVignetteSpawn && layout) {
      const { vignetteId } = pendingVignetteSpawn;
      const dangerZone = rng.pick(layout.spawns.danger);
      
      if (dangerZone) {
        const newCrimeDecals = spawnVignette(vignetteId, dangerZone.x, dangerZone.y);
        setDecals(prev => [...prev, ...newCrimeDecals]);

        const killerProfile = getKillerProfile(useGameStore.getState().killerArchetype);
        const WITNESS_RADIUS = 250; 

        setActors(prevActors => prevActors.map(actor => {
            const dist = Math.hypot(actor.x - dangerZone.x, actor.y - dangerZone.y);
            
            if (dist < WITNESS_RADIUS && actor.type !== 'killer') {
                // FIXED: Use 'inspectableTraits' instead of 'visualTraits'
                // We pick a random trait and use its '.name' for the memory string
                const randomTrait = rng.pick(killerProfile.inspectableTraits);
                
                return {
                    ...actor,
                    witnessMemory: {
                        sawKiller: true,
                        traitObserved: randomTrait ? randomTrait.name : "something suspicious",
                        locationName: dangerZone.type || "the shadows",
                        timestamp: Date.now()
                    }
                };
            }
            return actor;
        }));

        clearVignetteSpawn();
      }
    }
  }, [pendingVignetteSpawn, layout, clearVignetteSpawn]);

  // 3. Handle Crisis Events (BOMB / POISON Spawn)
  useEffect(() => {
    if (pendingCrisisInit && layout) {
      // Find a spot near the player (center of map roughly, or use camera logic if we had it)
      // For now, we spawn it near a random Safe Zone to ensure it's reachable.
      const spawnCenter = rng.pick(layout.spawns.safe);
      const newProps: Entity[] = [];
      const timestamp = Date.now();

      if (pendingCrisisInit.type === 'BOMB') {
        // Spawn 1 Bomb
        newProps.push({
          id: `crisis_bomb_${timestamp}`,
          type: 'prop',
          textureKey: 'prop_bomb',
          x: spawnCenter.x,
          y: spawnCenter.y,
          quality: 'CRIME' // Reusing quality tag logic
        });
      } else if (pendingCrisisInit.type === 'POISON') {
        // Spawn 3 Bottles (Red, Blue, Green)
        // We scatter them slightly
        [0, 1, 2].forEach((variant, i) => {
            newProps.push({
                id: `crisis_bottle_${timestamp}_${i}`,
                type: 'prop',
                textureKey: `prop_bottle_${variant}`, // Relies on propPainters having this logic or us adding it to registry logic
                x: spawnCenter.x + rng.float(-40, 40),
                y: spawnCenter.y + rng.float(-40, 40),
                quality: 'CRIME'
            });
        });
      }

      // Inject into world
      setDecals(prev => [...prev, ...newProps]);
      clearCrisisInit();
    }
  }, [pendingCrisisInit, layout, clearCrisisInit]);

  // Texture Registry
  const textureRegistry = useMemo(() => {
    const registry: Record<string, (g: Graphics) => void> = { ...propPainters };
    registry['tree'] = propPainters.stardew_tree;
    registry['bush'] = propPainters.trashcan;
    registry['statue'] = propPainters.lamppost;
    registry['bench'] = propPainters.bench;
    // NEW: Hydrate Bottle Variants (0=Red, 1=Blue, 2=Green)
    for (let i = 0; i < 3; i++) {
        registry[`prop_bottle_${i}`] = (g: Graphics) => propPainters.prop_bottle(g, i);
    }
    Object.entries(painters).forEach(([baseKey, paintFn]) => {
      registry[baseKey] = (g) => paintFn(g, 0);
      for (let i = 0; i <= 5; i++) {
        registry[`${baseKey}_${i}`] = (g: Graphics) => paintFn(g, i);
      }
    });
    return registry;
  }, []);

  // 4. Interactions
  const handleInteract = useCallback((type: 'actor' | 'decal', item: any) => {
    const ctx: GameContext = {
      store: useGameStore.getState(),
      level,
      gameState: useGameStore.getState().gameState
    } as any;
    const entity: Entity = { ...item, type: item.type || (type === 'actor' ? 'civilian' : 'prop') };
    routeInteraction(entity, ctx);
  }, [level]);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !layout) return null;

  return (
    <div className="relative w-full h-full bg-black">
      <div className="absolute inset-0 z-10">
        <Application resizeTo={undefined} width={800} height={600} backgroundColor={0x1a1a1a}>
          <SceneLayer 
            grid={layout.grid}
            staticProps={layout.staticProps} 
            actors={actors} 
            setActors={setActors} // Correctly passed
            layout={layout}       // Correctly passed
            decals={decals} 
            textures={textureRegistry} 
            onInteract={handleInteract} 
          />
        </Application>
      </div>
      <div className="absolute inset-0 z-20 pointer-events-none">
        <GameHUD /> 
      </div>
    </div>
  );
};