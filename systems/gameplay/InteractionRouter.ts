// FILE: systems/gameplay/InteractionRouter.ts

import { Entity } from '@/utils/WorldGenerator';
import { GameContext } from '@/types/GameContext';
import { EvidenceSystem } from './EvidenceSystem';
// CrisisSystem placeholder removed for now

export const routeInteraction = (entity: Entity, ctx: GameContext) => {
    
    // 1. PRIORITY: CRISIS (Pending)
    if (entity.type === 'civilian' || entity.type === 'killer' || entity.id.startsWith('actor_')) {
        ctx.store.startInterrogation(entity);
        return; 
    }

    // 2. PRIORITY: DIALOGUE / INTERROGATION
    if (entity.type === 'civilian' || entity.type === 'killer') {
        // Trigger the UI Overlay
        ctx.store.startInterrogation(entity);
        return; // Stop propagation
    }

    // 3. PRIORITY: EVIDENCE
    EvidenceSystem.process(entity, ctx);
};