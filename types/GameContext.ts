// --- FILE: types/GameContext.ts ---

import { Entity } from '@/utils/WorldGenerator';

export interface LocalScenarioState {
    progress: number;
    infectedIds: string[];
}

export interface GameContext {
    // Global Store Access
    store: any; 
    
    // Game State Shortcuts
    gameState: string;
    activeScenario: string;

    // World State (Read/Write)
    decals: Entity[];
    setDecals: React.Dispatch<React.SetStateAction<Entity[]>>;
    actors: Entity[];
    
    // Local Scenario State (Read/Write)
    scenarioState: LocalScenarioState;
    setScenarioState: React.Dispatch<React.SetStateAction<LocalScenarioState>>;
}

export interface GameSystem {
    // Returns true if the interaction was handled
    process: (entity: Entity, ctx: GameContext) => boolean;
}