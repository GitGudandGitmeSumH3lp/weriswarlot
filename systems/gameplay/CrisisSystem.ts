// --- FILE: systems/gameplay/CrisisSystem.ts ---

import { GameSystem, GameContext } from '@/types/GameContext';
import { Entity } from '@/utils/WorldGenerator';
import { SoundSynth } from '@/utils/SoundSynth';

export const CrisisSystem: GameSystem = {
    process: (entity: Entity, ctx: GameContext): boolean => {
        if (ctx.gameState !== 'SCENARIO_ACTIVE') return false;

        // --- BOMB SCENARIO ---
        if (ctx.activeScenario === 'BOMB' && entity.type === 'device_part') {
            SoundSynth.playClick();
            
            // Remove Part
            ctx.setDecals(prev => prev.filter(d => d.id !== entity.id));
            
            // Update Progress
            const newProgress = ctx.scenarioState.progress + 1;
            ctx.setScenarioState(prev => ({ ...prev, progress: newProgress }));

            if (newProgress >= 3) {
                ctx.store.postFeed('SYSTEM', "DEVICE NEUTRALIZED.", 'SUCCESS');
                ctx.store.completeLevel(true);
            }
            return true;
        }

        // --- POISON SCENARIO ---
        if (ctx.activeScenario === 'POISON') {
            // Check if clicked actor is infected
            if (ctx.scenarioState.infectedIds.includes(entity.id)) {
                SoundSynth.playReveal();
                
                // Cure Actor
                ctx.setScenarioState(prev => ({
                    ...prev,
                    infectedIds: prev.infectedIds.filter(id => id !== entity.id),
                    progress: prev.progress + 1
                }));

                const newProgress = ctx.scenarioState.progress + 1;
                if (newProgress >= 3) {
                    ctx.store.postFeed('SYSTEM', "TARGETS CLEARED.", 'SUCCESS');
                    ctx.store.completeLevel(true);
                }
                return true;
            }
        }

        return false;
    }
};