// --- FILE: store/gameStore.ts ---

import { create } from 'zustand';
import { getKillerProfile } from '@/data/KillerRegistry';
import { rng } from '@/utils/rng';

export type GameState = 'IDLE' | 'PLAYING' | 'FOUND' | 'CONFRONTATION' | 'SCENARIO_ACTIVE' | 'GAME_OVER' | 'LEVEL_COMPLETE';
export type ScenarioType = 'BOMB' | 'EVIDENCE' | 'POISON' | 'ACCOMPLICE';

interface FeedMessage {
  id: number;
  source: 'SYSTEM' | 'ANALYSIS' | 'VOICE' | 'ERROR';
  text: string;
  meta?: string;
}

// --- NEW: Detailed Evidence Item ---
export interface EvidenceItem {
    id: string;
    texture: string;
    quality: 'CRIME' | 'HERRING' | 'AMBIANCE' | string;
    timestamp: number;
}

interface GameStateData {
  // Core State
  gameState: GameState;
  level: number;
  debugMode: boolean;
  
  // Metrics
  victimCount: number;      
  convictionScore: number; 
  killerArchetype: string;  
  
  activeScenario: ScenarioType | null;
  scenarioTimer: number;
  feed: FeedMessage[];
  // --- UPDATED: Evidence Bag holds Objects now ---
  evidenceBag: EvidenceItem[]; 

  killerActionTimer: number;
  killerHeat: number;
  pendingVignetteSpawn: { vignetteId: string; dangerZone: any } | null; // The event trigger


  
  // Actions
  startGame: () => void;
  setKillerArchetype: (type: string) => void;
  postFeed: (source: FeedMessage['source'], text: string, meta?: string) => void;
  toggleDebug: () => void;
  tickTimer: () => void;
  
  // Updated Signature
  logEvidence: (id: string, texture: string, quality: string) => void; 
  
  triggerConfrontation: () => void;    
  resolveConfrontation: (choice: 'ARREST' | 'SAVE') => void;
  failScenario: (deaths: number) => void;
  completeLevel: (escaped: boolean) => void; 
  nextLevel: () => void;
  tickKillerTimer: (cooldown: number) => void; // Accepts cooldown from profile
  clearVignetteSpawn: () => void;
  // No action for heat, it's set internally
}

