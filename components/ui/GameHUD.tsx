// --- FILE: components/ui/GameHUD.tsx ---
import { InterrogationOverlay } from './InterrogationOverlay'; 
import React, { useState } from 'react';
import { useGameStore, EvidenceItem } from '@/store/gameStore';

const FeedLog = () => {
    const feed = useGameStore(s => s.feed);
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div 
            className="absolute top-2 left-2 w-64 font-mono text-xs transition-all duration-300 pointer-events-auto"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Peek tab - always visible */}
            <div className={`mb-1 px-2 py-1 bg-slate-800/60 border-l-4 border-slate-400 rounded cursor-pointer transition-all ${
                isExpanded ? 'opacity-100' : 'opacity-40 hover:opacity-70'
            }`}>
                <span className="font-bold">📋 LOG</span>
                {!isExpanded && feed.length > 0 && <span className="ml-2 text-[10px] opacity-60">({feed.length})</span>}
            </div>
            
            {/* Expandable messages */}
            <div className={`transition-all duration-300 overflow-hidden ${
                isExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
            }`}>
                {feed.slice(0, 3).map((msg, i) => (
                    <div key={msg.id} 
                        className={`mb-1 px-2 py-1 rounded border-l-4 transition-opacity duration-300
                        ${msg.source === 'ERROR' ? 'bg-red-900/70 border-red-400 text-red-100' : 
                          msg.source === 'ANALYSIS' ? 'bg-amber-900/70 border-amber-400 text-amber-100' : 
                          msg.source === 'VOICE' ? 'bg-cyan-900/70 border-cyan-400 text-cyan-100' : 
                          'bg-slate-900/70 border-slate-400 text-slate-100'}`}
                    >
                        <span className="font-bold mr-1">[{msg.source}]</span>
                        <span className="opacity-90">{msg.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProbabilityMeter = () => {
    const score = useGameStore(s => s.convictionScore);
    const [isExpanded, setIsExpanded] = useState(false);
    
    return (
        <div 
            className="absolute top-2 right-2 transition-all duration-300 pointer-events-auto"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className={`bg-slate-900/80 rounded border-2 border-slate-600 transition-all ${
                isExpanded ? 'p-2 w-48 opacity-100' : 'p-1 w-20 opacity-40 hover:opacity-70'
            }`}>
                <div className={`text-[10px] font-bold text-white text-center mb-1 tracking-wide transition-all ${
                    isExpanded ? 'opacity-100' : 'opacity-0'
                }`}>
                    CONVICTION: {score}%
                </div>
                
                {/* Always show score number when collapsed */}
                {!isExpanded && (
                    <div className="text-center text-white font-bold text-xs">
                        {score}%
                    </div>
                )}
                
                {/* Progress bar - only when expanded */}
                <div className={`transition-all duration-300 overflow-hidden ${
                    isExpanded ? 'h-3 opacity-100' : 'h-0 opacity-0'
                }`}>
                    <div className="h-3 bg-slate-950 rounded-sm border border-slate-700 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${
                                score >= 70 ? 'bg-green-500' :
                                score > 30 ? 'bg-yellow-500' : 'bg-slate-500'
                            }`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const EvidenceTray = () => {
    const bag = useGameStore(s => s.evidenceBag);
    const [isExpanded, setIsExpanded] = useState(false);
    
    const renderSlot = (index: number) => {
        const item = bag[index];
        
        if (!item) {
            return (
                <div key={index} className="w-12 h-12 bg-slate-900/60 border border-slate-600 rounded flex items-center justify-center">
                    <span className="text-slate-500 text-lg">+</span>
                </div>
            );
        }
        
        const isHerring = item.quality === 'HERRING';
        
        return (
            <div key={item.id} className={`relative w-12 h-12 rounded border-2 flex items-center justify-center ${
                isHerring ? 'bg-red-900/80 border-red-500' : 'bg-amber-800/80 border-amber-500'
            }`}>
                <div className="text-xl">📦</div>
                {isHerring && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="text-red-400 font-black text-[8px] border border-red-400 px-1 rotate-[-15deg]">
                            ✗
                        </span>
                    </div>
                )}
            </div>
        );
    };
    
    const itemCount = bag.filter(Boolean).length;
    
    return (
        <div 
            className="absolute bottom-2 left-2 pointer-events-auto transition-all duration-300"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className={`bg-slate-900/80 rounded border-2 border-slate-600 p-2 transition-all ${
                isExpanded ? 'opacity-100' : 'opacity-40 hover:opacity-70'
            }`}>
                <div className="text-[9px] font-bold text-slate-300 text-center mb-1">
                    EVIDENCE {!isExpanded && `(${itemCount}/5)`}
                </div>
                <div className={`flex gap-1 transition-all duration-300 overflow-hidden ${
                    isExpanded ? 'max-w-[260px] opacity-100' : 'max-w-[52px] opacity-0'
                }`}>
                    {[0, 1, 2, 3, 4].map(renderSlot)}
                </div>
            </div>
        </div>
    );
};

const ActionPanel = () => {
    const { convictionScore, triggerConfrontation } = useGameStore();
    const canArrest = convictionScore >= 70;
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div 
            className="absolute bottom-2 right-2 pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                onClick={triggerConfrontation}
                disabled={!canArrest}
                className={`px-4 py-2 font-bold text-sm border-2 rounded transition-all ${
                    canArrest 
                        ? 'bg-red-600 border-red-400 text-white hover:bg-red-500' 
                        : 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed'
                } ${isHovered || canArrest ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
            >
                {canArrest ? '⚡ ARREST' : '🔒 LOCKED'}
            </button>
        </div>
    );
};

const StartScreen = () => {
    const startGame = useGameStore(s => s.startGame);
    
    return (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50 pointer-events-auto">
            <div className="text-center">
                <h1 className="text-4xl font-black text-amber-400 tracking-widest mb-1">
                    WERISWARLOT
                </h1>
                <p className="text-xs text-slate-400 font-mono mb-6">Forensic Simulation v4.4</p>
                
                <button
                    onClick={startGame}
                    className="px-6 py-3 bg-green-600 text-white font-bold text-lg border-2 border-green-400 rounded hover:bg-green-500 transition-all"
                >
                    ▶ START
                </button>
            </div>
        </div>
    );
};

export const GameHUD = () => {
    const { gameState, isInterrogating } = useGameStore(s => ({ 
        gameState: s.gameState, 
        isInterrogating: s.isInterrogating 
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
            {gameState === 'IDLE' && <StartScreen />}
            
            {(gameState === 'PLAYING' || gameState === 'SCENARIO_ACTIVE') && (
                <>
                    <ProbabilityMeter />
                    <EvidenceTray />
                    <ActionPanel />
                </>
            )}
            
            {/* Show Overlay if state is active */}
            {isInterrogating && <InterrogationOverlay />}
            
            <FeedLog />
        </div>
    );
};