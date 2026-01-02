import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { INSPECTION_ZONES, BodyRegion } from '@/data/InspectionRegistry';

export const InspectionLayer = () => {
    const { interrogationTarget, logEvidence, postFeed } = useGameStore();

    if (!interrogationTarget) return null;

    const handleInspect = (region: BodyRegion) => {
        // Check if the target has a trait in this region
        const foundTrait = interrogationTarget.activeTraits?.find(t => t.region === region);

        if (foundTrait) {
            // SUCCESS: Found a clue!
            postFeed('ANALYSIS', `INSPECTION: ${foundTrait.description}`);
            logEvidence(foundTrait.id, foundTrait.painterKey, foundTrait.evidenceQuality);
        } else {
            // FAIL: Nothing there
            postFeed('SYSTEM', `Nothing unusual found on the ${region.toLowerCase()}.`);
        }
    };

    return (
        <div className="absolute inset-0 z-30 pointer-events-none">
            {Object.entries(INSPECTION_ZONES).map(([region, style]) => (
                <button
                    key={region}
                    onClick={() => handleInspect(region as BodyRegion)}
                    style={style}
                    className="absolute border-2 border-transparent hover:border-amber-500/50 hover:bg-amber-500/10 transition-all pointer-events-auto cursor-help group"
                >
                    {/* Hover Label */}
                    <span className="absolute -top-6 left-0 bg-amber-500 text-black text-[8px] font-bold px-1 opacity-0 group-hover:opacity-100 uppercase">
                        Inspect {region}
                    </span>
                </button>
            ))}
        </div>
    );
};