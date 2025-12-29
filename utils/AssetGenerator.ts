import { Application, Graphics, Texture } from 'pixi.js';

export type AssetType = 
  | 'tree' | 'bush' | 'bench' | 'lamppost' | 'trashcan' | 'fountain'
  | 'ice_cream_cart' | 'balloon_stand' | 'picnic_blanket' | 'picnic_basket'
  | 'pullup_bar' | 'fresh_grave' | 'casket_open' | 'shovel_ground'
  | string; 

// --- COLOR PALETTES ---
const SKINS = [0xFFCCBC, 0x8D6E63, 0xFFE0B2, 0x5D4037, 0xFFF9C4]; // Added Pale
const HAIR_COLORS = [0x000000, 0x5D4037, 0xFFEB3B, 0xE0E0E0, 0xD84315, 0x9E9E9E, 0x7B1FA2]; // Added Purple
const NEONS = [0x76FF03, 0x00E5FF, 0xF50057, 0xFFEA00];

// --- GRID HELPERS ---
const drawPixelRect = (g: Graphics, color: number, x: number, y: number, w: number, h: number, alpha = 1) => {
  g.beginFill(color, alpha);
  g.drawRect(x, y, w, h);
  g.endFill();
};

const drawPixelCircle = (g: Graphics, color: number, cx: number, cy: number, r: number) => {
  g.beginFill(color);
  g.drawRect(cx - r + 2, cy - r, (r * 2) - 4, r * 2);
  g.drawRect(cx - r, cy - r + 2, r * 2, (r * 2) - 4);
  g.endFill();
};

// --- NEW: PATTERN ENGINE ---
type PatternType = 'solid' | 'stripes_horz' | 'plaid' | 'noise' | 'polka';

