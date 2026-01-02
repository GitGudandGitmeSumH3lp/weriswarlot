/**
 * @file CivilianSystem.ts
 * @description Manages the movement and behavior of non-killer NPCs.
 * Handles state transitions based on Global Killer Heat (Wander -> Nervous -> Panic).
 */
import { useTick } from '@pixi/react';
import { Entity } from '@/utils/WorldGenerator';
import { CityData } from '@/utils/CityGenerator';
import { rng } from '@/utils/rng';
import { Ticker } from 'pixi.js';
import { useGameStore } from '@/store/gameStore';
import { HEAT_THRESHOLD_NERVOUS, HEAT_THRESHOLD_PANIC } from '@/data/Constants';

const BASE_SPEED = 0.5; // Pixels per frame

export const useCivilianSystem = (
  actors: Entity[], 
  setActors: React.Dispatch<React.SetStateAction<Entity[]>>,
  layout: CityData | null
) => {
  // 1. Subscribe to Killer Heat (The Bridge)
  const killerHeat = useGameStore(state => state.killerHeat);

  useTick((ticker: Ticker) => {
    if (!layout || actors.length === 0) return;

    // Calculate modifiers based on Heat
    let speedMod = 1.0;
    let isPanic = false;
    let isNervous = false;

    if (killerHeat >= HEAT_THRESHOLD_PANIC) {
        speedMod = 2.5; // Run!
        isPanic = true;
    } else if (killerHeat >= HEAT_THRESHOLD_NERVOUS) {
        speedMod = 1.5; // Fast walk
        isNervous = true;
    }

    const updatedActors = actors.map(actor => {
      // Don't move the killer for now (they have their own logic later)
      if (actor.type === 'killer') return actor;

      let { x, y, targetX, targetY, waitTimer } = actor;

      // --- PANIC OVERRIDE ---
      // If panicked, cancel waiting immediately
      if (isPanic && waitTimer && waitTimer > 0) {
          waitTimer = 0;
      }

      // 1. Handle wait timer (if not panicked)
      if (waitTimer && waitTimer > 0) {
        return { ...actor, waitTimer: waitTimer - ticker.deltaMS };
      }

      // 2. Check if target is reached
      const dx = targetX! - x;
      const dy = targetY! - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        // Target Reached! Pick a new one based on state.
        let newTarget;
        let newWait = 0;

        if (isPanic) {
            // Flee to map edge
            // If we are already at an edge, stay there (cowering) or pick another
            const atExit = layout.exits.some(e => Math.abs(e.x - x) < 20 && Math.abs(e.y - y) < 20);
            if (atExit) {
                // Coward logic: Stay at exit
                newTarget = { x, y }; 
                newWait = 5000; 
            } else {
                // Run to nearest exit
                newTarget = rng.pick(layout.exits);
            }
        } else {
            // Standard Wander
            newTarget = rng.pick(layout.spawns.safe);
            // Nervous people wait less
            const minWait = isNervous ? 500 : 2000;
            const maxWait = isNervous ? 2000 : 5000;
            newWait = rng.float(minWait, maxWait);
        }
        
        return { 
          ...actor, 
          targetX: newTarget.x, 
          targetY: newTarget.y,
          waitTimer: newWait 
        };
      }

      // 3. Move towards target
      const angle = Math.atan2(dy, dx);
      const currentSpeed = BASE_SPEED * speedMod;
      
      x += Math.cos(angle) * currentSpeed * ticker.deltaTime;
      y += Math.sin(angle) * currentSpeed * ticker.deltaTime;

      return { ...actor, x, y };
    });

    setActors(updatedActors);
  });
};