// --- FILE: systems/gameplay/DialogueSystem.ts ---

import { GameSystem, GameContext } from '@/types/GameContext';
import { Entity } from '@/utils/WorldGenerator';
import { SoundSynth } from '@/utils/SoundSynth';
import { generateDialogue } from '@/utils/DialogueGenerator';

export const DialogueSystem: GameSystem = {
    process: (entity: Entity, ctx: GameContext): boolean => {
        // Only applies to Actors (not props)
        if (!entity.id.startsWith('actor_')) return false;

        if (ctx.gameState === 'PLAYING') {
            if (entity.type === 'killer') {
                ctx.store.triggerConfrontation();
            } else {
                SoundSynth.playClick();
                // Find killer for dialogue context
                const killer = ctx.actors.find(a => a.type === 'killer');
                const text = generateDialogue(entity, killer);
                ctx.store.postFeed('VOICE', text, entity.textureKey || 'CIVILIAN');
            }
            return true;
        }

        return false;
    }
};