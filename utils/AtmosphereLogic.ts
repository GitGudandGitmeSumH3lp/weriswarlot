// utils/AtmosphereLogic.ts

export type TimeOfDay = 'DAY' | 'NIGHT' | 'DAWN';

export interface AtmosphereSettings {
    timeOfDay: TimeOfDay;
    hasFlashlight: boolean;
    hasRain: boolean;
}

// TEMPLATE: Define specific overrides per level here
const LEVEL_CONFIG: Record<number, Partial<AtmosphereSettings>> = {
    1: { timeOfDay: 'DAY', hasRain: false },
    2: { timeOfDay: 'DAWN', hasRain: true },
    3: { timeOfDay: 'DAY', hasRain: false },
};

export function getAtmosphereSettings(level: number, activeScenario: string | null): AtmosphereSettings {
    // 1. Default Fallback (Safe Mode)
    const defaults: AtmosphereSettings = { timeOfDay: 'NIGHT', hasFlashlight: true, hasRain: true };

    // 2. Get Level Config
    const config = LEVEL_CONFIG[level] || {};

    // 3. Determine Time
    const timeOfDay = config.timeOfDay || defaults.timeOfDay;

    // 4. Determine Flashlight
    // Logic: If it's NIGHT, we force flashlight. Otherwise, check config.
    let hasFlashlight = config.hasFlashlight;
    if (timeOfDay === 'NIGHT') {
        hasFlashlight = true;
    } else if (hasFlashlight === undefined) {
        hasFlashlight = false; // Default to off for Day/Dawn
    }

    // 5. Determine Rain
    // Logic: If Scenario is BOMB, forced Rain (Drama). Else, use config or random.
    let hasRain = config.hasRain;
    
    if (activeScenario === 'BOMB' || activeScenario === 'POISON') {
        hasRain = true; // Drama Override
    } 
    else if (hasRain === undefined) {
        // Random deterministic fallback
        const seed = (level * 9301 + 49297) % 233280;
        hasRain = seed % 2 === 0;
    }

    // Debug Log (So you can see what's happening in Console)
    console.log(`[Atmosphere] Level ${level} | Time: ${timeOfDay} | Flashlight: ${hasFlashlight} | Rain: ${hasRain}`);

    return {
        timeOfDay,
        hasFlashlight: !!hasFlashlight,
        hasRain: !!hasRain
    };
}