// --- FILE: hooks/useGameTextures.ts ---
import { useState, useEffect } from 'react';
import { Application, Texture } from 'pixi.js';
import { generateGameTextures } from '@/utils/TextureLoader';

export const useGameTextures = (app: Application) => {
  const [textures, setTextures] = useState<Record<string, Texture> | null>(null);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;

    const tryGenerate = () => {
        if (!mounted) return;
        
        // Check if App and Renderer are fully ready
        if (!app || !app.renderer) {
            if (attempts < 10) { // Try for ~1 second
                attempts++;
                setTimeout(tryGenerate, 100);
            }
            return;
        }

        try {
            console.log("🎨 Generating Game Textures...");
            const generated = generateGameTextures(app);
            
            // Simple check to ensure we actually got textures back
            if (Object.keys(generated).length > 0) {
                setTextures(generated);
            } else {
                // Retry if empty (edge case)
                setTimeout(tryGenerate, 100);
            }
        } catch (e) {
            console.error("Texture Generation Failed:", e);
        }
    };

    tryGenerate();

    return () => { mounted = false; };
  }, [app]);

  return textures;
};