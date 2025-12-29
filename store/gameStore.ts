import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// [CHANGE 1] Added 'BOMB_SEARCH' to valid states
export type GameState = 
  | 'IDLE' | 'PLAYING' | 'FOUND' | 'BOMB_SEARCH' | 'MINIGAME' | 'VICTORY' | 'TIMEOUT' | 'GAME_OVER';

export type GameOverReason = 'TIMEOUT' | 'BOMB' | 'CAPTURE' | null;

interface GameStore {
  // State
  gameState: GameState;
  score: number;
  highScore: number;
  level: number;
  debugMode: boolean; 
  timeLeft: number;      
  bombTimer: number;     
  panicLevel: number;    
  resetCount: number;    
  scanLog: string;
  
  killerArchetype: string | null;
  // [CHANGE 2] New Archetype for Profiler Logic
  bombArchetype: 'planner' | 'chaotic' | 'cleaner' | null;
  
  evidenceCount: number;
  mistakeCount: number;
  
  // [CHANGE 3] New Counter for Physical Evidence
  bombPartsFound: number; // Target is 3
  
  gameOverReason: GameOverReason;

  // Actions
  setScanLog: (log: string) => void;
  startGame: () => void;
  nextLevel: () => void;
  toggleDebug: () => void;
  foundKiller: () => void;
  
  // [CHANGE 4] Refactored Bomb Logic
  triggerBombPhase: () => void; // Starts the search
  startDefusal: () => void;     // Triggers the wire cut UI (Per Part)
  resolveMinigame: (success: boolean) => void; // Handles the cut result
  
  triggerTimeout: () => void;
  resetGame: () => void;
  tickTimer: () => void;
  increasePanic: (amount: number) => void;
  setKillerArchetype: (type: string) => void;
  logEvidence: () => void;
  logMistake: () => void;
  captureSuspect: () => void;
}

