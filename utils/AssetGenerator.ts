// --- FILE: utils/AssetGenerator.ts ---

import { Texture, Application, Graphics } from 'pixi.js';

export type AssetType = 
  | 'tree' | 'bush' | 'bench' | 'lamppost' | 'trashcan' | 'fountain'
  | 'ice_cream_cart' | 'balloon_stand' | 'picnic_blanket' | 'picnic_basket'
  | 'pullup_bar' | 'fresh_grave' | 'casket_open' | 'shovel_ground'
  | 'ice_cream_stain' | 'chalk_mark' | 'mud_patch'
  | 'blood_gun' | 'blood_knife' 
  | 'pile_trash' | 'pile_leaves'
  | 'clue_paint' | 'clue_wrapper' | 'clue_shears' | 'clue_shaker' | 'clue_pick' | 'clue_ticket'
  | 'device_part'
  | 'item_wallet' | 'item_receipt' | 'item_glass' | 'flower_patch'
  | string; 


// --- EXPORTED HELPERS ---

export const drawPixelRect = (g: Graphics, color: number, x: number, y: number, w: number, h: number, alpha = 1) => {
  g.beginFill(color, alpha);
  g.drawRect(x, y, w, h);
  g.endFill();
};

export const drawPixelCircle = (g: Graphics, color: number, cx: number, cy: number, r: number) => {
  g.beginFill(color);
  g.drawRect(cx - r + 2, cy - r, (r * 2) - 4, r * 2);
  g.drawRect(cx - r, cy - r + 2, r * 2, (r * 2) - 4);
  g.endFill();
};

type PatternType = 'solid' | 'stripes_horz' | 'plaid' | 'noise' | 'polka';

export const drawPatternRect = (g: Graphics, baseColor: number, accentColor: number, type: PatternType, x: number, y: number, w: number, h: number) => {
    // 1. Draw Base
    drawPixelRect(g, baseColor, x, y, w, h);
    
    if (type === 'solid') return;

    g.beginFill(accentColor);
    // 2. Draw Accent Pixels
    for(let px = x; px < x + w; px+=2) { // Resolution 2 for retro feel
        for(let py = y; py < y + h; py+=2) {
            let draw = false;
            
            if (type === 'stripes_horz') {
                if (((py - y) / 2) % 2 === 0) draw = true;
            } else if (type === 'plaid') {
                const col = ((px - x) / 2) % 2;
                const row = ((py - y) / 2) % 2;
                if ((col + row) % 2 === 0) draw = true;
            } else if (type === 'noise') {
                if (Math.random() > 0.7) draw = true;
            } else if (type === 'polka') {
                 if (((px - x) % 8 === 0) && ((py - y) % 8 === 0)) draw = true;
            }

            if (draw) g.drawRect(px, py, 2, 2);
        }
    }
    g.endFill();
};

// 1. Flashlight Texture (Canvas Approach)
const createFlashlightTexture = (app: Application): Texture => {
    const canvas = document.createElement('canvas');
    const size = 2400; 
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not create canvas context');

    // Fill Black
    ctx.fillStyle = '#020617'; 
    ctx.fillRect(0, 0, size, size);

    // Cut Hole
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 250; 

    ctx.globalCompositeOperation = 'destination-out';
    const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    return Texture.from(canvas);
};

// 2. Rain Texture (UPDATED: Canvas Approach - Crash Proof)
const createRainTexture = (app: Application): Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 4;   // Slightly wider for visibility
    canvas.height = 20; // Longer streak
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        ctx.fillStyle = 'rgba(165, 243, 252, 0.4)'; // Cyan-200, transparent
        ctx.fillRect(0, 0, 4, 20);
    }
    
    return Texture.from(canvas);
};


// For modularity, I will export a new function `generateAtmosphereAssets`.

// 3. Main Export
export const generateAtmosphereAssets = (app: Application) => {
    return {
        flashlight: createFlashlightTexture(app),
        rain: createRainTexture(app)
    };
};

export const drawHiddenWeapon = (g: Graphics, type: 'knife' | 'gun') => {
    if (type === 'knife') {
        drawPixelRect(g, 0x3E2723, 22, 26, 2, 4); 
        drawPixelRect(g, 0xB71C1C, 11, 42, 2, 2); 
    } else {
        drawPixelRect(g, 0x424242, 20, 20, 4, 4);
        drawPixelRect(g, 0xB71C1C, 24, 28, 1, 1);
    }
};

