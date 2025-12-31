import { Entity } from './WorldGenerator';

// --- PERSONALITY TYPES ---
type Personality = 'NERVOUS' | 'RUDE' | 'HELPFUL' | 'CRYPTIC';

const getPersonality = (id: string): Personality => {
    // Simple hash to ensure the same entity always has the same personality
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }
    const types: Personality[] = ['NERVOUS', 'RUDE', 'HELPFUL', 'CRYPTIC'];
    return types[Math.abs(hash) % types.length];
};

// --- DIALOGUE TEMPLATES ---
const TEMPLATES: Record<Personality, { east: string[], west: string[], north: string[], south: string[], none: string[] }> = {
    NERVOUS: {
        east: ["I-I think he went East? Don't hurt me.", "Saw a guy run East. Looked scary.", "East! Just go East!"],
        west: ["Uhh, West? Yeah, West. Please leave.", "West side. Definitely West.", "He ran West. I'm getting out of here."],
        north: ["North! Towards the plaza.", "Up North. Just go.", "Saw movement North. Is it safe?"],
        south: ["South! He went South!", "Down South. Running fast.", "South side. Don't look at me."],
        none: ["I didn't see anything! I swear!", "Please, I just want to go home.", "I don't know anything!"]
    },
    RUDE: {
        east: ["Get out of my face. Try East.", "He went East. Now move.", "Blocking my view. Go East."],
        west: ["You blind? He went West.", "West. Go bother someone else.", "Check West and leave me alone."],
        north: ["North. Obvious, isn't it?", "Up North. Idiot.", "North. Can I go now?"],
        south: ["South. Now scram.", "South. You cops are all the same.", "He headed South. Bye."],
        none: ["Not my problem.", "Get a warrant.", "I ain't talking to you."]
    },
    HELPFUL: {
        east: ["Citizen! Suspicious activity to the East.", "I saw a subject heading East.", "Check the East sector, officer."],
        west: ["Target moved West.", "I believe he went West, detective.", "Scanning West... yes, he went that way."],
        north: ["North side. He looked dangerous.", "Heading North. Be careful.", "Subject is North of my position."],
        south: ["He ran South.", "Check the Southern path.", "South. Hurry, you can catch him."],
        none: ["All quiet here, officer.", "No visual on the target.", "I'll keep my eyes open."]
    },
    CRYPTIC: {
        east: ["The wind blows East...", "Follow the rising sun.", "Eastward lies the truth."],
        west: ["The shadows lengthened to the West.", "West. Where the day ends.", "He chases the setting sun."],
        north: ["Upwards. North.", "The cold wind comes from the North.", "He ascended North."],
        south: ["Down into the depths. South.", "South. The path of descent.", "He fled South."],
        none: ["The void reveals nothing.", "I see only you.", "Silence is the only answer."]
    }
};

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// --- MAIN DIALOGUE FUNCTION ---
export function generateDialogue(civilian: Entity, killer: Entity | undefined): string {
    if (!killer) return "I haven't noticed anything unusual.";

    const personality = getPersonality(civilian.id);
    
    // 30% Chance of Hint
    if (Math.random() < 0.35) {
        const dx = killer.x - civilian.x;
        const dy = killer.y - civilian.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? pick(TEMPLATES[personality].east) : pick(TEMPLATES[personality].west);
        } else {
            return dy > 0 ? pick(TEMPLATES[personality].south) : pick(TEMPLATES[personality].north);
        }
    }

    return pick(TEMPLATES[personality].none);
}

// --- NOIR EVIDENCE ANALYSIS ---
interface AnalysisResult {
    text: string;
    isValid: boolean;
    color: string; // Hex for UI
}

export function getEvidenceAnalysis(type: string, archetype: string): AnalysisResult {
    // 1. Red Herrings / Trash
    if (type === 'item_receipt') return { text: "TRASH: 'Milk, Eggs, Bread'. Domestic detritus.", isValid: false, color: '#94a3b8' };
    if (type === 'item_glass') return { text: "HAZARD: Broken glass. Watch your step.", isValid: false, color: '#ef4444' };
    if (type === 'pile_trash') return { text: "SEARCH: Nothing but rot and decay here.", isValid: false, color: '#94a3b8' };

    // 2. Universal Evidence
    if (type === 'item_wallet') return { text: "ID SECURED: 'John Doe'. Poor bastard.", isValid: true, color: '#f59e0b' };
    if (type === 'mud_patch') return { text: "TRACKS: Fresh mud. Someone was running.", isValid: true, color: '#f59e0b' };

    // 3. Archetype Specifics
    const isMatch = (
        (archetype === 'artist' && type === 'clue_paint') ||
        (archetype === 'punk' && type === 'clue_wrapper') ||
        (archetype === 'gardener' && type === 'clue_shears') ||
        (archetype === 'cyclist' && type === 'clue_shaker') ||
        (archetype === 'tourist' && type === 'clue_ticket')
    );

    if (isMatch) {
        const validTexts: Record<string, string> = {
            'clue_paint': "TRACE: Cadmium Red. Still wet. He's painting nearby.",
            'clue_wrapper': "TRACE: Sugar glaze. Matches the safehouse wrapper.",
            'clue_shears': "WEAPON: Serrated blade. Matches the wound profile.",
            'clue_shaker': "DNA: Protein residue. Our guy is bulking up.",
            'clue_ticket': "INTEL: Subway pass. Punched 10 minutes ago."
        };
        return { text: validTexts[type] || "EVIDENCE: Matches suspect profile.", isValid: true, color: '#f59e0b' }; // Amber
    } else {
         const invalidTexts: Record<string, string> = {
            'clue_paint': "IRRELEVANT: Dried up tube. Kids leave these everywhere.",
            'clue_wrapper': "TRASH: Just a snack wrapper. Wind blew it here.",
            'clue_shears': "TOOL: Rusted shut. Couldn't cut butter.",
            'clue_shaker': "TRASH: Empty. Probably a jogger's litter.",
            'clue_ticket': "TRASH: Expired last month. Useless."
        };
        return { text: invalidTexts[type] || "DISCARDED: Unrelated to case.", isValid: false, color: '#64748b' }; // Slate-500
    }
}

// --- VILLAIN MONOLOGUES ---
export function getConfrontationDialogue(scenario: 'BOMB' | 'EVIDENCE' | 'POISON' | 'ACCOMPLICE'): string {
    const scripts = {
        BOMB: "Tick tock, detective. I rigged the plaza. Take me in, and it all turns to ash. Let me walk, and maybe you find the detonators in time.",
        EVIDENCE: "You want justice? Detective Miller is rotting in a box somewhere here. Arrest me, and he dies alone. Let me go, and I'll tell you which trash pile he's under.",
        POISON: "Don't come closer. I slipped a neurotoxin into the crowd. Three people are dying right now. Catch me, or cure them. Your choice.",
        ACCOMPLICE: "My partner is watching. He's in the crowd... wearing a Red Suit. If he sees me in cuffs, he detonates the vest. Do you feel lucky?"
    };
    return scripts[scenario];
}