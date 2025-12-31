// --- FILE: systems/gameplay/InteractionRouter.ts ---

import { Entity } from '@/utils/WorldGenerator';
import { GameContext } from '@/types/GameContext';
import { CrisisSystem } from './CrisisSystem';
import { EvidenceSystem } from './EvidenceSystem';
import { DialogueSystem } from './DialogueSystem';

// Priority Order: Crisis > Dialogue > Evidence
const SYSTEMS = [CrisisSystem, DialogueSystem, EvidenceSystem];

export const routeInteraction = (entity: Entity, ctx: GameContext) => {
    for (const system of SYSTEMS) {
        const handled = system.process(entity, ctx);
        if (handled) return; 
    }

    // Fallback: Flavor Text
    if (ctx.gameState === 'PLAYING') {
        const name = entity.textureKey || entity.type;
        ctx.store.postFeed('SYSTEM', `Just a ${name.replace('_', ' ')}. Nothing useful.`, 'INFO');
    }
};