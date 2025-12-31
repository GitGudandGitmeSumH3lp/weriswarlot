'use client';

import { useApplication } from '@pixi/react';
import { useEffect, useState } from 'react';
import { Texture } from 'pixi.js';
import { useGameStore } from '@/store/gameStore'; 
import { generateAtmosphereAssets } from '@/utils/AssetGenerator';
import { getAtmosphereSettings } from '@/utils/AtmosphereLogic'; 
import { LightingLayer } from './LightingLayer';
import { RainLayer } from './RainLayer';

export function Atmosphere() {
    const { app } = useApplication();
    const [assets, setAssets] = useState<{ flashlight: Texture; rain: Texture } | null>(null);

    // State Selectors
    const level = useGameStore((state) => state.level);
    const activeScenario = useGameStore((state) => state.activeScenario);

    // Logic Calculation
    const settings = getAtmosphereSettings(level, activeScenario);

    // 1. SAFE ASSET GENERATION
    useEffect(() => {
        if (!app) return; // Barrier 1: App must exist

        try {
            // Barrier 2: Try/Catch the generator
            const generated = generateAtmosphereAssets(app);
            setAssets(generated);
        } catch (e) {
            console.error("Atmosphere Asset Generation Failed:", e);
            // We do NOT crash. We just don't set assets, so atmosphere stays off.
        }
    }, [app]);

    // Barrier 3: If assets failed or aren't ready, render nothing.
    if (!assets) return null;

    return (
        <>
            {settings.hasRain && (
                <RainLayer texture={assets.rain} />
            )}

            {settings.hasFlashlight && (
                <LightingLayer texture={assets.flashlight} />
            )}
        </>
    );
}