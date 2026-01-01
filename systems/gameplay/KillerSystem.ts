/**
 * @file KillerSystem.ts
 * @description Manages the killer's internal clock and triggers their actions.
 */
import { useTick } from '@pixi/react';
import { useGameStore } from '@/store/gameStore';
import { getKillerProfile } from '@/data/KillerRegistry';
import { useRef } from 'react';
import { Ticker } from 'pixi.js'; // FIXED: Import the Ticker type

// Get the actions once to avoid re-renders inside the tick
const { tickKillerTimer } = useGameStore.getState();

/**
 * A React hook that provides the "heartbeat" for the killer's AI.
 * It ticks down the killer's action timer once per second.
 */
export const useKillerSystem = () => {
  const elapsed = useRef(0);
  const killerArchetype = useGameStore(state => state.killerArchetype);
  const profile = getKillerProfile(killerArchetype);
  
  // FIXED: The useTick callback in @pixi/react v8 takes a single 'ticker' argument.
  useTick((ticker: Ticker) => {
    // Convert delta time (milliseconds) to seconds
    elapsed.current += ticker.deltaMS / 1000;

    // Only tick once per second
    if (elapsed.current >= 1) {
      elapsed.current -= 1;
      // Call the action from the store
      tickKillerTimer(profile.actionCooldown);
    }
  });
};