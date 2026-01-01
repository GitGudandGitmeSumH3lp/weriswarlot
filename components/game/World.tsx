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
    clearVignetteSpawn
  } = useGameStore();

  // 1. Initial World Generation
  useEffect(() => {
    const cityLayout = generateCity();
    const worldData = generateWorldData(level, cityLayout, setKillerArchetype);
    
    setLayout(cityLayout);
    setActors(worldData.newActors);
    setDecals(worldData.newDecals);
  }, [level, setKillerArchetype]);

  // 2. Handle Killer Events
  useEffect(() => {
    if (pendingVignetteSpawn && layout) {
      const { vignetteId } = pendingVignetteSpawn;
      const dangerZone = rng.pick(layout.spawns.danger);
      if (dangerZone) {
        const newCrimeDecals = spawnVignette(vignetteId, dangerZone.x, dangerZone.y);
        setDecals(prev => [...prev, ...newCrimeDecals]);
        clearVignetteSpawn();
      }
    }
  }, [pendingVignetteSpawn, layout, clearVignetteSpawn]);

  // 3. Texture Registry
  const textureRegistry = useMemo(() => {
    const registry: Record<string, (g: Graphics) => void> = { ...propPainters };
    registry['tree'] = propPainters.stardew_tree;
    registry['bush'] = propPainters.trashcan;
    registry['statue'] = propPainters.lamppost;
    registry['bench'] = propPainters.bench;
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