// --- FILE: utils/PropPainters.ts ---

import { Graphics } from 'pixi.js';
import { drawPixelRect, drawPixelCircle, drawPatternRect } from './AssetGenerator';

// --- NEW: Stardew-inspired Palette ---
const STARDEW_PALETTE = {
    LEAF_LIGHT: 0x95C842,
    LEAF_MID: 0x669D34,
    LEAF_DARK: 0x436F2D,
    TRUNK_MID: 0x945A31,
    TRUNK_DARK: 0x633B24,
};

export const propPainters = {

    // --- NEW: Stardew Valley Style Tree ---
    stardew_tree: (g: Graphics) => {
        // Tree is larger, ~32x48 pixels, centered on the tile's x-axis.
        const centerX = 0;
        const groundY = 16; // Base of the trunk

        // 1. Leaf Shadow (Drawn first to be behind everything)
        g.beginFill(STARDEW_PALETTE.TRUNK_DARK, 0.4);
        g.drawEllipse(centerX, groundY + 2, 18, 8); // Ground shadow
        g.endFill();
        
        // 2. Trunk (with shadow for volume)
        drawPixelRect(g, STARDEW_PALETTE.TRUNK_DARK, centerX - 5, groundY - 20, 5, 20); // Shadow side
        drawPixelRect(g, STARDEW_PALETTE.TRUNK_MID, centerX, groundY - 20, 5, 20); // Light side

        // 3. Main Leaf Canopy (Fluffy "cloud" shape)
        g.beginFill(STARDEW_PALETTE.LEAF_MID);
        g.drawCircle(centerX, groundY - 35, 16);       // Main body
        g.drawCircle(centerX - 12, groundY - 28, 12);  // Left puff
        g.drawCircle(centerX + 10, groundY - 25, 14);  // Right puff
        g.endFill();

        // 4. Leaf Highlights
        g.beginFill(STARDEW_PALETTE.LEAF_LIGHT);
        g.drawCircle(centerX, groundY - 40, 10);
        g.drawCircle(centerX + 8, groundY - 30, 8);
        g.endFill();

        // 5. Leaf Shading (underneath)
        g.beginFill(STARDEW_PALETTE.LEAF_DARK);
        g.drawCircle(centerX, groundY - 25, 14);
        g.endFill();
    },

    // --- CRIME SCENE ---
    fresh_grave: (g: Graphics) => {
        // Mound of dirt
        g.beginFill(0x3E2723); g.drawEllipse(0, 0, 25, 12); g.endFill();
        g.beginFill(0x5D4037); g.drawEllipse(0, -2, 20, 8); g.endFill();
        // Headstone placeholder?
        drawPixelRect(g, 0x757575, -10, -20, 20, 20);
    },
    shovel_ground: (g: Graphics) => {
        // Handle
        g.beginFill(0x8D6E63);
        g.moveTo(-10, -10); g.lineTo(10, 10);
        g.lineTo(12, 8); g.lineTo(-8, -12);
        g.endFill();
        // Spade
        g.beginFill(0x9E9E9E);
        g.drawRect(8, 8, 6, 8);
        g.endFill();
    },
    footprints: (g: Graphics) => {
        g.beginFill(0x3E2723, 0.5);
        g.drawEllipse(-5, 0, 3, 6);
        g.drawEllipse(5, -10, 3, 6);
        g.endFill();
    },
    blood_knife: (g: Graphics) => {
        // Blade
        drawPixelRect(g, 0xE0E0E0, -8, -2, 16, 4);
        // Handle
        drawPixelRect(g, 0x212121, -12, -2, 4, 4);
        // Blood tip
        drawPixelRect(g, 0xB71C1C, 4, -2, 4, 4);
    },
    dropped_phone: (g: Graphics) => {
        drawPixelRect(g, 0x212121, -4, -6, 8, 12); // Body
        drawPixelRect(g, 0x424242, -3, -5, 6, 10); // Screen
        drawPixelRect(g, 0x03A9F4, -2, -2, 4, 2); // Notification light
    },

    // --- PARK / LEISURE ---
    picnic_blanket: (g: Graphics) => {
        drawPatternRect(g, 0xFFCDD2, 0xD32F2F, 'plaid', -20, -15, 40, 30);
    },
    picnic_basket: (g: Graphics) => {
        drawPixelRect(g, 0x8D6E63, -8, -8, 16, 12); // Box
        g.lineStyle(2, 0x5D4037); g.moveTo(-8, -8); g.bezierCurveTo(-8, -16, 8, -16, 8, -8); g.lineStyle(0); // Handle
    },
    bench: (g: Graphics) => {
        drawPixelRect(g, 0x5D4037, -15, -5, 30, 10); // Seat
        drawPixelRect(g, 0x3E2723, -15, -15, 30, 5); // Back
        drawPixelRect(g, 0x212121, -14, 0, 2, 8); // Leg L
        drawPixelRect(g, 0x212121, 12, 0, 2, 8); // Leg R
    },
    trashcan: (g: Graphics) => {
        drawPixelRect(g, 0x2E7D32, -8, -16, 16, 16); // Bin
        drawPixelRect(g, 0x1B5E20, -9, -16, 18, 2); // Rim
        drawPixelRect(g, 0x1B5E20, -6, -12, 12, 10); // Detail
    },
    lamppost: (g: Graphics) => {
        drawPixelRect(g, 0x212121, -2, -40, 4, 40); // Pole
        drawPixelCircle(g, 0xFFEB3B, 0, -42, 6); // Light
    },

    // --- VENDOR ---
    ice_cream_cart: (g: Graphics) => {
        drawPixelRect(g, 0xFFFFFF, -15, -15, 30, 20); // Body
        drawPatternRect(g, 0xFFFFFF, 0xF44336, 'stripes_horz', -16, -25, 32, 10); // Awning
        drawPixelCircle(g, 0x212121, -10, 5, 6); // Wheel L
        drawPixelCircle(g, 0x212121, 10, 5, 6); // Wheel R
    },
    balloon_stand: (g: Graphics) => {
        drawPixelRect(g, 0x212121, -1, -30, 2, 30); // Pole
        drawPixelCircle(g, 0xF44336, -5, -35, 6);
        drawPixelCircle(g, 0x2196F3, 5, -35, 6);
        drawPixelCircle(g, 0xFFEB3B, 0, -42, 6);
    },
    ice_cream_stain: (g: Graphics) => {
        g.beginFill(0xF8BBD0, 0.8);
        g.drawCircle(0, 0, 6);
        g.drawCircle(4, 2, 4);
        g.drawCircle(-3, 3, 3);
        g.endFill();
        // Cone
        g.beginFill(0xFFCC80);
        g.moveTo(0, 0); g.lineTo(8, 8); g.lineTo(2, 10);
        g.endFill();
    },
    doll: (g: Graphics) => {
        drawPixelCircle(g, 0xFFCDD2, 0, -8, 4); // Head
        drawPixelRect(g, 0xAB47BC, -3, -4, 6, 8); // Dress
    },

    // --- GYM ---
    pullup_bar: (g: Graphics) => {
        drawPixelRect(g, 0x9E9E9E, -15, -30, 2, 30); // Post L
        drawPixelRect(g, 0x9E9E9E, 15, -30, 2, 30); // Post R
        drawPixelRect(g, 0xE0E0E0, -15, -28, 32, 2); // Bar
    },
    mud_patch: (g: Graphics) => {
        g.beginFill(0x5D4037, 0.8);
        g.drawEllipse(0, 0, 12, 6);
        g.drawEllipse(8, 2, 8, 4);
        g.endFill();
    },

      // --- NEW: CRIME SCENE ASSETS ---
    chalk_mark: (g: Graphics) => {
        g.lineStyle(2, 0xFFFFFF, 0.8);
        // Rough body outline
        g.drawEllipse(0, -20, 8, 8); // Head
        g.drawRoundedRect(-10, -10, 20, 25, 5); // Torso
        g.moveTo(-8, 15); g.lineTo(-12, 35); // Leg L
        g.moveTo(8, 15); g.lineTo(12, 35); // Leg R
        g.moveTo(-10, -5); g.lineTo(-20, 5); // Arm L
        g.moveTo(10, -5); g.lineTo(20, 0); // Arm R
        g.lineStyle(0);
    },
    blood_stain: (g: Graphics) => {
        g.beginFill(0xB71C1C, 0.9); // Dark Red
        g.drawCircle(0, 0, 8);
        g.drawCircle(6, 4, 5);
        g.drawCircle(-5, 6, 4);
        g.drawCircle(2, -5, 3);
        g.endFill();
    },

    // --- NEW: RED HERRINGS (Visual Rhymes) ---
    ketchup_stain: (g: Graphics) => {
        g.beginFill(0xFF0000, 0.9); // Bright Red
        g.drawCircle(0, 0, 8);
        g.drawCircle(4, 4, 6); // Smoother, rounder than blood
        g.endFill();
    },
    hotdog_wrapper: (g: Graphics) => {
        drawPixelRect(g, 0xFFFFFF, -6, -4, 12, 8); // Paper
        drawPixelRect(g, 0xFFEB3B, -4, -2, 8, 4); // Mustard stain
    },
    paint_splat: (g: Graphics) => {
        g.beginFill(0xF44336, 0.9); // Red Paint
        g.drawCircle(0, 0, 6);
        g.drawCircle(8, 0, 2); // Droplets (Splatter look)
        g.drawCircle(-8, 2, 2);
        g.drawCircle(0, 8, 2);
        g.endFill();
    },
    paint_brush: (g: Graphics) => {
        drawPixelRect(g, 0x8D6E63, -2, -10, 4, 14); // Handle
        drawPixelRect(g, 0x212121, -2, 4, 4, 2); // Ferrule
        drawPixelRect(g, 0xF44336, -3, 6, 6, 4); // Red Tip
    },
    toy_gun: (g: Graphics) => {
        drawPixelRect(g, 0x212121, -6, -4, 12, 6); // Body
        drawPixelRect(g, 0x212121, -4, 2, 4, 4); // Handle
        drawPixelRect(g, 0xFF6D00, 6, -4, 2, 4); // ORANGE TIP (The tell)
    },

    // --- NEW: AMBIGUOUS PROPS ---
    freshly_dug_hole: (g: Graphics) => {
        g.beginFill(0x3E2723); g.drawEllipse(15, 0, 15, 10); g.endFill(); // Dirt Pile
        g.beginFill(0x1B0000); g.drawRect(-20, -5, 20, 10); g.endFill(); // The Hole
    },
    discarded_backpack: (g: Graphics) => {
        drawPixelRect(g, 0x0D47A1, -10, -12, 20, 18); // Main body (Blue)
        drawPixelRect(g, 0x001F5A, -8, -2, 16, 8); // Pocket
        drawPixelRect(g, 0x212121, -2, -16, 4, 4); // Handle
    },
    gardening_trowel: (g: Graphics) => {
        g.beginFill(0x9E9E9E); // Metal spade
        g.moveTo(0, 0); g.lineTo(-4, 8); g.lineTo(4, 8); g.closePath();
        g.endFill();
        drawPixelRect(g, 0x8D6E63, -1, -10, 2, 10); // Handle
    },
    single_shoe: (g: Graphics) => {
        drawPixelRect(g, 0xFFFFFF, -6, 0, 12, 4); // Sole
        drawPixelRect(g, 0xD32F2F, -6, -5, 10, 5); // Body (Red)
        drawPixelRect(g, 0xFFFFFF, -4, -2, 8, 2); // Laces area
    },
    locked_cooler: (g: Graphics) => {
        drawPixelRect(g, 0x2196F3, -12, -10, 24, 16); // Blue Body
        drawPixelRect(g, 0xFFFFFF, -13, -12, 26, 4); // White Lid
        drawPixelRect(g, 0x616161, -2, -8, 4, 4); // Latch/Lock
    },

    // --- NEW: FLAVOR PROPS FOR VIGNETTES ---
    sapling_tree: (g: Graphics) => {
        drawPixelRect(g, 0x8D6E63, -1, -15, 2, 15); // Thin Trunk
        g.beginFill(0x4CAF50); g.drawCircle(0, -18, 5); g.endFill(); // Small leaf bunch
    },
    textbook: (g: Graphics) => {
        drawPixelRect(g, 0x004D40, -5, -8, 10, 12); // Green Cover
        drawPixelRect(g, 0xFFFFFF, 5, -7, 2, 10); // Pages
    },
    apple_core: (g: Graphics) => {
        drawPixelCircle(g, 0xFFFDE7, 0, 0, 3); // Core
        drawPixelRect(g, 0xCFD8DC, 0, -5, 1, 2); // Stem
    },
    torn_cloth: (g: Graphics) => {
        drawPatternRect(g, 0x42A5F5, 0x1E88E5, 'noise', -4, -4, 8, 8);
    },

    // --- NEW: FLAVOR PROPS for Vignette Expansion ---
    dog_leash: (g: Graphics) => {
        g.lineStyle(2, 0x5D4037);
        g.drawCircle(0, 0, 6);
        g.moveTo(6, 0);
        g.lineTo(12, 0);
        g.lineStyle(0);
        drawPixelRect(g, 0x9E9E9E, 12, -2, 2, 4); // Clasp
    },
    newspaper: (g: Graphics) => {
        drawPixelRect(g, 0xFFFFFF, -8, -5, 16, 10); // Paper
        g.beginFill(0xBDBDBD); // Text lines
        g.drawRect(-6, -3, 12, 1);
        g.drawRect(-6, 0, 10, 1);
        g.drawRect(-6, 3, 12, 1);
        g.endFill();
    },
    soda_can: (g: Graphics) => {
        drawPixelRect(g, 0x9E9E9E, -3, -5, 6, 10); // Can body
        drawPixelRect(g, 0xD32F2F, -3, -5, 6, 4); // Red label part
    },
    coffee_cup: (g: Graphics) => {
        drawPixelRect(g, 0xFFFFFF, -3, -5, 6, 10); // Cup body
        drawPixelRect(g, 0x3E2723, -4, -6, 8, 2); // Lid
    },

    // --- NEW: MISSING PAINTERS (PATCHED) ---
    pile_trash: (g: Graphics) => {
        drawPixelRect(g, 0x424242, -10, -5, 20, 10); // Bag
        drawPixelRect(g, 0xFFEB3B, -5, -8, 4, 4); // Wrapper
        drawPixelRect(g, 0xFFFFFF, 2, -6, 6, 6); // Paper
    },
    item_wallet: (g: Graphics) => {
        drawPixelRect(g, 0x3E2723, -4, -3, 8, 6); // Leather body
        drawPixelRect(g, 0xFFD700, 0, -1, 2, 2); // Gold clasp
    },
    clue_generic: (g: Graphics) => {
        g.lineStyle(2, 0xFFEB3B); g.drawCircle(0, 0, 10); g.lineStyle(0); // Yellow circle
        g.beginFill(0xFFEB3B, 0.5); g.drawCircle(0, 0, 10); g.endFill();
        drawPixelRect(g, 0x000000, -2, -5, 4, 10); // Question mark ish
        drawPixelRect(g, 0x000000, -2, 6, 4, 2);
    },
    
};

