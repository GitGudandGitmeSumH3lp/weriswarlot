import { Entity } from '@/utils/WorldGenerator';
import { GameContext } from '@/types/GameContext';

export const CrisisSystem = {
    process: (entity: Entity, ctx: GameContext): boolean => {
        // Only active during the crisis
        if (ctx.gameState !== 'SCENARIO_ACTIVE') return false;

        // BOMB LOGIC
        if (entity.textureKey === 'prop_bomb') {
            // Open the Wire Cutting UI
            ctx.store.setCrisisInteraction(entity.id);
            return true; // Handled
        }

        // POISON LOGIC (Immediate Interaction)
        if (entity.textureKey.startsWith('prop_bottle')) {
            // Check if this bottle matches the solution color
            // Visuals: Variant 0=Red, 1=Blue, 2=Green
            // Solution: 'RED', 'BLUE', 'GREEN'
            
            const variant = parseInt(entity.textureKey.split('_')[2]) || 0;
            const colors = ['RED', 'BLUE', 'GREEN'];
            const clickedColor = colors[variant];
            const correctColor = ctx.store.crisisSolution;

            if (clickedColor === correctColor) {
                ctx.store.postFeed('SYSTEM', 'ANTIDOTE ADMINISTERED. TARGET STABILIZED.', 'ANALYSIS');
                ctx.store.resolveCrisis(true);
            } else {
                ctx.store.postFeed('ERROR', 'WRONG ANTIDOTE! TOXIN ACCELERATING.', 'ERROR');
                ctx.store.failScenario(3);
            }
            return true;
        }

        return false;
    }
};