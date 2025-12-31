'use client';

import { useGameStore } from '@/store/gameStore';
import { getConfrontationDialogue } from '@/utils/DialogueGenerator';
import { useEffect, useState } from 'react';

export function ConfrontationScreen() {
  const activeScenario = useGameStore((state) => state.activeScenario);
  const killerArchetype = useGameStore((state) => state.killerArchetype);
  const resolveConfrontation = useGameStore((state) => state.resolveConfrontation);
  const convictionScore = useGameStore((state) => state.convictionScore);
  
  // Safe check
  if (!activeScenario) return null;

  const dialogue = getConfrontationDialogue(activeScenario);
  const [typedText, setTypedText] = useState('');
  
  // Typewriter Effect (Faster for large text)
  useEffect(() => {
    let i = 0;
    const speed = 15; 
    setTypedText('');
    const interval = setInterval(() => {
        setTypedText(dialogue.substring(0, i + 1));
        i++;
        if (i >= dialogue.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [dialogue]);

  // Conviction Color Logic
  const riskColor = convictionScore > 80 ? 'text-green-500' : convictionScore > 40 ? 'text-amber-500' : 'text-red-500';
  const riskLabel = convictionScore > 80 ? 'LOW RISK' : convictionScore > 40 ? 'UNCERTAIN' : 'HIGH RISK';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 font-mono text-white animate-in fade-in duration-300">
      
      {/* 1. Cinematic Letterboxing (Top/Bottom Bars) */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />

      {/* 2. The Target Identity */}
      <div className="mb-6 flex flex-col items-center gap-2 opacity-80">
        <div className="h-32 w-32 animate-pulse bg-slate-800 border-4 border-red-900 shadow-[0_0_30px_rgba(255,0,0,0.3)] flex items-center justify-center overflow-hidden">
             {/* Placeholder for Face or Mugshot Bridge */}
             <span className="text-6xl text-red-700">?</span>
        </div>
        <div className="text-center">
            <h2 className="text-xl tracking-[0.5em] text-red-600 font-black uppercase">SIGNAL INTERCEPTED</h2>
            <p className="text-slate-400 uppercase text-sm">Target Archetype: {killerArchetype}</p>
        </div>
      </div>

      {/* 3. The Monologue (LARGE TEXT) */}
      <div className="relative w-full max-w-4xl px-8 py-6 mb-12 border-l-4 border-amber-600 bg-slate-900/50 backdrop-blur-sm">
        <p className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed tracking-wide text-amber-500 drop-shadow-md">
            &quot;{typedText}&quot;
            <span className="ml-2 animate-pulse inline-block w-4 h-8 bg-amber-500 align-middle"/>
        </p>
      </div>

      {/* 4. The Moral Choice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        
        {/* OPTION A: ARREST (Risk) */}
        <button 
            onClick={() => resolveConfrontation('ARREST')}
            className="group relative flex flex-col items-center justify-center gap-2 rounded-sm border-2 border-slate-700 bg-slate-900 p-6 hover:border-amber-500 hover:bg-slate-800 transition-all active:scale-95"
        >
            <span className="text-2xl font-black tracking-widest text-slate-200 group-hover:text-amber-500">EXECUTE ARREST</span>
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">CONVICTION PROBABILITY:</span>
                <span className={`font-bold ${riskColor}`}>{convictionScore}% ({riskLabel})</span>
            </div>
            {/* Warning Subtext */}
            <span className="text-xs text-red-900 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Warning: Failure leads to escape
            </span>
        </button>

        {/* OPTION B: SAVE (Mercy) */}
        <button 
            onClick={() => resolveConfrontation('SAVE')}
            className="group relative flex flex-col items-center justify-center gap-2 rounded-sm border-2 border-blue-900 bg-slate-900 p-6 hover:border-cyan-400 hover:bg-slate-800 transition-all active:scale-95"
        >
            <span className="text-2xl font-black tracking-widest text-cyan-500 group-hover:text-cyan-300">INITIATE RESCUE</span>
            <div className="flex items-center gap-2 text-sm text-cyan-700/80">
                <span>PRIORITY:</span>
                <span className="font-bold">CIVILIAN PRESERVATION</span>
            </div>
            {/* Context Subtext based on Scenario */}
            <span className="text-xs text-cyan-400 uppercase tracking-widest">
                {activeScenario === 'BOMB' ? 'DEFUSE EXPLOSIVES' : activeScenario === 'POISON' ? 'ADMINISTER ANTIDOTE' : 'RECOVER EVIDENCE'}
            </span>
        </button>

      </div>

    </div>
  );
}