const BASE_TIME = 30;
const MIN_TIME = 10;
const INITIAL_BOMB_TIME = 15; 

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gameState: 'IDLE',
      score: 0,
      highScore: 0, 
      level: 1,
      timeLeft: BASE_TIME,
      bombTimer: INITIAL_BOMB_TIME,
      panicLevel: 0,
      resetCount: 0,
      debugMode: false,
      scanLog: 'Reviewing Tape #04...',
      killerArchetype: null,
      bombArchetype: null, // Init
      evidenceCount: 0,
      mistakeCount: 0,
      bombPartsFound: 0, 
      gameOverReason: null,

      setScanLog: (log) => set({ scanLog: log }),

      startGame: () => set({ 
        gameState: 'PLAYING', 
        timeLeft: BASE_TIME, 
        panicLevel: 10,
        evidenceCount: 0,
        mistakeCount: 0,
        bombPartsFound: 0,
        gameOverReason: null
      }),

      nextLevel: () => set((state) => {
        const newTime = Math.max(MIN_TIME, BASE_TIME - (state.level * 2));
        return {
            gameState: 'IDLE',
            level: state.level + 1,
            timeLeft: newTime,
            bombTimer: INITIAL_BOMB_TIME,
            panicLevel: 0,
            resetCount: state.resetCount + 1,
            scanLog: `CASE FILE #${state.level + 1} LOADED.`,
            killerArchetype: null,
            bombArchetype: null,
            evidenceCount: 0, 
            mistakeCount: 0,
            bombPartsFound: 0,
            gameOverReason: null
        };
      }),

      setKillerArchetype: (type) => set((state) => {
          let arch: 'planner' | 'chaotic' | 'cleaner' = 'chaotic';
          
          // LOGIC MAPPING: Visuals -> Psychology
          const chaoticList = ['human_punk', 'clown', 'kid_balloon', 'artist', 'glutton', 'guitarist'];
          const plannerList = ['human_suit', 'human_elder', 'commuter', 'tourist', 'cyclist'];
          const cleanerList = ['gardener', 'bodybuilder', 'hipster', 'goth'];

          if (plannerList.some(k => type.includes(k))) arch = 'planner';
          else if (cleanerList.some(k => type.includes(k))) arch = 'cleaner';
          
          return { killerArchetype: type, bombArchetype: arch };
      }),

      logEvidence: () => set((state) => ({ evidenceCount: state.evidenceCount + 1 })),
      logMistake: () => set((state) => ({ mistakeCount: state.mistakeCount + 1 })),

      foundKiller: () => set((state) => ({ gameState: 'FOUND', panicLevel: 0 })),
      
      captureSuspect: () => set({ 
        gameState: 'GAME_OVER', 
        gameOverReason: 'CAPTURE',
        panicLevel: 0,
        scanLog: "SUSPECT IN CUSTODY. CASE CLOSED?"
      }),

      // --- BOMB LOGIC START ---

      // 1. Enter the Scavenger Hunt
      triggerBombPhase: () => set({ 
        gameState: 'BOMB_SEARCH', 
        bombTimer: INITIAL_BOMB_TIME, 
        panicLevel: 50,
        bombPartsFound: 0,
        scanLog: "WARNING: IED DETECTED. LOCATE COMPONENTS."
      }),

      // 2. Clicked a Part -> Trigger Minigame
      startDefusal: () => set({ 
          gameState: 'MINIGAME', 
          scanLog: "TAMPER PROTECTION DETECTED. BYPASS REQUIRED.",
          panicLevel: 80 
      }),

      // 3. Resolve the Wire Cut
      resolveMinigame: (success) => set((state) => {
        if (success) {
            const newCount = state.bombPartsFound + 1;
            
            // Check Victory Condition (Target: 3)
            if (newCount >= 3) {
                const roundScore = (state.bombTimer * 100) + (state.evidenceCount * 250);
                const newTotalScore = state.score + Math.max(0, roundScore);
                const newHighScore = newTotalScore > state.highScore ? newTotalScore : state.highScore;

                return {
                    bombPartsFound: newCount,
                    gameState: 'VICTORY',
                    score: newTotalScore,
                    highScore: newHighScore,
                    panicLevel: 0,
                    scanLog: "ALL COMPONENTS NEUTRALIZED. THREAT ENDED."
                };
            }
            
            // Resume Search
            return { 
                bombPartsFound: newCount, 
                gameState: 'BOMB_SEARCH', 
                scanLog: `MODULE BYPASSED. RESUME SEARCH (${newCount}/3).`,
                panicLevel: 50,
                bombTimer: state.bombTimer + 5 // Bonus time for successful cut
            };
        } else {
            // Cut Wrong Wire
            return { gameState: 'GAME_OVER', gameOverReason: 'BOMB', panicLevel: 100 };
        }
      }),

      // --- BOMB LOGIC END ---

      triggerTimeout: () => set({ gameState: 'TIMEOUT', gameOverReason: 'TIMEOUT', panicLevel: 100 }),

      resetGame: () => set((state) => ({ 
        gameState: 'IDLE', 
        score: 0, 
        level: 1, 
        timeLeft: BASE_TIME, 
        bombTimer: INITIAL_BOMB_TIME,
        panicLevel: 0,
        resetCount: state.resetCount + 1,
        scanLog: 'Reviewing Tape #04...',
        killerArchetype: null,
        bombArchetype: null,
        evidenceCount: 0,
        mistakeCount: 0,
        bombPartsFound: 0,
        gameOverReason: null
      })),

      tickTimer: () => set((state) => {
        if (state.gameState === 'PLAYING') {
          if (state.timeLeft <= 0) return { gameState: 'TIMEOUT', gameOverReason: 'TIMEOUT', panicLevel: 100 };
          return { timeLeft: state.timeLeft - 1 };
        }
        // Timer ticks for both Search and Minigame phases
        if (state.gameState === 'MINIGAME' || state.gameState === 'BOMB_SEARCH') {
          if (state.bombTimer <= 0) return { gameState: 'GAME_OVER', gameOverReason: 'BOMB', panicLevel: 100 };
          // Using -1 for consistent seconds (unless you prefer the fast decimal tick)
          return { bombTimer: state.bombTimer - 1, panicLevel: Math.min(100, state.panicLevel + 5) };
        }
        return {};
      }),

      increasePanic: (amount) => set((state) => ({ panicLevel: Math.min(100, state.panicLevel + amount) })),
      toggleDebug: () => set((state) => ({ debugMode: !state.debugMode })), 
    }),
    {
      name: 'weriswarlot-storage', 
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ highScore: state.highScore }), 
    }
  )
);