import React from 'react';
import { useGameStore } from '@/store/gameStore';

export const DebugDashboard = () => {
    // Access the state directly for the dashboard
    const state = useGameStore();

    return (
        <div className="absolute top-20 left-2 bg-black/95 border-2 border-green-500 p-4 rounded shadow-2xl font-mono text-[10px] text-green-400 z-50 pointer-events-auto w-64">
            <div className="flex justify-between items-center mb-2 border-b border-green-800 pb-2">
                <h3 className="font-bold text-green-100 uppercase tracking-tighter">System Debugger</h3>
                <button onClick={state.toggleDebug} className="text-red-500 hover:text-white font-bold px-2">✕</button>
            </div>

            <div className="space-y-3">
                {/* STATUS PANEL */}
                <div className="bg-green-950/30 p-2 rounded border border-green-900">
                    <div className="flex justify-between">
                        <span>HEAT:</span>
                        <span className="text-white">{state.killerHeat}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>TIMER:</span>
                        <span className="text-white">{state.killerActionTimer}s</span>
                    </div>
                    <div className="flex justify-between">
                        <span>SCORE:</span>
                        <span className="text-white">{state.convictionScore}%</span>
                    </div>
                </div>

                {/* COMMANDS */}
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => state.debugSetScore(100)}
                        className="bg-green-600 hover:bg-green-500 text-white py-1 rounded text-[9px] font-bold"
                    >
                        SET SCORE 100%
                    </button>
                    
                    <button 
                        onClick={() => state.debugSetHeat(100)}
                        className="bg-red-600 hover:bg-red-500 text-white py-1 rounded text-[9px] font-bold"
                    >
                        SET HEAT 100 (PANIC)
                    </button>

                    <button 
                        onClick={() => state.debugTriggerKiller()}
                        className="bg-amber-600 hover:bg-amber-500 text-white py-1 rounded text-[9px] font-bold"
                    >
                        FORCE KILLER ACT
                    </button>
                </div>
            </div>
        </div>
    );
};