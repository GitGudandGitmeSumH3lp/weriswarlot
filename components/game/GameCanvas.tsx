'use client';

import { Application } from '@pixi/react';
import { World } from './World';
import { Atmosphere } from './atmosphere/Atmosphere'; // <--- IMPORT
import { useGameStore } from '@/store/gameStore';

export function GameCanvas() {
    // We check Store here if we want to conditionally render Atmosphere (e.g. disable in Menu?)
    // But Noir style implies it's always dark.
    
    return (
        <Application
            width={800}
            height={600}
            backgroundColor={0x020617} // Slate-950
            resolution={window.devicePixelRatio || 1}
            autoDensity
        >
            {/* Z-Index 0-49: The World */}
            <World />
            
            {/* Z-Index 50+: The Atmosphere */}
            <Atmosphere />

        </Application>
    );
}