export const useGameStore = create<GameStateData>((set, get) => ({
  gameState: 'IDLE',
  level: 1,
  debugMode: false,
  victimCount: 0,
  convictionScore: 15, 
  killerArchetype: 'unknown',
  activeScenario: null,
  scenarioTimer: 0,
  feed: [],
  evidenceBag: [],
  killerActionTimer: 60, // Initial delay before first action
  killerHeat: 0,
  pendingVignetteSpawn: null,

  // Update startGame to reset killer state
  startGame: () => {
    get().postFeed('SYSTEM', 'CONNECTION ESTABLISHED. BEGIN SCAN.', 'INIT');
    set({ 
        gameState: 'PLAYING', 
        convictionScore: 15, 
        activeScenario: null,
        evidenceBag: [],
        killerActionTimer: 60, // Reset timer
        killerHeat: 0,         // Reset heat
        pendingVignetteSpawn: null
    });
  },

  setKillerArchetype: (type) => set({ killerArchetype: type }),

  postFeed: (source, text, meta) => set((state) => ({
    feed: [...state.feed.slice(-4), { id: Date.now(), source, text, meta }]
  })),

  toggleDebug: () => set((state) => ({ debugMode: !state.debugMode })),

  tickTimer: () => set((state) => {
    if (state.gameState === 'SCENARIO_ACTIVE' && state.scenarioTimer > 0) {
       return { scenarioTimer: state.scenarioTimer - 1 };
    }
    return {};
  }),

  // --- UPDATED LOGIC ---
  logEvidence: (id, texture, quality) => {
    const { convictionScore, evidenceBag } = get();

    if (evidenceBag.find(e => e.id === id)) return;
    
    if (evidenceBag.length >= 5) {
        get().postFeed('SYSTEM', 'EVIDENCE BAG FULL.', 'ERROR');
        return;
    }

    let scoreChange = 0;
    let msg = '';
    let type: FeedMessage['source'] = 'ANALYSIS';

    if (quality === 'CRIME') {
        scoreChange = 20;
        msg = 'SOLID EVIDENCE. Case strength increased.';
        type = 'ANALYSIS';
    } else if (quality === 'HERRING') {
        scoreChange = -10;
        msg = 'USELESS JUNK. The DA will not like this.';
        type = 'ERROR';
    } else {
        msg = 'Clutter logged.';
    }

    const newScore = Math.max(0, Math.min(100, convictionScore + scoreChange));

    set({ 
        convictionScore: newScore,
        evidenceBag: [...evidenceBag, { id, texture, quality, timestamp: Date.now() }]
    });

    get().postFeed(type, `${msg} (${newScore}%)`);
  },

  triggerConfrontation: () => {
    const { convictionScore } = get();
    if (convictionScore < 70) {
        get().postFeed('SYSTEM', `CASE TOO WEAK (${convictionScore}%). CANNOT ARREST.`, 'ERROR');
        return;
    }
    const scenarios: ScenarioType[] = ['BOMB', 'EVIDENCE', 'POISON', 'ACCOMPLICE'];
    set({ 
        gameState: 'CONFRONTATION', 
        activeScenario: scenarios[Math.floor(Math.random() * scenarios.length)] 
    });
  },

  resolveConfrontation: (choice) => {
    const { activeScenario, convictionScore } = get();
    if (choice === 'ARREST') {
        const roll = Math.random() * 100;
        if (roll < convictionScore) {
            const deaths = activeScenario === 'BOMB' ? 5 : activeScenario === 'POISON' ? 3 : 1;
            set((state) => ({ gameState: 'LEVEL_COMPLETE', victimCount: state.victimCount + deaths, activeScenario: null }));
        } else {
            get().failScenario(0); 
        }
    } else {
        set({ gameState: 'SCENARIO_ACTIVE', scenarioTimer: 30 });
        get().postFeed('SYSTEM', 'PROTOCOL: MERCY. INITIATE RESCUE.', 'TIMER_START');
    }
  },
  
 failScenario: (deaths) => set((state) => ({ gameState: 'GAME_OVER', victimCount: state.victimCount + deaths })),
  completeLevel: (escaped) => set((state) => ({ gameState: 'LEVEL_COMPLETE', victimCount: state.victimCount + (escaped ? 2 : 0) })),
  nextLevel: () => set((state) => ({
      level: state.level + 1, gameState: 'IDLE', convictionScore: 15, activeScenario: null, evidenceBag: [], 
      feed: [{ id: Date.now(), source: 'SYSTEM', text: `CASE FILE ${state.level + 1} OPENED.`, meta: 'INIT' }]
  })),

    // --- KILLER SYSTEM ACTIONS ---
  tickKillerTimer: (cooldown) => set((state) => {
    if (state.gameState !== 'PLAYING') return {};

    if (state.killerActionTimer > 0) {
      return { killerActionTimer: state.killerActionTimer - 1 };
    } else {
      const profile = getKillerProfile(get().killerArchetype);
      const crimeToCommit = rng.pick(profile.crimeVignettes);
      
      get().postFeed('SYSTEM', `ANOMALOUS ENERGY: ${crimeToCommit}`, 'WARNING');
      
      return {
        killerActionTimer: profile.actionCooldown,
        killerHeat: Math.min(100, state.killerHeat + profile.heatIncrease),
        pendingVignetteSpawn: { vignetteId: crimeToCommit, dangerZone: null } 
      };
    }
  }),

  clearVignetteSpawn: () => set({ pendingVignetteSpawn: null }) // Implementation
}));
