import { create } from 'zustand';

// Expanded State Machine
export type GameState = 
  | 'IDLE' 
  | 'PLAYING' 
  | 'FOUND' // New: Narrative pause
  | 'MINIGAME'       // New: Bomb defusal
  | 'VICTORY'        // New: Round win
  | 'TIMEOUT'        // New: Round loss (Time out)
  | 'GAME_OVER';     // New: Total failure (Bomb exploded)

interface GameStore {
  // State
  gameState: GameState;
  score: number;
  level: number;
  debugMode: boolean; 
  
  // Timers
  timeLeft: number;      // Investigation Phase Timer
  bombTimer: number;     // Minigame Phase Timer (New)
  
  // Visuals / System
  panicLevel: number;    // 0 to 100
  resetCount: number;    // Used to force React Component remounts (New)

  // Actions
  startGame: () => void;
  toggleDebug: () => void;      //DEBUG
  foundKiller: () => void;      // Transitions to DIALOGUE
  startMinigame: () => void;    // Transitions to MINIGAME
  resolveMinigame: (success: boolean) => void; // Transitions to VICTORY or GAME_OVER
  
  triggerTimeout: () => void;
  resetGame: () => void;        // Hard reset
  
  tickTimer: () => void;        // Handles both Investigation and Bomb timers
  increasePanic: (amount: number) => void;
}

const INITIAL_TIME = 30;
const INITIAL_BOMB_TIME = 10;

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'IDLE',
  score: 0,
  level: 1,
  timeLeft: INITIAL_TIME,
  bombTimer: INITIAL_BOMB_TIME,
  panicLevel: 0,
  resetCount: 0,
 debugMode: false,

  startGame: () => set({ 
    gameState: 'PLAYING', 
    timeLeft: INITIAL_TIME,
    panicLevel: 10 
  }),

  // Transition 1: Clicked the Killer -> Narrative Mode
  foundKiller: () => set((state) => ({ 
    gameState: 'FOUND',
    panicLevel: 0 
  })),

  // Transition 2: Narrative End -> Defusal Mode
  startMinigame: () => set({
    gameState: 'MINIGAME',
    bombTimer: INITIAL_BOMB_TIME,
    panicLevel: 50 // High tension
  }),

  // Transition 3: Result
  resolveMinigame: (success) => set((state) => {
    if (success) {
      return {
        gameState: 'VICTORY',
        score: state.score + 500 + (state.bombTimer * 50), // Bonus for speed
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

  // Soft Reset + Increment Count to force remount
  resetGame: () => set((state) => ({ 
    gameState: 'IDLE', 
    score: 0, 
    level: 1, 
    timeLeft: INITIAL_TIME, 
    bombTimer: INITIAL_BOMB_TIME,
    panicLevel: 0,
    resetCount: state.resetCount + 1 // <--- The Fix
  })),

  tickTimer: () => set((state) => {
    // 1. Investigation Phase
    if (state.gameState === 'PLAYING') {
      if (state.timeLeft <= 0) {
        return { gameState: 'TIMEOUT', panicLevel: 100 };
      }
      return { timeLeft: state.timeLeft - 1 };
    }

    // 2. Bomb Phase
    if (state.gameState === 'MINIGAME') {
      if (state.bombTimer <= 0) {
        return { gameState: 'GAME_OVER', panicLevel: 100 };
      }
      // Ramp up panic as bomb timer ticks down
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
