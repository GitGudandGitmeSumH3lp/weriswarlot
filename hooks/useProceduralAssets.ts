import { useMemo } from 'react';
import { Graphics } from 'pixi.js';
import { painters } from '@/utils/CharacterPainters';
import { forensicPainters } from '@/utils/AssetGenerator';
import { PALETTE } from '@/data/Constants';
import { propPainters } from '@/utils/PropPainters';

// Define the Painter type
type PainterFn = (g: Graphics) => void;

export const useProceduralAssets = (app: any) => {
    
    // We combine all our "Artists" into one big Registry of Draw Functions
    const assetRegistry = useMemo(() => {
        const registry: Record<string, PainterFn> = {};

        // 1. MANUAL PAINTERS (Environment)
        registry['tree'] = (g: Graphics) => {
            g.beginFill(PALETTE.SHADOW, 0.4); g.drawEllipse(0, 40, 24, 10); g.endFill();
            g.beginFill(PALETTE.TREE_TRUNK); g.drawRect(-6, 0, 12, 40); g.endFill();
            g.beginFill(PALETTE.TREE_LEAF_DARK); g.drawCircle(0, 10, 20); g.endFill();
            g.beginFill(PALETTE.TREE_LEAF_MID); g.drawCircle(0, 0, 15); g.endFill();
        };

        registry['bush'] = (g: Graphics) => {
            g.beginFill(PALETTE.SHADOW, 0.3); g.drawEllipse(0, 10, 18, 6); g.endFill();
            g.beginFill(PALETTE.TREE_LEAF_DARK); g.drawCircle(0, 5, 12); g.endFill();
            g.beginFill(PALETTE.TREE_LEAF_MID); g.drawCircle(5, 0, 8); g.endFill();
        };

        registry['statue'] = (g: Graphics) => {
            g.beginFill(PALETTE.SHADOW, 0.4); g.drawEllipse(0, 20, 25, 8); g.endFill();
            g.beginFill(PALETTE.STONE_BASE); g.drawRect(-15, 10, 30, 10); g.endFill();
            g.beginFill(0x6c757d); g.drawRect(-10, 0, 20, 10); g.endFill();
        };

        registry['lamp'] = (g: Graphics) => {
            g.beginFill(PALETTE.SHADOW, 0.4); g.drawEllipse(0, 0, 8, 4); g.endFill();
            g.beginFill(0x212529); g.drawRect(-2, -45, 4, 45); g.endFill();
            g.beginFill(0xffaa00, 0.6); g.drawRect(-4, -43, 8, 10); g.endFill();
        };

        // 2. IMPORTED PAINTERS (Characters)
          // --- FIX: Register variants 0-5 for every character ---
        Object.entries(painters).forEach(([key, fn]) => {
            // Register Base (defaults to variant 0)
            registry[key] = (g: Graphics) => fn(g, 0);

            // Register specific Variants (e.g., suit_0, suit_1... suit_5)
            for (let i = 0; i < 6; i++) {
                registry[`${key}_${i}`] = (g: Graphics) => fn(g, i);
            }

        });

        // --- FIX: MAP DEFAULTS FOR GENERIC TYPES ---
        // If an actor is just a 'civilian', draw them as a 'suit' or 'commuter'
        if (registry['commuter']) registry['civilian'] = registry['commuter'];
        else registry['civilian'] = (g) => { g.beginFill(0xAAAAAA); g.drawRect(-5,-15,10,30); }; // Fallback

        // If an actor is a 'killer', draw them as a 'goth' or 'punk'
        if (registry['goth']) registry['killer'] = registry['goth'];

        // 3. FORENSICS
        Object.entries(forensicPainters).forEach(([key, fn]) => {
            registry[key] = fn;
        });

        // 4. NEW: PROPS (Blue Box Fix)
        Object.entries(propPainters).forEach(([key, fn]) => {
            registry[key] = fn;
        });

        // 5. ALIASES & FALLBACKS
        if (registry['commuter']) registry['civilian'] = registry['commuter'];
        else registry['civilian'] = (g) => { g.beginFill(0xAAAAAA); g.drawRect(-5,-15,10,30); };

        if (registry['goth']) registry['killer'] = registry['goth'];
        
        // Ensure 'lamp' and 'lamppost' both work
        if (registry['lamppost'] && !registry['lamp']) registry['lamp'] = registry['lamppost'];
        if (registry['lamp'] && !registry['lamppost']) registry['lamppost'] = registry['lamp'];

        registry['clue_generic'] = (g: Graphics) => {
            g.beginFill(0xFF00FF); g.drawRect(-5, -5, 10, 10); g.endFill();
        };

        return registry;
    }, []);

    return assetRegistry;
};