import React, { useEffect, useRef } from 'react';
import { Application, extend, useApplication } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useGameStore } from '@/store/gameStore';
import { painters } from '@/utils/CharacterPainters';
import { getRumorText } from '@/data/RumorRegistry';

// Register Pixi components for the mini-app
extend({ Container, Graphics });

// Helper component to draw the mugshot inside the isolated canvas
const MugshotRenderer = ({ target }: { target: any }) => {
    const { app: pixiApp } = useApplication() as any; 
    
    useEffect(() => {
        if (!target || !pixiApp || !pixiApp.stage) return;

        const g = new Graphics();
        
        const parts = target.textureKey.split('_');
        const baseKey = parts[0];
        const variant = parseInt(parts[1]) || 0;

        // @ts-ignore
        const paintFn = painters[baseKey];

        if (paintFn) {
            // FIXED: Centering logic for 4x scale
            // Character is ~32px wide (scaled to 128px)
            // Character is ~48px tall (scaled to 192px)
            g.scale.set(4); 
            
            // X: (CanvasWidth / 2) - (ScaledWidth / 2) - (InternalPainterOffset * Scale)
            // Most painters have a ~10px gap on the left
            g.x = 35; 
            
            // Y: (CanvasHeight / 2) - (ScaledHeight / 2)
            // (200 / 2) - (192 / 2) = 4px padding top/bottom
            g.y = 5; 

            paintFn(g, variant);
            pixiApp.stage.addChild(g);
        }

        return () => {
            if (pixiApp.stage) {
                pixiApp.stage.removeChild(g);
            }
            g.destroy();
        };
    }, [target, pixiApp]);

    return null;
};
export const InterrogationOverlay = () => {
    const { interrogationTarget, endInterrogation } = useGameStore();
    
    if (!interrogationTarget) return null;

    const rumor = getRumorText(interrogationTarget);
    const isWitness = !!interrogationTarget.witnessMemory;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-auto backdrop-blur-sm">
            
            {/* Main Card */}
            <div className="bg-slate-900 border-4 border-slate-600 rounded-lg p-6 w-[600px] flex gap-6 shadow-2xl relative">
                
                {/* LEFT: Mugshot (Pixi Canvas) */}
                <div className="w-[200px] h-[250px] bg-slate-800 border-2 border-slate-700 rounded flex flex-col items-center justify-center relative overflow-hidden">
                     {/* Mugshot Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 to-slate-900 opacity-50"></div>
                    
                    <Application width={200} height={200} backgroundAlpha={0}>
                        <MugshotRenderer target={interrogationTarget} />
                    </Application>
                    
                    <div className="mt-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
                        Subject #{interrogationTarget.id.split('_')[1]}
                    </div>
                </div>

                {/* RIGHT: Dialogue & Actions */}
                <div className="flex-1 flex flex-col">
                    <h2 className="text-2xl font-black text-amber-500 uppercase mb-1">
                        {interrogationTarget.type.toUpperCase()}
                    </h2>
                    <div className="h-1 w-full bg-slate-700 mb-4"></div>

                    {/* The Dialogue Text */}
                    <div className="flex-1 bg-black/30 p-4 rounded border border-slate-700 mb-4 font-mono text-sm leading-relaxed text-slate-200">
                        <span className="text-amber-500 font-bold">"</span>
                        {rumor}
                        <span className="text-amber-500 font-bold">"</span>
                    </div>

                    {/* Witness Indicator (The Payoff) */}
                    {isWitness && (
                        <div className="mb-4 text-xs text-red-400 flex items-center gap-2 border border-red-900/50 bg-red-900/20 p-2 rounded">
                            <span>👁</span>
                            <span className="font-bold">WITNESS TESTIMONY RECORDED</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-auto flex justify-end gap-3">
                        <button 
                            onClick={endInterrogation}
                            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded border border-slate-500 transition-colors"
                        >
                            DISMISS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};