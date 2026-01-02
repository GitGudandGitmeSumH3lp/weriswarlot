import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

const WireButton = ({ color, label, onClick }: { color: string, label: string, onClick: () => void }) => {
    const colorClasses = {
        'RED': 'bg-red-600 hover:bg-red-500 border-red-800',
        'BLUE': 'bg-blue-600 hover:bg-blue-500 border-blue-800',
        'GREEN': 'bg-green-600 hover:bg-green-500 border-green-800',
    }[color] || 'bg-gray-600';

    return (
        <button 
            onClick={onClick}
            className={`w-full py-4 mb-3 font-mono font-bold text-white text-xl border-b-4 rounded shadow-lg active:border-b-0 active:translate-y-1 transition-all ${colorClasses}`}
        >
            CUT {label} WIRE
        </button>
    );
};

export const CrisisOverlay = () => {
    const { 
        scenarioTimer, 
        crisisInteractTarget, 
        crisisSolution, 
        resolveCrisis, 
        setCrisisInteraction,
        tickTimer
    } = useGameStore();

    // Ticker Effect (Separate from Game Loop to ensure UI sync)
    useEffect(() => {
        const interval = setInterval(() => {
            tickTimer();
        }, 1000);
        return () => clearInterval(interval);
    }, [tickTimer]);

    const handleCut = (color: string) => {
        if (color === crisisSolution) {
            resolveCrisis(true); // Success
        } else {
            resolveCrisis(false); // Boom
        }
    };

    const isCritical = scenarioTimer <= 10;

    return (
        <div className="absolute inset-0 pointer-events-none z-40 flex flex-col items-center">
            
            {/* 1. THE BIG RED CLOCK */}
            <div className={`mt-8 px-6 py-2 bg-black/80 border-2 rounded-lg backdrop-blur-sm transition-colors duration-500 ${
                isCritical ? 'border-red-500 animate-pulse' : 'border-slate-500'
            }`}>
                <div className={`text-4xl font-black font-mono tracking-widest ${
                    isCritical ? 'text-red-500' : 'text-white'
                }`}>
                    00:{scenarioTimer.toString().padStart(2, '0')}
                </div>
                <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.2em]">
                    CRITICAL FAILURE IMMINENT
                </div>
            </div>

            {/* 2. BOMB DEFUSAL MODAL */}
            {crisisInteractTarget && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center pointer-events-auto backdrop-blur-md animate-in fade-in zoom-in duration-200">
                    <div className="bg-slate-900 border-4 border-slate-700 p-8 rounded-xl w-[400px] shadow-2xl relative">
                        {/* Close Button */}
                        <button 
                            onClick={() => setCrisisInteraction(null)}
                            className="absolute top-2 right-4 text-slate-500 hover:text-white font-bold text-xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-black text-red-500 mb-2 uppercase text-center border-b border-slate-700 pb-4">
                            Device Arming...
                        </h2>
                        
                        <div className="my-6">
                            <p className="text-slate-400 text-sm mb-4 text-center font-mono">
                                "The schematic said the <span className="text-white font-bold">{crisisSolution}</span> wire controls the detonator..."
                                <br/>
                                <span className="text-xs text-slate-600">(Wait... does that mean I should cut it, or avoid it? Ideally you'd have found a clue...)</span>
                            </p>

                            <WireButton color="RED" label="RED" onClick={() => handleCut('RED')} />
                            <WireButton color="BLUE" label="BLUE" onClick={() => handleCut('BLUE')} />
                            <WireButton color="GREEN" label="GREEN" onClick={() => handleCut('GREEN')} />
                        </div>

                        <div className="text-center text-xs text-slate-600 font-mono">
                            SERIAL: 849-AE-392 // MFG: 2025
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};