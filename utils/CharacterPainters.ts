// --- FILE: utils/CharacterPainters.ts ---

import { Graphics } from 'pixi.js';
import { drawPixelRect, drawPatternRect, drawPixelCircle } from './AssetGenerator';

// --- COLOR PALETTES ---
const SKINS = [0xFFCCBC, 0x8D6E63, 0xFFE0B2, 0x5D4037, 0xFFF9C4]; 
const HAIR_COLORS = [0x000000, 0x5D4037, 0xFFEB3B, 0xE0E0E0, 0xD84315, 0x9E9E9E, 0x7B1FA2]; 
const NEONS = [0x76FF03, 0x00E5FF, 0xF50057, 0xFFEA00];

// --- DYNAMIC OUTFIT PALETTES ---
const SHIRT_COLORS = [0x455A64, 0x795548, 0x33691E, 0xFFFFFF, 0x1A237E, 0xB71C1C, 0x4A148C]; // Slate, Brown, Green, White, Indigo, Red, Purple
const PANTS_COLORS = [0x263238, 0x4E342E, 0x424242, 0xBF360C]; // Dk Blue/Black, Dk Brown, Grey, Khaki
const DARK_PALETTE = [0x212121, 0x263238, 0x000000, 0x424242]; // Greys and Blacks
const BRIGHT_PALETTE = [0xFF5722, 0xFFEB3B, 0x00E5FF, 0x76FF03, 0xF50057]; // Orange, Yellow, Cyan, Lime, Magenta

// Internal helpers (unchanged)
const drawMannequin = (g: Graphics, skin: number, shirt: number, pants: number) => {
    g.beginFill(0x000000, 0.3); g.drawEllipse(16, 46, 10, 3); g.endFill(); 
    drawPixelRect(g, pants, 11, 28, 5, 16); 
    drawPixelRect(g, pants, 17, 28, 5, 16); 
    drawPixelRect(g, shirt, 9, 12, 15, 16); 
    drawPixelRect(g, skin, 10, 0, 12, 12); 
};

const drawHair = (g: Graphics, style: number, color: number) => {
    if (style === 0) return; 
    if (style === 1) { drawPixelRect(g, color, 9, -2, 14, 6); drawPixelRect(g, color, 9, 0, 2, 8); drawPixelRect(g, color, 21, 0, 2, 8); } 
    else if (style === 2) { drawPixelRect(g, color, 8, -4, 16, 16); } 
    else if (style === 3) { drawPixelRect(g, color, 9, -2, 14, 6); drawPixelRect(g, color, 8, 4, 4, 12); drawPixelRect(g, color, 20, 4, 4, 12); } 
    else if (style === 4) { drawPixelRect(g, color, 14, -8, 4, 16); } 
    else if (style === 5) { drawPixelRect(g, color, 9, -2, 14, 6); drawPixelRect(g, color, 9, 2, 18, 2); } // Cap
    else if (style === 6) { drawPixelRect(g, color, 9, -4, 14, 8); drawPixelRect(g, color, 22, -2, 2, 2); } // Beanie
    else if (style === 7) { drawPixelRect(g, color, 8, -2, 16, 6); drawPixelCircle(g, color, 8, 4, 4); drawPixelCircle(g, color, 24, 4, 4); } // Clown Wig
};

// --- EXPORTED PAINTERS (REFACTORED for DECOUPLED Dynamic Color) ---

