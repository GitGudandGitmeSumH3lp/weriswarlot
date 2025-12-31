// src/data/PropRegistry.ts

export interface PropDefinition {
    id: string; // The specific type identifier (e.g., 'tree', 'lamp')
    textureKey: string; // The key used in useProceduralAssets
    isSolid: boolean; // Does it block movement?
    height: number; // Approximate visual height (for projectiles/visuals)
    pivotY: number; // Where the "feet" are (0 to 1), usually 1 for bottom-aligned
}

export const PROP_REGISTRY: Record<string, PropDefinition> = {
    'tree': { id: 'tree', textureKey: 'tree', isSolid: true, height: 60, pivotY: 0.9 },
    'statue': { id: 'statue', textureKey: 'statue', isSolid: true, height: 40, pivotY: 0.9 },
    'lamp': { id: 'lamp', textureKey: 'lamp', isSolid: true, height: 50, pivotY: 0.95 },
    'bush': { id: 'bush', textureKey: 'bush', isSolid: false, height: 15, pivotY: 0.8 },
    'bench': { id: 'bench', textureKey: 'bush', isSolid: false, height: 10, pivotY: 0.8 }, // Using bush texture as placeholder
    // Decals/Items
    'clue_generic': { id: 'clue', textureKey: 'clue_generic', isSolid: false, height: 0, pivotY: 0.5 },
    'grave': { id: 'grave', textureKey: 'stone', isSolid: true, height: 10, pivotY: 0.8 }
};

export const getPropDef = (type: string): PropDefinition => {
    return PROP_REGISTRY[type] || { 
        id: 'unknown', 
        textureKey: 'clue_generic', 
        isSolid: false, 
        height: 0, 
        pivotY: 0.5 
    };
};