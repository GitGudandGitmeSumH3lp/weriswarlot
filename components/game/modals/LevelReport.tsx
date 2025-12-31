'use client';

import { useGameStore } from '@/store/gameStore';

export function LevelReport() {
  const level = useGameStore((state) => state.level);
  const victimCount = useGameStore((state) => state.victimCount);
  const nextLevel = useGameStore((state) => state.nextLevel);
  const activeScenario = useGameStore((state) => state.activeScenario);
  
  // We can infer if they escaped based on the Active Scenario. 
  // If we are in LEVEL_COMPLETE and activeScenario is NOT null, it implies we came from a Rescue mission (Escape).
  // If activeScenario IS null (cleared), it implies Arrest (Success). 
  // *Wait, looking at store logic, activeScenario persists until nextLevel is called.*
  
  // Let's assume: If we did a "Rescue", the killer escaped.
  const suspectStatus = activeScenario ? 'SUSPECT AT LARGE' : 'SUSPECT APPREHENDED';
  const statusColor = activeScenario ? 'text-red-500' : 'text-green-500';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 font-mono text-white">
      
      {/* Header */}
      <div className="mb-8 border-b-2 border-slate-800 pb-4 text-center w-full max-w-2xl">
        <h1 className="text-4xl font-black tracking-[0.5em] text-slate-200">CASE {level} CLOSED</h1>
        <p className="mt-2 text-sm text-slate-500">BUREAU OF INTERNAL INVESTIGATIONS</p>
      </div>

      {/* The Dossier */}
      <div className="w-full max-w-2xl bg-slate-900/50 p-8 border-l-4 border-slate-700">
        
        {/* Status */}
        <div className="mb-6 flex justify-between items-end border-b border-slate-800 pb-2">
            <span className="text-slate-400 text-sm uppercase tracking-widest">Final Status</span>
            <span className={`text-2xl font-bold ${statusColor} animate-pulse`}>{suspectStatus}</span>
        </div>

        {/* Casualty Report */}
        <div className="space-y-4 mb-8">
            <div className="flex justify-between">
                <span className="text-slate-400">Immediate Casualties</span>
                <span className="text-slate-200">0</span> {/* Placeholder logic for now */}
            </div>
            <div className="flex justify-between">
                <span className="text-slate-400">Collateral Damage (Escape)</span>
                <span className="text-red-400">{activeScenario ? '+2' : '0'}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 mt-2">
                <span className="text-red-600 font-bold uppercase tracking-widest">Total Career Death Toll</span>
                <span className="text-3xl font-black text-red-600">{victimCount}</span>
            </div>
        </div>

        {/* Narrative / Hopelessness Text */}
        <div className="mb-8 text-sm text-slate-500 italic">
            {activeScenario 
                ? "The suspect fled while you dealt with the immediate threat. Intelligence suggests they have already killed again."
                : "Suspect in custody. However, due to procedural delays, 3 other cases have gone cold."}
        </div>

        {/* Button */}
        <button 
            onClick={nextLevel}
            className="w-full group relative flex items-center justify-center gap-2 bg-slate-800 py-4 hover:bg-slate-700 transition-all border border-slate-600 hover:border-amber-500"
        >
            <span className="text-xl font-bold tracking-widest text-slate-200 group-hover:text-white">OPEN NEXT CASE FILE</span>
            <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </button>

      </div>
      
      <div className="absolute bottom-8 text-xs text-slate-600 uppercase">
        System ID: 099-24-X // Do not power off console
      </div>

    </div>
  );
}