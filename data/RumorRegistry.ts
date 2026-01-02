/**
 * @file RumorRegistry.ts
 * @description Logic for converting witness memory into dialogue strings.
 */

import { Entity } from '@/utils/WorldGenerator';

export const getRumorText = (actor: Entity): string => {
    if (!actor.witnessMemory) {
        return "I didn't see anything unusual. Just another day in the city.";
    }

    const { traitObserved, locationName } = actor.witnessMemory;
    
    const templates = [
        `I caught a glimpse of someone with ${traitObserved} near the ${locationName.replace('_', ' ')}.`,
        `There was a suspicious character over by ${locationName.replace('_', ' ')}... they had ${traitObserved}.`,
        `I won't forget that face. They had ${traitObserved}. It happened so fast.`,
    ];

    // Pick a random template based on actor ID to keep it consistent for that NPC
    const index = parseInt(actor.id.split('_')[1]) % templates.length;
    return templates[index];
};