const drawPatternRect = (g: Graphics, baseColor: number, accentColor: number, type: PatternType, x: number, y: number, w: number, h: number) => {
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

// --- MANNEQUIN CORE ---
const drawMannequin = (g: Graphics, skin: number, shirt: number, pants: number) => {
    g.beginFill(0x000000, 0.3); g.drawEllipse(16, 46, 10, 3); g.endFill(); 
    drawPixelRect(g, pants, 11, 28, 5, 16); 
    drawPixelRect(g, pants, 17, 28, 5, 16); 
    drawPixelRect(g, shirt, 9, 12, 15, 16); 
    drawPixelRect(g, skin, 10, 0, 12, 12); 
};

// Expanded Hair Styles
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

// The "Hidden" Weapon (Killer Only)
const drawHiddenWeapon = (g: Graphics, type: 'knife' | 'gun') => {
    if (type === 'knife') {
        // Handle sticking out of pocket/belt
        drawPixelRect(g, 0x3E2723, 22, 26, 2, 4); 
        // Tiny Blood Drop on Shoe (The Tell)
        drawPixelRect(g, 0xB71C1C, 11, 42, 2, 2); 
    } else {
        // Gun bulge / Handle inside jacket
        drawPixelRect(g, 0x424242, 20, 20, 4, 4);
        // Tiny Blood Drop on Hand
        drawPixelRect(g, 0xB71C1C, 24, 28, 1, 1);
    }
};

// --- ARCHETYPE PAINTERS (The New Roster) ---
const painters = {
    // 1. CLASSICS
    elder: (g: Graphics, i: number) => {
        drawMannequin(g, SKINS[i%4], 0x795548, 0x4E342E);
        drawHair(g, 2, 0xE0E0E0);
        drawPixelRect(g, 0x3E2723, 24, 18, 2, 30); drawPixelRect(g, 0x3E2723, 22, 18, 4, 2);
    },
    punk: (g: Graphics, i: number) => {
        drawMannequin(g, SKINS[i%4], 0x212121, 0x212121);
        drawHair(g, 4, NEONS[i%4]);
        drawPixelRect(g, 0x212121, 2, 20, 6, 24); drawPixelRect(g, NEONS[i%4], 3, 22, 4, 20);
    },
    suit: (g: Graphics, i: number) => {
        drawMannequin(g, SKINS[i%4], 0x263238, 0x212121);
        drawPixelRect(g, 0xC62828, 15, 14, 3, 10); drawHair(g, 1, HAIR_COLORS[i%6]); drawPixelRect(g, 0x3E2723, 24, 24, 4, 10); 
    },


    // 2. SCENARIO: Q1 JOY
    clown: (g: Graphics, i: number) => {
        // Polka Dot Suit
        g.beginFill(0x000000, 0.3); g.drawEllipse(16, 46, 10, 3); g.endFill();
        drawPatternRect(g, 0xFFEB3B, 0xF50057, 'polka', 11, 28, 5, 16); // Legs
        drawPatternRect(g, 0xFFEB3B, 0xF50057, 'polka', 17, 28, 5, 16); 
        drawPatternRect(g, 0xFFEB3B, 0xF50057, 'polka', 9, 12, 15, 16); // Torso
        drawPixelRect(g, 0xFFFFFF, 10, 0, 12, 12); // Face Paint
        drawPixelRect(g, 0xF50057, 15, 6, 2, 2); // Nose
        drawHair(g, 7, 0xF50057); // Red Wig
    },
    kid_balloon: (g: Graphics, i: number) => {
        // Short Kid
        g.beginFill(0x000000, 0.3); g.drawEllipse(16, 46, 10, 3); g.endFill();
        drawPixelRect(g, 0x0D47A1, 11, 28, 5, 12); 
        drawPixelRect(g, 0x0D47A1, 17, 28, 5, 12); 
        drawPatternRect(g, 0xFFFFFF, 0x0D47A1, 'stripes_horz', 9, 14, 15, 14); // Striped Shirt
        drawPixelRect(g, SKINS[i%4], 10, 2, 12, 12);
        drawHair(g, 5, 0xF50057); // Cap
        // Balloon
        drawPixelRect(g, 0xFFFFFF, 24, -10, 1, 34); // String
        drawPixelCircle(g, NEONS[i%4], 24, -14, 6); // Balloon
    },

    // 3. SCENARIO: Q2 LEISURE
    hipster: (g: Graphics, i: number) => {
        drawMannequin(g, SKINS[i%4], 0x000000, 0x1A237E); // Placeholder torso color
        drawPatternRect(g, 0xB71C1C, 0x212121, 'plaid', 9, 12, 15, 16); // Flannel
        drawHair(g, 6, 0x424242); // Beanie
        drawPixelRect(g, 0x5D4037, 10, 8, 12, 4); // Beard
        drawPixelRect(g, 0xFFFFFF, 24, 20, 4, 6); // Coffee Cup
    },
    guitarist: (g: Graphics, i: number) => {
        drawMannequin(g, SKINS[i%4], 0x212121, 0x424242);
        drawHair(g, 3, 0x000000); // Long hair
        // Guitar Case on Back
        drawPixelRect(g, 0x3E2723, 11, 14, 10, 20); 
        drawPixelRect(g, 0x5D4037, 14, 10, 4, 4); // Neck
    },

    // 4. SCENARIO: Q3 GYM
    bodybuilder: (g: Graphics, i: number) => {
        g.beginFill(0x000000, 0.3); g.drawEllipse(16, 46, 10, 3); g.endFill();
        drawPixelRect(g, 0x212121, 11, 28, 5, 16); // Legs
        drawPixelRect(g, 0x212121, 17, 28, 5, 16); 
        // Swole Arms (Skin)
        drawPixelRect(g, SKINS[i%4], 7, 12, 4, 14); 
        drawPixelRect(g, SKINS[i%4], 22, 12, 4, 14);
        drawPixelRect(g, 0x9E9E9E, 9, 12, 15, 16); // Tank Top
        drawPixelRect(g, SKINS[i%4], 10, 0, 12, 12);
        drawHair(g, 0, 0); // Bald
    },
    cyclist: (g: Graphics, i: number) => {
        const color = NEONS[i%4];
        drawMannequin(g, SKINS[i%4], color, 0x212121);
        drawPatternRect(g, color, 0xFFFFFF, 'stripes_horz', 9, 12, 15, 16); // Jersey
        drawHair(g, 1, 0x000000);
        drawPixelRect(g, 0x424242, 9, -2, 14, 6); // Helmet
        drawPixelRect(g, 0x212121, 10, 4, 12, 2); // Visor shades
    },

    // 5. GLOBAL
    tourist: (g: Graphics, i: number) => {
        drawMannequin(g, SKINS[i%4], 0xFFFFFF, 0xD7CCC8);
        drawPatternRect(g, 0xFF5722, 0xFFEB3B, 'noise', 9, 12, 15, 16); // Hawaiian Shirt
        drawPixelRect(g, 0xFFFFFF, 8, -4, 16, 4); // Sun Hat Brim
        drawPixelRect(g, 0xFFFFFF, 10, -6, 12, 4); // Sun Hat Top
        drawPixelRect(g, 0x212121, 13, 18, 6, 4); // Camera
        drawPixelRect(g, 0x212121, 12, 16, 1, 6); // Strap L
        drawPixelRect(g, 0x212121, 19, 16, 1, 6); // Strap R
    },
    goth: (g: Graphics, i: number) => {
        drawMannequin(g, 0xFFF9C4, 0x000000, 0x000000); // Pale Skin
        drawPatternRect(g, 0x000000, 0x424242, 'plaid', 11, 28, 5, 16); // Fishnets/Plaid
        drawPatternRect(g, 0x000000, 0x424242, 'plaid', 17, 28, 5, 16);
        drawHair(g, 3, 0x000000); // Long Black
        drawPixelRect(g, 0x000000, 10, 4, 12, 1); // Eye liner
    },

    // --- NEW: THE RED HERRINGS ---
    // 1. THE ARTIST (False Positive: Red Paint)
    artist: (g: Graphics, i: number) => {
        drawMannequin(g, 0xFFE0B2, 0xFFFFFF, 0x8D6E63); // White Smock
        drawHair(g, 6, 0x212121); // Beret-ish
        // Red Paint Splotches (Too big to be the killer's subtle stain)
        drawPixelRect(g, 0xF44336, 12, 16, 4, 4); 
        drawPixelRect(g, 0xF44336, 18, 22, 3, 5);
        // Holding Brush
        drawPixelRect(g, 0x8D6E63, 24, 22, 2, 8); 
        drawPixelRect(g, 0xF44336, 24, 20, 2, 2); // Red Tip
    },

    // 2. THE GARDENER (False Positive: Weapon-like Tool)
    gardener: (g: Graphics, i: number) => {
        drawMannequin(g, 0x8D6E63, 0x33691E, 0x1B5E20); // Green Overalls
        drawHair(g, 5, 0x33691E); // Cap
        // Hedge Shears (Look scary but fit context)
        drawPixelRect(g, 0x9E9E9E, 22, 20, 2, 12); // Blade 1
        drawPixelRect(g, 0x9E9E9E, 25, 20, 2, 12); // Blade 2
        drawPixelRect(g, 0x3E2723, 22, 32, 5, 4); // Handles
    },

    // 3. THE COMMUTER (False Positive: Gun-like Umbrella)
    commuter: (g: Graphics, i: number) => {
        drawMannequin(g, 0xFFCCBC, 0x455A64, 0x263238); // Grey Coat
        drawHair(g, 1, 0x000000);
        // Black Umbrella on Back (Diagonal)
        // Looks like a rifle from a distance
        g.beginFill(0x000000);
        g.moveTo(10, 14); g.lineTo(24, 30); // Shaft
        g.lineTo(26, 28); g.lineTo(12, 12);
        g.endFill();
        drawPixelRect(g, 0x000000, 24, 30, 4, 2); // Handle curve
    },

    // 4. THE GLUTTON (False Positive: Ketchup Stain)
    glutton: (g: Graphics, i: number) => {
        drawMannequin(g, 0xFFE0B2, 0xFFFFFF, 0x0277BD); // White Shirt
        // Mustard/Ketchup Stain
        drawPixelRect(g, 0xFFEB3B, 14, 18, 2, 2);
        drawPixelRect(g, 0xB71C1C, 16, 16, 3, 3); // The red blotch
        drawHair(g, 0, 0); // Bald
        // Holding Hot Dog
        drawPixelRect(g, 0xF57F17, 24, 22, 4, 8); // Bun
        drawPixelRect(g, 0xB71C1C, 25, 22, 2, 8); // Sausage
    }
};

export const generateGameTextures = (app: Application): Record<string, Texture> => {
  const textures: Record<string, Texture> = {};

  const generate = (name: string, drawFn: (g: Graphics) => void) => {
    const g = new Graphics();
    drawFn(g);
    textures[name] = app.renderer.generateTexture({ target: g, resolution: 2 });
  };

  // --- STANDARD ASSETS (Props) ---
  // (Copying previous environment generators for brevity - Tree, Bush, Bench, Lamp, Trash, Fountain)
  generate('tree', (g) => { drawPixelRect(g, 0x3E2723, 12, 40, 16, 40); drawPixelCircle(g, 0x1B5E20, 20, 20, 24); drawPixelCircle(g, 0x2E7D32, 10, 30, 20); drawPixelCircle(g, 0x388E3C, 30, 30, 20); });
  generate('bush', (g) => { drawPixelCircle(g, 0x2E7D32, 16, 16, 16); drawPixelCircle(g, 0x4CAF50, 24, 16, 12); drawPixelCircle(g, 0x388E3C, 8, 16, 12); });
  generate('bench', (g) => { drawPixelRect(g, 0x424242, 0, 15, 6, 15); drawPixelRect(g, 0x424242, 44, 15, 6, 15); drawPixelRect(g, 0x8D6E63, -2, 12, 54, 8); drawPixelRect(g, 0x6D4C41, -2, 2, 54, 10); });
  generate('lamppost', (g) => { drawPixelRect(g, 0x212121, 10, 10, 4, 80); drawPixelCircle(g, 0xFFEB3B, 12, 12, 8); });
  generate('trashcan', (g) => { drawPixelRect(g, 0x37474F, 0, 0, 24, 32); drawPixelRect(g, 0x263238, 0, 0, 24, 6); drawPixelRect(g, 0xFFFFFF, 6, 2, 4, 4); });
  generate('fountain', (g) => { drawPixelCircle(g, 0x78909C, 32, 32, 32); drawPixelCircle(g, 0x4FC3F7, 32, 32, 26); drawPixelRect(g, 0xFFFFFF, 30, 20, 4, 12); });
  
  // Scenarios
  generate('ice_cream_cart', (g) => { drawPixelCircle(g, 0x212121, 10, 36, 6); drawPixelCircle(g, 0x212121, 40, 36, 6); drawPixelRect(g, 0xFFFFFF, 0, 16, 50, 20); drawPixelRect(g, 0xF48FB1, 0, 20, 50, 4); drawPixelRect(g, 0xCCCCCC, 22, -10, 4, 26); g.beginFill(0xF48FB1); g.moveTo(24, -10); g.arc(24, -10, 24, Math.PI, 0); g.lineTo(24, -10); g.endFill(); g.beginFill(0xFFFFFF); g.moveTo(24, -10); g.arc(24, -10, 10, Math.PI, 0); g.lineTo(24, -10); g.endFill(); });
  generate('balloon_stand', (g) => { drawPixelRect(g, 0x5D4037, 10, 10, 20, 20); drawPixelRect(g, 0xFFFFFF, 19, 0, 2, 10); drawPixelCircle(g, 0xFF0000, 15, 0, 6); drawPixelCircle(g, 0x0000FF, 25, -5, 6); drawPixelCircle(g, 0x00FF00, 20, -8, 6); });
  generate('picnic_blanket', (g) => { drawPixelRect(g, 0xFFEBEE, 0, 0, 48, 32); drawPixelRect(g, 0xE57373, 0, 0, 12, 12); drawPixelRect(g, 0xE57373, 24, 0, 12, 12); drawPixelRect(g, 0xE57373, 12, 12, 12, 12); drawPixelRect(g, 0xE57373, 36, 12, 12, 12); });
  generate('picnic_basket', (g) => { drawPixelRect(g, 0x8D6E63, 0, 5, 16, 10); drawPixelRect(g, 0x5D4037, 6, 0, 4, 6); });
  generate('pullup_bar', (g) => { drawPixelRect(g, 0x90A4AE, 0, 0, 4, 40); drawPixelRect(g, 0x90A4AE, 40, 0, 4, 40); drawPixelRect(g, 0xCFD8DC, 0, 2, 44, 4); });
  generate('fresh_grave', (g) => { drawPixelRect(g, 0x3E2723, 0, 0, 40, 20); drawPixelRect(g, 0x5D4037, -5, -5, 10, 10); drawPixelRect(g, 0x5D4037, 35, 15, 12, 8); });
  generate('casket_open', (g) => { drawPixelRect(g, 0x4E342E, 0, 0, 20, 48); drawPixelRect(g, 0x3E2723, 2, 2, 16, 44); drawPixelRect(g, 0xFFCCBC, 6, 6, 8, 8); drawPixelRect(g, 0xE0E0E0, 4, 14, 12, 30); });
  generate('shovel_ground', (g) => { drawPixelRect(g, 0x9E9E9E, 4, 0, 4, 8); drawPixelRect(g, 0x8D6E63, 5, -16, 2, 16); drawPixelRect(g, 0x8D6E63, 3, -18, 6, 2); });
  generate('blood_stain', (g) => { drawPixelRect(g, 0x880000, 10, 10, 12, 8); drawPixelRect(g, 0x880000, 14, 8, 4, 12); });
  generate('footprints', (g) => { drawPixelRect(g, 0x880000, 10, 10, 4, 8, 0.7); drawPixelRect(g, 0x880000, 18, 20, 4, 8, 0.5); });
  generate('dropped_phone', (g) => { drawPixelRect(g, 0x212121, 12, 12, 6, 10); drawPixelRect(g, 0x00E676, 13, 13, 4, 6); });
  generate('doll', (g) => { drawPixelRect(g, 0xFFCCBC, 8, 4, 8, 8); drawPixelRect(g, 0xF48FB1, 6, 12, 12, 14); });


  // --- CHARACTER LOOP (Including ALL New Types) ---
  const archetypes = [
      { key: 'human_elder', count: 3, fn: painters.elder },
      { key: 'human_punk', count: 3, fn: painters.punk },
      { key: 'human_suit', count: 3, fn: painters.suit },
      { key: 'clown', count: 1, fn: painters.clown }, // Rare
      { key: 'kid_balloon', count: 3, fn: painters.kid_balloon },
      { key: 'hipster', count: 3, fn: painters.hipster },
      { key: 'guitarist', count: 2, fn: painters.guitarist },
      { key: 'bodybuilder', count: 3, fn: painters.bodybuilder },
      { key: 'cyclist', count: 3, fn: painters.cyclist },
      { key: 'tourist', count: 3, fn: painters.tourist },
      { key: 'goth', count: 3, fn: painters.goth },
       // NEW ONES:
      { key: 'artist', count: 3, fn: painters.artist },
      { key: 'gardener', count: 3, fn: painters.gardener },
      { key: 'commuter', count: 3, fn: painters.commuter },
      { key: 'glutton', count: 3, fn: painters.glutton },
  ];

  archetypes.forEach(({ key, count, fn }) => {
      for (let i = 0; i < count; i++) {
          const baseName = `${key}_${i}`;
          // 1. Innocent Version
          generate(baseName, (g) => fn(g, i));

          // 2. KILLER VERSIONS (Subtle)
          // The Killer mimics the archetype perfectly, BUT has the "Hidden Weapon" and "Blood Drop"
          // We do NOT use the old `drawWeapon` (Giant Knife). We use `drawHiddenWeapon`.
          
          generate(`killer_${baseName}_knife`, (g) => { 
              fn(g, i); 
              drawHiddenWeapon(g, 'knife'); 
          });
          generate(`killer_${baseName}_gun`, (g) => { 
              fn(g, i); 
              drawHiddenWeapon(g, 'gun'); 
          });
      }
  });

  return textures;
};