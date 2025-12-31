"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text, TilingSprite } from "pixi.js";
import { SceneLayer } from "./layers/SceneLayer";
import { GameHUD } from "../ui/GameHUD";
import { useGameStore } from "@/store/gameStore";
// FIXED: Import the correct function name
import { generateCity } from "@/utils/CityGenerator";
import { generateWorldData, Entity } from "@/utils/WorldGenerator";
import { painters } from "@/utils/CharacterPainters";
import { propPainters } from "@/utils/PropPainters";
import { routeInteraction } from "@/systems/gameplay/InteractionRouter";
import { GameContext } from "@/types/GameContext";

// Register Pixi components
extend({ Container, Graphics, Sprite, Text, TilingSprite });

export const World = () => {
  const [mounted, setMounted] = useState(false);
  
  // 1. Connect to Store
  const { 
    level, 
    gameState, 
    setKillerArchetype, 
    startGame
  } = useGameStore();

  // 2. Generate World Data (Memoized per Level)
  const { layout, actors, decals } = useMemo(() => {
    // FIXED: Call without arguments (CityGenerator doesn't use level yet)
    const cityLayout = generateCity();
    
    // Pass the layout to the WorldGenerator to populate it
    const worldData = generateWorldData(level, cityLayout, setKillerArchetype);
    
    return {
      layout: cityLayout,
      actors: worldData.newActors,
      decals: worldData.newDecals
    };
  }, [level]);

  // 3. Hydrate Texture Registry & Fix Blue Boxes
  const textureRegistry = useMemo(() => {
    const registry: Record<string, (g: Graphics) => void> = { ...propPainters };

    // --- FIX: Map CityGenerator types to available Painters ---
    registry['tree'] = propPainters.stardew_tree;  // Map 'tree' -> sapling
    registry['bush'] = propPainters.trashcan;       // Map 'bush' -> trashcan (Green placeholder)
    registry['statue'] = propPainters.lamppost;     // Map 'statue' -> lamppost (Vertical placeholder)
    registry['bench'] = propPainters.bench;         // Direct match

    // --- Hydrate Character Painters (Variants 0-5) ---
    Object.entries(painters).forEach(([baseKey, paintFn]) => {
      // Register base key (defaults to variant 0)
      registry[baseKey] = (g) => paintFn(g, 0);

      // Register specific variants "punk_0", "punk_1", etc.
      for (let i = 0; i <= 5; i++) {
        registry[`${baseKey}_${i}`] = (g: Graphics) => paintFn(g, i);
      }
    });

    return registry;
  }, []);

  // 4. Interaction Handler
  const handleInteract = useCallback((type: 'actor' | 'decal', item: any) => {
    const ctx: GameContext = {
      store: useGameStore.getState(),
      level,
      gameState: useGameStore.getState().gameState
    } as any; // Cast to any if GameContext type definition is slightly off

    const entity: Entity = {
      ...item,
      type: item.type || (type === 'actor' ? 'civilian' : 'prop')
    };

    routeInteraction(entity, ctx);
  }, [level]);

  // 5. Mount Check
  useEffect(() => {
    setMounted(true);
    if (gameState === 'IDLE') {
        startGame(); 
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-full bg-black">
      {/* 1. The Pixi Canvas */}
      <div className="absolute inset-0 z-10">
        <Application
          resizeTo={undefined} 
          width={800}
          height={600}
          backgroundColor={0x1a1a1a}
        >
          <SceneLayer 
          grid={layout.grid} // <--- ADD THIS
          staticProps={layout.staticProps} 
          actors={actors} 
          decals={decals} 
          textures={textureRegistry} 
          onInteract={handleInteract} 
          />
        </Application>
      </div>

      {/* 2. The UI Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <GameHUD /> 
      </div>
    </div>
  );
};