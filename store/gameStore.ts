import { create } from 'zustand';

export type GameState = 
  | 'IDLE' 
  | 'PLAYING' 
  | 'FOUND' 
  | 'MINIGAME'      
  | 'VICTORY'       
  | 'TIMEOUT'       
  | 'GAME_OVER';    

interface GameStore {
  // State
  gameState: GameState;
  score: number;
  level: number;
  killerArchetype: string | null;
  debugMode: boolean; 
  
  
  // Timers
  timeLeft: number;      
  bombTimer: number;     
  
  // Visuals / System
  panicLevel: number;    
  resetCount: number;    
  scanLog: string;

  // Actions
  setScanLog: (log: string) => void;
  startGame: () => void;
  nextLevel: () => void;        // <--- NEW: Continues to next round
  toggleDebug: () => void;
  foundKiller: () => void;
  startMinigame: () => void;
  resolveMinigame: (success: boolean) => void;
  setKillerArchetype: (type: string) => void;
  triggerTimeout: () => void;
  resetGame: () => void;
  
  tickTimer: () => void;
  increasePanic: (amount: number) => void;
}

const BASE_TIME = 30;
const MIN_TIME = 10;
const INITIAL_BOMB_TIME = 10;

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'IDLE',
  score: 0,
  level: 1,
  timeLeft: BASE_TIME,
  bombTimer: INITIAL_BOMB_TIME,
  panicLevel: 0,
  resetCount: 0,
  debugMode: false,
 
  scanLog: 'Reviewing Tape #04. Waiting for movement...',
  setScanLog: (log) => set({ scanLog: log }),

   killerArchetype: null,
  setKillerArchetype: (type) => set({ killerArchetype: type }),

  startGame: () => set({ 
    gameState: 'PLAYING', 
    timeLeft: BASE_TIME, 
    panicLevel: 10 
  }),

  // NEW: Call this when clicking "Next Case" in UI
  nextLevel: () => set((state) => {
    // Difficulty Math: Decrease time by 2s per level, capped at 10s minimum
    const newTime = Math.max(MIN_TIME, BASE_TIME - (state.level * 2));
    
    return {
        gameState: 'IDLE', // Logic will trigger a remount due to resetCount if needed, or just re-init
        level: state.level + 1,
        timeLeft: newTime,
        bombTimer: INITIAL_BOMB_TIME, // Bomb timer stays constant for now
        panicLevel: 0,
        resetCount: state.resetCount + 1,
        killerArchetype: null,
        scanLog: `CASE FILE #${state.level + 1} LOADED. TIMELINE TIGHTENED.`
    };
  }),

  foundKiller: () => set((state) => ({ 
    gameState: 'FOUND',
    panicLevel: 0 
  })),

  startMinigame: () => set({
    gameState: 'MINIGAME',
    bombTimer: INITIAL_BOMB_TIME,
    panicLevel: 50 
  }),

  resolveMinigame: (success) => set((state) => {
    if (success) {
      return {
        gameState: 'VICTORY',
        score: state.score + 500 + (state.bombTimer * 50),
        panicLevel: 0
      };
    } else {
      return {
        gameState: 'GAME_OVER',
        panicLevel: 100
      };
    }
  }),

  triggerTimeout: () => set({ 
    gameState: 'TIMEOUT',
    panicLevel: 100 
  }),

  resetGame: () => set((state) => ({ 
    gameState: 'IDLE', 
    score: 0, 
    level: 1, 
    timeLeft: BASE_TIME, 
    bombTimer: INITIAL_BOMB_TIME,
    panicLevel: 0,
    resetCount: state.resetCount + 1,
    killerArchetype: null,
    scanLog: 'Reviewing Tape #04. Waiting for movement...'
  })),

  tickTimer: () => set((state) => {
    if (state.gameState === 'PLAYING') {
      if (state.timeLeft <= 0) {
        return { gameState: 'TIMEOUT', panicLevel: 100 };
      }
      return { timeLeft: state.timeLeft - 1 };
    }

    if (state.gameState === 'MINIGAME') {
      if (state.bombTimer <= 0) {
        return { gameState: 'GAME_OVER', panicLevel: 100 };
      }
      return { 
        bombTimer: state.bombTimer - 1,
        panicLevel: Math.min(100, state.panicLevel + 5)
      };
    }

    return {};
  }),

  increasePanic: (amount) => set((state) => ({
    panicLevel: Math.min(100, state.panicLevel + amount)
  })),
  toggleDebug: () => set((state) => ({ debugMode: !state.debugMode })), 

  
}));