/**
 * @file InspectionRegistry.ts
 * @description Definitions for body regions and inspectable clues.
 */

export type BodyRegion = 'HEAD' | 'TORSO' | 'HANDS' | 'LEGS' | 'FEET';

export interface VisualTrait {
    id: string;
    name: string; // Display name for the feedback
    region: BodyRegion;
    painterKey: string; // Function name in DetailPainters
    evidenceQuality: 'CRIME' | 'HERRING';
    description: string; // Text shown when found
}

// Coordinate mapping for the HTML Overlay (Relative to a 200x250 container)
// These values are tuned for the 4x scaled mugshot centered at x=35, y=5
export const INSPECTION_ZONES: Record<BodyRegion, { top: number, left: number, width: number, height: number }> = {
    HEAD:   { top: 10,  left: 60, width: 80, height: 80 },
    TORSO:  { top: 90,  left: 60, width: 80, height: 60 },
    HANDS:  { top: 90,  left: 140, width: 40, height: 60 }, // Focusing on Right Hand for simplicity
    LEGS:   { top: 150, left: 70, width: 60, height: 60 },
    FEET:   { top: 210, left: 70, width: 60, height: 30 }
};

export const VISUAL_TRAITS: Record<string, VisualTrait> = {
    'blood_hands': {
        id: 'blood_hands',
        name: 'Blood Stained Hands',
        region: 'HANDS',
        painterKey: 'blood_hands',
        evidenceQuality: 'CRIME',
        description: "Fresh blood under the fingernails."
    },
    'muddy_shoes': {
        id: 'muddy_shoes',
        name: 'Muddy Shoes',
        region: 'FEET',
        painterKey: 'muddy_shoes',
        evidenceQuality: 'CRIME', // Context: Found near grave
        description: "Caked with fresh earth."
    },
    'paint_smear': {
        id: 'paint_smear',
        name: 'Red Paint Smear',
        region: 'TORSO',
        painterKey: 'paint_smear',
        evidenceQuality: 'HERRING',
        description: "Looks like acrylic paint."
    },
    'torn_pocket': {
        id: 'torn_pocket',
        name: 'Torn Pocket',
        region: 'LEGS',
        painterKey: 'torn_pocket',
        evidenceQuality: 'CRIME',
        description: "Something was ripped out in a hurry."
    }
};