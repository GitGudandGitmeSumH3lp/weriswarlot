/**
 * @file CivilianSystem.ts
 * @description Manages the movement and behavior of non-killer NPCs.
 */
import { useTick } from '@pixi/react';
import { Entity } from '@/utils/WorldGenerator';
import { CityData } from '@/utils/CityGenerator';
import { rng } from '@/utils/rng';
import { Ticker } from 'pixi.js';

const MOVEMENT_SPEED = 0.5; // Pixels per frame

/**
 * A React hook that manages the movement AI for all civilian actors.
 * @param actors The current array of actors.
 * @param setActors The function to update the actor state.
 * @param layout The city layout containing spawn points.
 */
export const useCivilianSystem = (
  actors: Entity[], 
  setActors: React.Dispatch<React.SetStateAction<Entity[]>>,
  layout: CityData | null
) => {
  useTick((ticker: Ticker) => {
    if (!layout || actors.length === 0) return;

    const updatedActors = actors.map(actor => {
      // Don't move the killer for now
      if (actor.type === 'killer') return actor;

      let { x, y, targetX, targetY, waitTimer } = actor;

      // 1. Handle wait timer
      if (waitTimer && waitTimer > 0) {
        return { ...actor, waitTimer: waitTimer - ticker.deltaMS };
      }

      // 2. Check if target is reached
      const dx = targetX! - x;
      const dy = targetY! - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        // Reached target, assign a new one
        const newTarget = rng.pick(layout.spawns.safe);
        return { 
          ...actor, 
          targetX: newTarget.x, 
          targetY: newTarget.y,
          waitTimer: rng.float(2000, 5000) // Wait 2-5 seconds
        };
      }

      // 3. Move towards target
      const angle = Math.atan2(dy, dx);
      x += Math.cos(angle) * MOVEMENT_SPEED * ticker.deltaTime;
      y += Math.sin(angle) * MOVEMENT_SPEED * ticker.deltaTime;

      return { ...actor, x, y };
    });

    setActors(updatedActors);
  });
};