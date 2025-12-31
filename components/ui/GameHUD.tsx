// --- FILE: components/ui/GameHUD.tsx ---

import React from 'react';
import { useGameStore, EvidenceItem } from '@/store/gameStore';

const FeedLog = () => {
    const feed = useGameStore(s => s.feed);
    return (
        <div className="absolute top-4 left-4 w-80 font-mono text-sm pointer-events-none">
            {feed.map((msg, i) => (
                <div key={msg.id} 
                    className={`mb-1 p-1 rounded backdrop-blur-sm border-l-2 transition-opacity duration-500
                    ${i === 0 ? 'opacity-100' : 'opacity-60'}
                    ${msg.source === 'ERROR' ? 'bg-red-900/40 border-red-500 text-red-100' : 
                      msg.source === 'ANALYSIS' ? 'bg-amber-900/40 border-amber-500 text-amber-100' : 
                      msg.source === 'VOICE' ? 'bg-cyan-900/40 border-cyan-500 text-cyan-100' : 
                      'bg-slate-900/40 border-slate-500 text-slate-100'}`}
                >
                    <span className="font-bold opacity-75 mr-2">[{msg.source}]</span>
                    {msg.text}
                </div>
            ))}
        </div>
    );
};

const ProbabilityMeter = () => {
    const score = useGameStore(s => s.convictionScore);
    let colorClass = 'bg-slate-500';
    if (score > 30) colorClass = 'bg-yellow-500';
    if (score >= 70) colorClass = 'bg-green-500 animate-pulse';

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-96 pointer-events-none">
            <div className="flex justify-between text-xs text-white font-bold mb-1 tracking-widest bg-black/50 px-2 rounded">
                <span>INSUFFICIENT</span>
                <span>BUILDING...</span>
                <span className={score >= 70 ? 'text-green-400' : 'text-slate-500'}>WARRANT AUTHORIZED</span>
            </div>
            <div className="h-4 w-full bg-slate-900/80 rounded-sm border border-slate-700 overflow-hidden">
                <div className={`h-full transition-all duration-700 ease-out ${colorClass}`} style={{ width: `${score}%` }} />
            </div>
            <div className="text-center text-white font-mono text-xl mt-1 drop-shadow-md">{score}% PROBABILITY</div>
        </div>
    );
};

const EvidenceTray = () => {
    const bag = useGameStore(s => s.evidenceBag);
    const renderSlot = (index: number) => {
        const item = bag[index];
        if (!item) return <div key={index} className="w-16 h-16 bg-slate-900/60 border border-slate-700 rounded flex items-center justify-center opacity-50"><span className="text-slate-600 text-2xl">+</span></div>;
        const isHerring = item.quality === 'HERRING';
        return (
            <div key={item.id} className="relative w-16 h-16 bg-slate-800/90 border border-slate-500 rounded flex flex-col items-center justify-center p-1 group">
                <div className="text-[10px] text-slate-400 uppercase truncate w-full text-center">{item.texture.replace('_', ' ')}</div>
                <div className="text-2xl">📦</div>
                {isHerring && <div className="absolute inset-0 flex items-center justify-center bg-red-900/60"><span className="text-red-500 font-black border-2 border-red-500 px-1 -rotate-12 text-xs">REJECTED</span></div>}
            </div>
        );
    };
    return <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">{[0, 1, 2, 3, 4].map(renderSlot)}</div>;
};

const ActionPanel = () => {
    const { convictionScore, triggerConfrontation } = useGameStore();
    const canArrest = convictionScore >= 70;
    return (
        <div className="absolute bottom-4 right-4 pointer-events-auto">
            <button
                onClick={triggerConfrontation}
                disabled={!canArrest}
                className={`px-6 py-4 font-bold text-lg tracking-widest border-2 transition-all ${canArrest ? 'bg-red-600 border-red-400 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.7)]' : 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed'}`}
            >{canArrest ? 'EXECUTE WARRANT' : 'EVIDENCE REQUIRED'}</button>
        </div>
    );
};

const StartScreen = () => {
    const startGame = useGameStore(s => s.startGame);
    return (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 pointer-events-auto">
            <h1 className="text-5xl font-black text-white tracking-widest drop-shadow-lg">WERISWARLOT</h1>
            <h2 className="text-lg text-slate-400 font-mono mb-8">Forensic Simulation v4.4</h2>
            <button
                onClick={startGame}
                className="px-8 py-4 bg-green-600 text-white font-bold text-2xl tracking-widest border-2 border-green-400 hover:bg-green-500 shadow-[0_0_25px_rgba(34,197,94,0.7)] transition-all"
            >BEGIN SIMULATION</button>
        </div>
    );
};

export const GameHUD = () => {
    const gameState = useGameStore(s => s.gameState);
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
            <FeedLog />
        </div>
    );
};