export const painters = {
    // 1. CLASSICS
    elder: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const shirt = SHIRT_COLORS[(i + 3) % SHIRT_COLORS.length];
        const pants = PANTS_COLORS[(i + 7) % PANTS_COLORS.length];
        drawMannequin(g, skin, shirt, pants);
        drawHair(g, 2, 0xE0E0E0);
        drawPixelRect(g, 0x3E2723, 24, 18, 2, 30); drawPixelRect(g, 0x3E2723, 22, 18, 4, 2); // Cane
    },
    punk: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const outfitColor = DARK_PALETTE[(i + 1) % DARK_PALETTE.length];
        const hairColor = NEONS[(i + 3) % NEONS.length];
        drawMannequin(g, skin, outfitColor, outfitColor);
        drawHair(g, 4, hairColor);
        drawPixelRect(g, outfitColor, 2, 20, 6, 24); drawPixelRect(g, hairColor, 3, 22, 4, 20); // Side Stripe
    },
    suit: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const suitColor = DARK_PALETTE[(i + 1) % DARK_PALETTE.length];
        const tieColor = BRIGHT_PALETTE[(i + 5) % BRIGHT_PALETTE.length];
        const hairColor = HAIR_COLORS[(i + 3) % HAIR_COLORS.length];
        drawMannequin(g, skin, suitColor, suitColor);
        drawPixelRect(g, tieColor, 15, 14, 3, 10); // Tie
        drawHair(g, 1, hairColor);
        drawPixelRect(g, 0x3E2723, 24, 24, 4, 10); // Briefcase
    },

    // 2. SCENARIO: Q1 JOY
    clown: (g: Graphics, i: number) => {
        const baseColor = BRIGHT_PALETTE[i % BRIGHT_PALETTE.length];
        const accentColor = BRIGHT_PALETTE[(i + 1) % BRIGHT_PALETTE.length];
        g.beginFill(0x000000, 0.3); g.drawEllipse(16, 46, 10, 3); g.endFill();
        drawPatternRect(g, baseColor, accentColor, 'polka', 11, 28, 5, 16); 
        drawPatternRect(g, baseColor, accentColor, 'polka', 17, 28, 5, 16); 
        drawPatternRect(g, baseColor, accentColor, 'polka', 9, 12, 15, 16); 
        drawPixelRect(g, 0xFFFFFF, 10, 0, 12, 12); 
        drawPixelRect(g, accentColor, 15, 6, 2, 2); 
        drawHair(g, 7, accentColor); 
    },
    kid_balloon: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const shirtColor = SHIRT_COLORS[(i + 2) % SHIRT_COLORS.length];
        const pantsColor = PANTS_COLORS[(i + 4) % PANTS_COLORS.length];
        const capColor = BRIGHT_PALETTE[(i + 6) % BRIGHT_PALETTE.length];
        const balloonColor = NEONS[(i + 8) % NEONS.length];
        g.beginFill(0x000000, 0.3); g.drawEllipse(16, 46, 10, 3); g.endFill();
        drawPixelRect(g, pantsColor, 11, 28, 5, 12); 
        drawPixelRect(g, pantsColor, 17, 28, 5, 12); 
        drawPatternRect(g, 0xFFFFFF, shirtColor, 'stripes_horz', 9, 14, 15, 14); 
        drawPixelRect(g, skin, 10, 2, 12, 12);
        drawHair(g, 5, capColor); 
        drawPixelRect(g, 0xFFFFFF, 24, -10, 1, 34); 
        drawPixelCircle(g, balloonColor, 24, -14, 6); 
    },

    // 3. SCENARIO: Q2 LEISURE
    hipster: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const plaidBase = BRIGHT_PALETTE[(i + 1) % BRIGHT_PALETTE.length];
        const plaidAccent = DARK_PALETTE[(i + 2) % DARK_PALETTE.length];
        const tshirt = DARK_PALETTE[(i + 3) % DARK_PALETTE.length];
        const pants = PANTS_COLORS[(i + 5) % PANTS_COLORS.length];
        const hair = HAIR_COLORS[(i + 7) % HAIR_COLORS.length];
        drawMannequin(g, skin, tshirt, pants); 
        drawPatternRect(g, plaidBase, plaidAccent, 'plaid', 9, 12, 15, 16); 
        drawHair(g, 6, hair); 
        drawPixelRect(g, 0x5D4037, 10, 8, 12, 4); // Glasses
        drawPixelRect(g, 0xFFFFFF, 24, 20, 4, 6); // Phone
    },
    guitarist: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const shirt = DARK_PALETTE[(i + 1) % DARK_PALETTE.length];
        const pants = DARK_PALETTE[(i + 3) % DARK_PALETTE.length];
        const hair = HAIR_COLORS[(i + 5) % HAIR_COLORS.length];
        drawMannequin(g, skin, shirt, pants);
        drawHair(g, 3, hair); 
        drawPixelRect(g, 0x3E2723, 11, 14, 10, 20); 
        drawPixelRect(g, 0x5D4037, 14, 10, 4, 4); 
    },

    // 4. SCENARIO: Q3 GYM
    bodybuilder: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const shorts = DARK_PALETTE[(i + 2) % DARK_PALETTE.length];
        const tanktop = SHIRT_COLORS[(i + 4) % SHIRT_COLORS.length];
        g.beginFill(0x000000, 0.3); g.drawEllipse(16, 46, 10, 3); g.endFill();
        drawPixelRect(g, shorts, 11, 28, 5, 16); 
        drawPixelRect(g, shorts, 17, 28, 5, 16); 
        drawPixelRect(g, skin, 7, 12, 4, 14); 
        drawPixelRect(g, skin, 22, 12, 4, 14);
        drawPixelRect(g, tanktop, 9, 12, 15, 16); 
        drawPixelRect(g, skin, 10, 0, 12, 12);
        drawHair(g, 0, 0); 
    },
    cyclist: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const outfit = NEONS[(i + 3) % NEONS.length];
        const shorts = DARK_PALETTE[(i + 1) % DARK_PALETTE.length];
        drawMannequin(g, skin, outfit, shorts);
        drawPatternRect(g, outfit, 0xFFFFFF, 'stripes_horz', 9, 12, 15, 16); 
        drawHair(g, 1, 0x000000);
        drawPixelRect(g, 0x424242, 9, -2, 14, 6); // Helmet
        drawPixelRect(g, 0x212121, 10, 4, 12, 2); 
    },

    // 5. GLOBAL
    tourist: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const shirtBase = BRIGHT_PALETTE[(i + 2) % BRIGHT_PALETTE.length];
        const shirtAccent = BRIGHT_PALETTE[(i + 3) % BRIGHT_PALETTE.length];
        const pants = PANTS_COLORS[(i + 5) % PANTS_COLORS.length];
        drawMannequin(g, skin, 0xFFFFFF, pants);
        drawPatternRect(g, shirtBase, shirtAccent, 'noise', 9, 12, 15, 16); 
        drawPixelRect(g, 0xFFFFFF, 8, -4, 16, 4); // Hat
        drawPixelRect(g, 0xFFFFFF, 10, -6, 12, 4); 
        drawPixelRect(g, 0x212121, 13, 18, 6, 4); // Camera
        drawPixelRect(g, 0x212121, 12, 16, 1, 6); 
        drawPixelRect(g, 0x212121, 19, 16, 1, 6); 
    },
    goth: (g: Graphics, i: number) => {
        const outfitColor = DARK_PALETTE[i % DARK_PALETTE.length];
        const accentColor = DARK_PALETTE[(i+2) % DARK_PALETTE.length];
        drawMannequin(g, 0xFFF9C4, outfitColor, outfitColor); 
        drawPatternRect(g, outfitColor, accentColor, 'plaid', 11, 28, 5, 16); 
        drawPatternRect(g, outfitColor, accentColor, 'plaid', 17, 28, 5, 16);
        drawHair(g, 3, 0x000000); 
        drawPixelRect(g, 0x000000, 10, 4, 12, 1); 
    },

    // --- NEW: THE RED HERRINGS ---
    artist: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const pants = PANTS_COLORS[(i + 2) % PANTS_COLORS.length];
        const hair = HAIR_COLORS[(i + 4) % HAIR_COLORS.length];
        drawMannequin(g, skin, 0xFFFFFF, pants); 
        drawHair(g, 6, hair); 
        drawPixelRect(g, 0xF44336, 12, 16, 4, 4); // Paint Splatter
        drawPixelRect(g, 0xF44336, 18, 22, 3, 5);
        drawPixelRect(g, 0x8D6E63, 24, 22, 2, 8); // Brush
        drawPixelRect(g, 0xF44336, 24, 20, 2, 2); 
    },
    gardener: (g: Graphics, i: number) => {
        // Gardener has a uniform. No color change needed.
        drawMannequin(g, SKINS[i % SKINS.length], 0x33691E, 0x1B5E20); 
        drawHair(g, 5, 0x33691E); 
        drawPixelRect(g, 0x9E9E9E, 22, 20, 2, 12); // Shears
        drawPixelRect(g, 0x9E9E9E, 25, 20, 2, 12); 
        drawPixelRect(g, 0x3E2723, 22, 32, 5, 4); 
    },
    commuter: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const shirt = SHIRT_COLORS[(i + 3) % SHIRT_COLORS.length];
        const pants = PANTS_COLORS[(i + 5) % PANTS_COLORS.length];
        const hair = HAIR_COLORS[(i + 7) % HAIR_COLORS.length];
        drawMannequin(g, skin, shirt, pants); 
        drawHair(g, 1, hair);
        g.beginFill(0x000000); // Bag strap
        g.moveTo(10, 14); g.lineTo(24, 30); 
        g.lineTo(26, 28); g.lineTo(12, 12);
        g.endFill();
        drawPixelRect(g, 0x000000, 24, 30, 4, 2); // Bag
    },
    glutton: (g: Graphics, i: number) => {
        const skin = SKINS[i % SKINS.length];
        const shirt = SHIRT_COLORS[(i + 1) % SHIRT_COLORS.length];
        const pants = PANTS_COLORS[(i + 3) % PANTS_COLORS.length];
        drawMannequin(g, skin, shirt, pants); 
        drawPixelRect(g, 0xFFEB3B, 14, 18, 2, 2); // Food
        drawPixelRect(g, 0xB71C1C, 16, 16, 3, 3); 
        drawHair(g, 0, 0); 
        drawPixelRect(g, 0xF57F17, 24, 22, 4, 8); // More food
        drawPixelRect(g, 0xB71C1C, 25, 22, 2, 8); 
    }
};