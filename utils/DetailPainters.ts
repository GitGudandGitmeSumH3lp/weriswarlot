/**
 * @file DetailPainters.ts
 * @description Additional rendering layers for clues on top of characters.
 * Assumes standard character coordinate space.
 */
import { Graphics } from 'pixi.js';

const drawPixelRect = (g: Graphics, color: number, x: number, y: number, w: number, h: number) => {
    g.beginFill(color);
    g.drawRect(x, y, w, h);
    g.endFill();
};

export const detailPainters = {
    blood_hands: (g: Graphics) => {
        // Right Hand area (~24, 12)
        drawPixelRect(g, 0xB71C1C, 24, 20, 8, 4); // Red tips
        drawPixelRect(g, 0xB71C1C, 26, 16, 2, 2); // Speckle
    },
    muddy_shoes: (g: Graphics) => {
        // Feet area (~10, 44)
        drawPixelRect(g, 0x5D4037, 10, 46, 12, 4); // Mud overlay
        drawPixelRect(g, 0x3E2723, 12, 44, 4, 2); // Clumps
    },
    paint_smear: (g: Graphics) => {
        // Torso area (~9, 12)
        drawPixelRect(g, 0xF44336, 14, 18, 6, 2); // Red smear
        drawPixelRect(g, 0xF44336, 16, 20, 2, 4); // Drip
    },
    torn_pocket: (g: Graphics) => {
        // Pants/Legs area
        drawPixelRect(g, 0x000000, 11, 30, 4, 1); // Rip line
        drawPixelRect(g, 0xFFFFFF, 12, 31, 2, 2); // Inner lining showing
    }
};