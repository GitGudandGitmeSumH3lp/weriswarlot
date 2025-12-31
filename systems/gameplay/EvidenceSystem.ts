// --- FILE: systems/gameplay/EvidenceSystem.ts ---

import { GameSystem, GameContext } from '@/types/GameContext';
import { Entity } from '@/utils/WorldGenerator';
import { SoundSynth } from '@/utils/SoundSynth';
import { getEvidenceAnalysis } from '@/utils/DialogueGenerator';

export const EvidenceSystem: GameSystem = {
    process: (entity: Entity, ctx: GameContext): boolean => {
        if (ctx.gameState !== 'PLAYING') return false;

        // 1. Check for Quality Tag
        if (entity.quality) {
            SoundSynth.playClick();
            
            // --- FIX: Pass texture key as well ---
            ctx.store.logEvidence(entity.id, entity.textureKey, entity.quality);

            if (entity.quality !== 'AMBIANCE') {
                ctx.setDecals(prev => prev.filter(d => d.id !== entity.id));
            }
            return true;
        }

        // 2. Fallback for Legacy Items
        if (entity.type.startsWith('clue_') || entity.type.startsWith('item_')) {
             SoundSynth.playClick();
             // --- FIX: Pass texture key ---
             ctx.store.logEvidence(entity.id, entity.textureKey, 'CRIME');
             
             const analysis = getEvidenceAnalysis(entity.type, ctx.store.killerArchetype);
             ctx.store.postFeed('ANALYSIS', analysis.text, analysis.isValid ? 'VALID' : 'TRASH');
             ctx.setDecals(prev => prev.filter(d => d.id !== entity.id));
             return true;
        }

        return false;
    }
};