export const forensicPainters = {
    // COVER OBJECTS
    pile_trash: (g: Graphics) => {
        drawPixelCircle(g, 0x757575, 16, 16, 16); 
        drawPixelRect(g, 0xEEEEEE, 10, 8, 8, 10); 
        drawPixelRect(g, 0x212121, 18, 14, 8, 8); 
        drawPixelRect(g, 0x8D6E63, 12, 20, 8, 6); 
    },
    pile_leaves: (g: Graphics) => {
        drawPixelCircle(g, 0x5D4037, 16, 16, 16); 
        drawPixelRect(g, 0xFF5722, 6, 10, 8, 6);  
        drawPixelRect(g, 0xFFC107, 20, 8, 8, 6);  
        drawPixelRect(g, 0x8D6E63, 16, 22, 6, 6); 
        drawPixelRect(g, 0xFF5722, 24, 18, 6, 6); 
    },

    flower_patch: (g: Graphics) => {
    const colors = [0xFF4081, 0xFFEB3B, 0x7C4DFF, 0xFFFFFF]; 
    for(let i=0; i<6; i++) {
        const cx = 8 + Math.random() * 16;
        const cy = 8 + Math.random() * 16;
        const color = colors[Math.floor(Math.random() * colors.length)];
        drawPixelRect(g, 0x4CAF50, cx, cy+2, 2, 4);
        drawPixelRect(g, color, cx-2, cy, 6, 2);
        drawPixelRect(g, color, cx, cy-2, 2, 6);
        drawPixelRect(g, 0xFFFFFF, cx, cy, 2, 2);
        }
    },

    // CLUES
    clue_paint: (g: Graphics) => { 
        drawPixelRect(g, 0xE0E0E0, 12, 12, 8, 4); 
        drawPixelRect(g, 0x212121, 20, 13, 2, 2); 
        drawPixelRect(g, 0xF44336, 10, 12, 2, 2); 
    },
    clue_wrapper: (g: Graphics) => { 
        drawPixelRect(g, 0xFFEB3B, 10, 10, 12, 8); 
        drawPixelRect(g, 0xB71C1C, 12, 12, 4, 4); 
    },
    clue_shears: (g: Graphics) => { 
        drawPixelRect(g, 0x9E9E9E, 10, 10, 12, 2); 
        drawPixelRect(g, 0x3E2723, 10, 12, 4, 4); 
    },
    clue_shaker: (g: Graphics) => { 
        drawPixelRect(g, 0x90A4AE, 12, 8, 6, 14); 
        drawPixelRect(g, 0x263238, 12, 6, 6, 2); 
    },
    clue_pick: (g: Graphics) => { 
        g.beginFill(0xD81B60);
        g.moveTo(16, 20); g.lineTo(10, 10); g.lineTo(22, 10);
        g.endFill();
    },
    clue_ticket: (g: Graphics) => { 
        drawPixelRect(g, 0xFFFFFF, 10, 12, 14, 6);
        drawPixelRect(g, 0x000000, 12, 14, 10, 1); 
    },
    item_wallet: (g: Graphics) => {
        drawPixelRect(g, 0x5D4037, 8, 12, 16, 10); 
        drawPixelRect(g, 0x4E342E, 8, 12, 16, 2);  
        drawPixelRect(g, 0xFFD700, 20, 16, 2, 2);  
    },
    item_receipt: (g: Graphics) => {
        drawPixelRect(g, 0xFFFFFF, 12, 8, 8, 16); 
        drawPixelRect(g, 0xBDBDBD, 14, 10, 4, 1);
        drawPixelRect(g, 0xBDBDBD, 14, 13, 3, 1);
        drawPixelRect(g, 0xBDBDBD, 14, 16, 4, 1);
        drawPixelRect(g, 0xBDBDBD, 14, 19, 2, 1);
    },
    item_glass: (g: Graphics) => {
        g.beginFill(0x81D4FA, 0.6); 
        g.moveTo(10, 22); g.lineTo(14, 10); g.lineTo(18, 22); 
        g.moveTo(22, 24); g.lineTo(28, 14); g.lineTo(26, 26); 
        g.drawRect(16, 24, 4, 4); 
        g.endFill();
    },

    // --- DEVICE PART (BOMB COMPONENT) ---
    device_part: (g: Graphics) => {
        drawPixelRect(g, 0x1B5E20, 8, 8, 16, 16); 
        drawPixelRect(g, 0x2E7D32, 10, 10, 12, 12); 
        drawPixelRect(g, 0x212121, 12, 12, 8, 8); 
        drawPixelRect(g, 0xBDBDBD, 11, 12, 1, 2); 
        drawPixelRect(g, 0xBDBDBD, 11, 16, 1, 2); 
        drawPixelRect(g, 0xD50000, 20, 20, 4, 4); 
        drawPixelRect(g, 0xFF1744, 21, 21, 2, 2); 
        drawPixelRect(g, 0xFFEB3B, 8, 20, 6, 2); 
        drawPixelRect(g, 0x2962FF, 8, 22, 6, 2); 
    },  
};

// NEW: HTML5 Canvas Mugshot Generator (For UI)
export function generateMugshotDataURL(seed: string): string {
    // 1. Create offline canvas
    if (typeof document === 'undefined') return ''; // Server-side safety
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 2. Deterministic RNG based on seed string
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const pseudoRandom = () => {
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
    };

    // 3. Draw Background (Digital Noise)
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, 64, 64);
    
    // 4. Draw Face Silhouette
    // Skin Tone
    const skinTones = ['#f5d0b0', '#e0ac69', '#8d5524', '#c68642', '#ffdbac'];
    ctx.fillStyle = skinTones[Math.floor(pseudoRandom() * skinTones.length)];
    const headWidth = 30 + (pseudoRandom() * 10);
    const headHeight = 40 + (pseudoRandom() * 10);
    ctx.fillRect(32 - headWidth/2, 32 - headHeight/2, headWidth, headHeight);

    // Eyes (Sunglasses or Eyes)
    const hasGlasses = pseudoRandom() > 0.5;
    ctx.fillStyle = hasGlasses ? '#000000' : '#ffffff';
    ctx.fillRect(32 - headWidth/2 + 5, 32 - 5, 8, 4); // Left
    ctx.fillRect(32 + headWidth/2 - 13, 32 - 5, 8, 4); // Right
    
    // Hair / Hat
    ctx.fillStyle = pseudoRandom() > 0.5 ? '#3f3f46' : '#71717a';
    ctx.fillRect(32 - headWidth/2 - 2, 32 - headHeight/2 - 5, headWidth + 4, 10);

    // 5. Scanline Overlay (Green or Red tint)
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    for(let y=0; y<64; y+=2) {
        ctx.fillRect(0, y, 64, 1);
    }

    return canvas.toDataURL();
}