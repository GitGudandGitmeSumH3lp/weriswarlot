import React from 'react';
import { useGameStore } from '@/store/gameStore';

export const ResultScreen = () => {
    const { gameState, victimCount, level, startGame, nextLevel } = useGameStore();
    
    const isWin = gameState === 'LEVEL_COMPLETE';
    const isGameOver = gameState === 'GAME_OVER';

    if (!isWin && !isGameOver) return null;

    return (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-50 pointer-events-auto animate-in fade-in duration-500">
            {/* Dynamic Border Color */}
            <div className={`w-[500px] border-4 p-8 rounded-xl text-center shadow-2xl relative overflow-hidden ${
                isWin ? 'border-green-500 bg-green-950/30' : 'border-red-600 bg-red-950/30'
            }`}>
                
                {/* Header */}
                <h1 className={`text-5xl font-black mb-2 tracking-tighter ${
                    isWin ? 'text-green-400' : 'text-red-500'
                }`}>
                    {isWin ? 'CASE CLOSED' : 'CRITICAL FAILURE'}
                </h1>

                <div className="h-px w-full bg-slate-700 my-4"></div>

                {/* Stats */}
                <div className="font-mono space-y-4 mb-8">
                    <div className="text-xl text-slate-300">
                        CASE FILE: <span className="text-white font-bold">#{level.toString().padStart(3, '0')}</span>
                    </div>
                    
                    <div className="text-3xl">
                        <span className="text-slate-400 text-sm block mb-1">CASUALTIES</span>
                        <span className={`font-bold ${victimCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {victimCount}
                        </span>
                    </div>

                    {isWin && (
                        <div className="text-sm text-green-300/80 italic mt-2">
                            "Excellent work, detective. The city sleeps safer tonight."
                        </div>
                    )}
                    
                    {isGameOver && (
                        <div className="text-sm text-red-300/80 italic mt-2">
                            "The suspect escaped. The trail has gone cold."
                        </div>
                    )}
                </div>

                {/* Actions */}
                <button
                    onClick={isWin ? nextLevel : startGame}
                    className={`w-full py-4 font-bold text-xl rounded border-b-4 active:border-b-0 active:translate-y-1 transition-all ${
                        isWin 
                            ? 'bg-green-600 hover:bg-green-500 border-green-800 text-white' 
                            : 'bg-slate-200 hover:bg-white border-slate-400 text-black'
                    }`}
                >
                    {isWin ? 'NEXT ASSIGNMENT ➤' : 'REOPEN CASE ↺'}
                </button>

            </div>
        </div>
    );
};