/**
 * @file RumorRegistry.ts
 * @description Converts witness memory into unreliable, cinematic dialogue.
 */

import { Entity } from '@/utils/WorldGenerator';

export const getRumorText = (actor: Entity): string => {
    if (!actor.witnessMemory) {
        const idleLines = [
            "I didn’t see anything. Or maybe I did. It all blends together after a while.",
            "Sorry. I keep my head down. That’s how you last in this city.",
            "People come and go. Faces stop meaning much.",
            "If something happened, it happened fast. It always does."
        ];

        const index = parseInt(actor.id.split('_')[1]) % idleLines.length;
        return idleLines[index];
    }

    const { traitObserved, locationName } = actor.witnessMemory;
    const place = locationName.replace('_', ' ');

    const templates = [
        // Deflection
        `I don’t want to make accusations. But someone with ${traitObserved} was hanging around the ${place}.`,
        `Maybe it was nothing. Still… the ${traitObserved}. That was near the ${place}.`,

        // Unease
        `You ever get that feeling you’re being watched? I felt it near the ${place}. The ${traitObserved} stuck with me.`,
        `Everything felt normal until I noticed the ${traitObserved}. That was by the ${place}.`,

        // Guilt
        `I should’ve trusted my gut. The ${traitObserved}… I saw it near the ${place}.`,
        `I told myself not to stare. Now I wish I had. The ${traitObserved} was near the ${place}.`,

        // Fragmented Memory
        `I don’t remember the face. Just the ${traitObserved}. And the ${place}.`,
        `The crowd blurred together. One detail didn’t — the ${traitObserved}. That was near the ${place}.`,

        // Fear
        `Look, I don’t want trouble. But someone by the ${place} had ${traitObserved}. That’s all I’m saying.`,
        `I don’t like remembering it. The ${traitObserved}. The ${place}. That’s where it was.`,

        // Noir / PI tone
        `Cities leave marks on people. Someone with ${traitObserved} left one near the ${place}.`,
        `I’ve seen that look before. ${traitObserved}. Near the ${place}. Didn’t end well.`,

        // Doubt
        `Maybe I’m wrong. But I keep thinking about the ${traitObserved}. It was near the ${place}.`,
        `Memory plays tricks on you. Still… the ${traitObserved}. The ${place}.`
    ];

    // Deterministic per NPC
    const index = parseInt(actor.id.split('_')[1]) % templates.length;
    return templates[index];
};
