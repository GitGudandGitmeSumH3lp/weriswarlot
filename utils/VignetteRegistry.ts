// --- FILE: utils/VignetteRegistry.ts ---

export type VignetteType = 'CRIME' | 'HERRING' | 'AMBIANCE';

export interface VignetteItem {
    idSuffix: string;
    texture: string;
    x: number; // Relative offset from center
    y: number;
    rot?: number;
    quality?: 'CRIME' | 'HERRING' | 'AMBIANCE'; // Quality override
}

export interface VignetteDef {
    id: string;
    type: VignetteType;
    context: 'PARK' | 'ALLEY' | 'PATH' | 'ANY';
    items: VignetteItem[];
}

export const VIGNETTES: VignetteDef[] = [
    // --- 1. CRIME SCENES (The Real Deal) ---
    {
        id: 'crime_stabbing',
        type: 'CRIME',
        context: 'ALLEY',
        items: [
            { idSuffix: 'body', texture: 'chalk_mark', x: 0, y: 0 },
            { idSuffix: 'blood', texture: 'blood_stain', x: 5, y: 10 },
            { idSuffix: 'weapon', texture: 'blood_knife', x: 15, y: 15, rot: 1.2 }
        ]
    },
    {
        id: 'crime_burial',
        type: 'CRIME',
        context: 'PARK',
        items: [
            { idSuffix: 'grave', texture: 'fresh_grave', x: 0, y: 0 },
            { idSuffix: 'shovel', texture: 'shovel_ground', x: 20, y: 5, rot: 0.5 },
            { idSuffix: 'prints', texture: 'footprints', x: 30, y: 20, rot: 2.0 }
        ]
    },
    {
        id: 'crime_stash',
        type: 'CRIME',
        context: 'ANY',
        items: [
            { idSuffix: 'bin', texture: 'trashcan', x: 0, y: 0, rot: 1.57 }, // Tipped over
            { idSuffix: 'trash', texture: 'pile_trash', x: 15, y: 5 },
            { idSuffix: 'wallet', texture: 'item_wallet', x: 20, y: 0, rot: 0.2 } // Hidden in trash
        ]
    },

    // --- 2. RED HERRINGS (The Fakes) ---
    {
        id: 'herring_lunch',
        type: 'HERRING',
        context: 'PARK',
        items: [
            { idSuffix: 'stain', texture: 'ketchup_stain', x: 0, y: 0 }, // Looks like blood
            { idSuffix: 'wrapper', texture: 'hotdog_wrapper', x: 10, y: 5, rot: 0.8 }, // The tell
            { idSuffix: 'bench', texture: 'bench', x: 0, y: -20 }
        ]
    },
    {
        id: 'herring_art',
        type: 'HERRING',
        context: 'ALLEY',
        items: [
            { idSuffix: 'splat', texture: 'paint_splat', x: 0, y: 0 }, // Looks like blood
            { idSuffix: 'brush', texture: 'paint_brush', x: 12, y: 8, rot: -0.5 }, // The tell
            { idSuffix: 'easel', texture: 'clue_generic', x: -15, y: -5 } // Placeholder for easel
        ]
    },
    {
        id: 'herring_toy',
        type: 'HERRING',
        context: 'ANY',
        items: [
            { idSuffix: 'gun', texture: 'toy_gun', x: 0, y: 0, rot: 1.0 }, // Orange tip visible
            { idSuffix: 'balloon', texture: 'kid_balloon', x: 10, y: -10 } // Belonged to a kid
        ]
    },

    // --- 3. AMBIANCE (Normalcy) ---
    {
        id: 'ambiance_picnic',
        type: 'AMBIANCE',
        context: 'PARK',
        items: [
            { idSuffix: 'blanket', texture: 'picnic_blanket', x: 0, y: 0 },
            { idSuffix: 'basket', texture: 'picnic_basket', x: -5, y: -5 }
        ]
    },
    {
        id: 'ambiance_vendor',
        type: 'AMBIANCE',
        context: 'PATH',
        items: [
            { idSuffix: 'cart', texture: 'ice_cream_cart', x: 0, y: 0 },
            { idSuffix: 'stain', texture: 'ice_cream_stain', x: 15, y: 10 }
        ]
    },

    // --- NEW: AMBIGUOUS VIGNETTES ---
    
    // Vignette: The Dug Hole
    {
        id: 'crime_hidden_body',
        type: 'CRIME',
        context: 'PARK',
        items: [
            { idSuffix: 'hole', texture: 'freshly_dug_hole', x: 0, y: 0 },
            { idSuffix: 'tool', texture: 'shovel_ground', x: 25, y: 0 },
            { idSuffix: 'clue', texture: 'torn_cloth', x: -15, y: 5, quality: 'CRIME' }
        ]
    },
    {
        id: 'herring_planting_tree',
        type: 'HERRING',
        context: 'PARK',
        items: [
            { idSuffix: 'hole', texture: 'freshly_dug_hole', x: 0, y: 0 },
            { idSuffix: 'tree', texture: 'sapling_tree', x: -15, y: -5 },
            { idSuffix: 'tool', texture: 'gardening_trowel', x: 20, y: 8, quality: 'HERRING' }
        ]
    },

    // Vignette: The Lost Bag
    {
        id: 'crime_stolen_bag',
        type: 'CRIME',
        context: 'PATH',
        items: [
            { idSuffix: 'bag', texture: 'discarded_backpack', x: 0, y: 0 },
            { idSuffix: 'clue', texture: 'item_wallet', x: 12, y: 5, quality: 'CRIME' }
        ]
    },
    {
        id: 'ambiance_student_lunch',
        type: 'AMBIANCE',
        context: 'PATH',
        items: [
            { idSuffix: 'bag', texture: 'discarded_backpack', x: 0, y: 0 },
            { idSuffix: 'book', texture: 'textbook', x: 15, y: 0 },
            { idSuffix: 'food', texture: 'apple_core', x: -12, y: 5 }
        ]
    },
];