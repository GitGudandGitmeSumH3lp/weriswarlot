// --- FILE: utils/TextureLoader.ts ---
import { Application, Graphics, Texture } from 'pixi.js';
import { 
    painters, 
    forensicPainters, 
    drawPixelRect, 
    drawPixelCircle, 
    drawHiddenWeapon,
    drawPatternRect 
} from '@/utils/AssetGenerator'; 

export const generateGameTextures = (app: Application): Record<string, Texture> => {
  const textures: Record<string, Texture> = {};

  const generate = (name: string, drawFn: (g: Graphics) => void) => {
    const g = new Graphics();
    drawFn(g);
    textures[name] = app.renderer.generateTexture({ target: g, resolution: 2 });
  };

  // --- STANDARD ENVIRONMENT ---
  generate('tree', (g) => { drawPixelRect(g, 0x3E2723, 12, 40, 16, 40); drawPixelCircle(g, 0x1B5E20, 20, 20, 24); drawPixelCircle(g, 0x2E7D32, 10, 30, 20); drawPixelCircle(g, 0x388E3C, 30, 30, 20); });
  generate('bush', (g) => { drawPixelCircle(g, 0x2E7D32, 16, 16, 16); drawPixelCircle(g, 0x4CAF50, 24, 16, 12); drawPixelCircle(g, 0x388E3C, 8, 16, 12); });
  generate('bench', (g) => { drawPixelRect(g, 0x424242, 0, 15, 6, 15); drawPixelRect(g, 0x424242, 44, 15, 6, 15); drawPixelRect(g, 0x8D6E63, -2, 12, 54, 8); drawPixelRect(g, 0x6D4C41, -2, 2, 54, 10); });
  generate('lamppost', (g) => { drawPixelRect(g, 0x212121, 10, 10, 4, 80); drawPixelCircle(g, 0xFFEB3B, 12, 12, 8); });
  generate('trashcan', (g) => { drawPixelRect(g, 0x37474F, 0, 0, 24, 32); drawPixelRect(g, 0x263238, 0, 0, 24, 6); drawPixelRect(g, 0xFFFFFF, 6, 2, 4, 4); });
  generate('fountain', (g) => { drawPixelCircle(g, 0x78909C, 32, 32, 32); drawPixelCircle(g, 0x4FC3F7, 32, 32, 26); drawPixelRect(g, 0xFFFFFF, 30, 20, 4, 12); });
  generate('ice_cream_cart', (g) => { drawPixelCircle(g, 0x212121, 10, 36, 6); drawPixelCircle(g, 0x212121, 40, 36, 6); drawPixelRect(g, 0xFFFFFF, 0, 16, 50, 20); drawPixelRect(g, 0xF48FB1, 0, 20, 50, 4); drawPixelRect(g, 0xCCCCCC, 22, -10, 4, 26); g.beginFill(0xF48FB1); g.moveTo(24, -10); g.arc(24, -10, 24, Math.PI, 0); g.lineTo(24, -10); g.endFill(); g.beginFill(0xFFFFFF); g.moveTo(24, -10); g.arc(24, -10, 10, Math.PI, 0); g.lineTo(24, -10); g.endFill(); });
  generate('balloon_stand', (g) => { drawPixelRect(g, 0x5D4037, 10, 10, 20, 20); drawPixelRect(g, 0xFFFFFF, 19, 0, 2, 10); drawPixelCircle(g, 0xFF0000, 15, 0, 6); drawPixelCircle(g, 0x0000FF, 25, -5, 6); drawPixelCircle(g, 0x00FF00, 20, -8, 6); });
  generate('picnic_blanket', (g) => { drawPixelRect(g, 0xFFEBEE, 0, 0, 48, 32); drawPixelRect(g, 0xE57373, 0, 0, 12, 12); drawPixelRect(g, 0xE57373, 24, 0, 12, 12); drawPixelRect(g, 0xE57373, 12, 12, 12, 12); drawPixelRect(g, 0xE57373, 36, 12, 12, 12); });
  generate('picnic_basket', (g) => { drawPixelRect(g, 0x8D6E63, 0, 5, 16, 10); drawPixelRect(g, 0x5D4037, 6, 0, 4, 6); });
  generate('pullup_bar', (g) => { drawPixelRect(g, 0x90A4AE, 0, 0, 4, 40); drawPixelRect(g, 0x90A4AE, 40, 0, 4, 40); drawPixelRect(g, 0xCFD8DC, 0, 2, 44, 4); });
  generate('fresh_grave', (g) => { drawPixelRect(g, 0x3E2723, 0, 0, 40, 20); drawPixelRect(g, 0x5D4037, -5, -5, 10, 10); drawPixelRect(g, 0x5D4037, 35, 15, 12, 8); });
  generate('casket_open', (g) => { drawPixelRect(g, 0x4E342E, 0, 0, 20, 48); drawPixelRect(g, 0x3E2723, 2, 2, 16, 44); drawPixelRect(g, 0xFFCCBC, 6, 6, 8, 8); drawPixelRect(g, 0xE0E0E0, 4, 14, 12, 30); });
  generate('shovel_ground', (g) => { drawPixelRect(g, 0x9E9E9E, 4, 0, 4, 8); drawPixelRect(g, 0x8D6E63, 5, -16, 2, 16); drawPixelRect(g, 0x8D6E63, 3, -18, 6, 2); });
  generate('blood_gun', (g) => { drawPixelCircle(g, 0x880000, 16, 16, 6); for(let i=0; i<12; i++) { const x = 16 + (Math.random() * 24 - 12); const y = 16 + (Math.random() * 24 - 12); drawPixelRect(g, 0x880000, x, y, 2, 2, 0.8); } });
  generate('blood_knife', (g) => { drawPixelCircle(g, 0x880000, 16, 16, 10); drawPixelCircle(g, 0x660000, 14, 14, 8); drawPixelRect(g, 0x880000, 20, 14, 8, 4); drawPixelRect(g, 0x880000, 26, 16, 4, 3); });
  generate('footprints', (g) => { drawPixelRect(g, 0x880000, 10, 10, 4, 8, 0.7); drawPixelRect(g, 0x880000, 18, 20, 4, 8, 0.5); });
  generate('dropped_phone', (g) => { drawPixelRect(g, 0x212121, 12, 12, 6, 10); drawPixelRect(g, 0x00E676, 13, 13, 4, 6); });
  generate('doll', (g) => { drawPixelRect(g, 0xFFCCBC, 8, 4, 8, 8); drawPixelRect(g, 0xF48FB1, 6, 12, 12, 14); });
  generate('ice_cream_stain', (g) => { drawPixelCircle(g, 0xF8BBD0, 16, 16, 8); drawPixelRect(g, 0xFFFFFF, 12, 12, 2, 2); drawPixelRect(g, 0xD7CCC8, 18, 18, 4, 4); });
  generate('chalk_mark', (g) => { drawPixelRect(g, 0xFFFFFF, 10, 10, 8, 2, 0.4); drawPixelRect(g, 0xFFFFFF, 14, 8, 2, 8, 0.4); drawPixelRect(g, 0xFFFFFF, 20, 20, 4, 4, 0.3); });
  generate('mud_patch', (g) => { drawPixelCircle(g, 0x5D4037, 14, 14, 8); drawPixelCircle(g, 0x4E342E, 20, 18, 6); drawPixelRect(g, 0x3E2723, 12, 12, 4, 4); });

  // --- FORENSICS & NPCS ---
  Object.entries(forensicPainters).forEach(([key, fn]) => {
      generate(key, fn);
  });

  const archetypes = [
      { key: 'human_elder', count: 3, fn: painters.elder },
      { key: 'human_punk', count: 3, fn: painters.punk },
      { key: 'human_suit', count: 3, fn: painters.suit },
      { key: 'clown', count: 1, fn: painters.clown }, 
      { key: 'kid_balloon', count: 3, fn: painters.kid_balloon },
      { key: 'hipster', count: 3, fn: painters.hipster },
      { key: 'guitarist', count: 2, fn: painters.guitarist },
      { key: 'bodybuilder', count: 3, fn: painters.bodybuilder },
      { key: 'cyclist', count: 3, fn: painters.cyclist },
      { key: 'tourist', count: 3, fn: painters.tourist },
      { key: 'goth', count: 3, fn: painters.goth },
      { key: 'artist', count: 3, fn: painters.artist },
      { key: 'gardener', count: 3, fn: painters.gardener },
      { key: 'commuter', count: 3, fn: painters.commuter },
      { key: 'glutton', count: 3, fn: painters.glutton },
  ];

  archetypes.forEach(({ key, count, fn }) => {
      for (let i = 0; i < count; i++) {
          const baseName = `${key}_${i}`;
          generate(baseName, (g) => fn(g, i));
          
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