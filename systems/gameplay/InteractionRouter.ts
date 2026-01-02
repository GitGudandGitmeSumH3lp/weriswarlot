// FILE: systems/gameplay/InteractionRouter.ts

import { Entity } from '@/utils/WorldGenerator';
import { GameContext } from '@/types/GameContext';
import { EvidenceSystem } from './EvidenceSystem';
import { CrisisSystem } from './CrisisSystem'; // Import
// CrisisSystem placeholder removed for now

export const routeInteraction = (entity: Entity, ctx: GameContext) => {
    
    // 1. PRIORITY: CRISIS (Highest)
    const crisisHandled = CrisisSystem.process(entity, ctx);
    if (crisisHandled) return;

    // 2. PRIORITY: DIALOGUE
    if (entity.type === 'civilian' || entity.type === 'killer' || entity.id.startsWith('actor_')) {
        ctx.store.startInterrogation(entity);
        return; 
    }

    // 3. PRIORITY: EVIDENCE
    EvidenceSystem.process(entity, ctx);
};