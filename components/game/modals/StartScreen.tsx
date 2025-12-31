'use client';

import { useGameStore } from '@/store/gameStore';

export function StartScreen() {
  const startGame = useGameStore((state) => state.startGame);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 font-mono text-white backdrop-blur-sm">
      <div className="mb-8 text-center">
        <h1 className="text-6xl font-black tracking-tighter text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
          WERISWARLOT
        </h1>
        <p className="mt-2 text-sm tracking-[0.5em] text-slate-400">CONTEXT_CLEAN_V3.2</p>
      </div>

      <div className="w-full max-w-md space-y-4 border-l-2 border-slate-700 bg-slate-900/80 p-6">
        <div className="text-xs uppercase text-slate-500">Mission Briefing</div>
        <p className="text-sm leading-relaxed text-slate-300">
          Suspects are hiding in the plaza. Identify them. Gather evidence. 
          <br /><br />
          <span className="text-red-400">WARNING:</span> Arresting the suspect may trigger their contingency plans (Bombs, Poison). Choose wisely.
        </p>
      </div>

      <button
        onClick={startGame}
        className="group mt-8 relative flex items-center gap-4 border-2 border-amber-600 bg-amber-900/20 px-12 py-4 transition-all hover:bg-amber-600 hover:text-black"
      >
        <span className="text-xl font-bold tracking-widest">INITIATE SEQUENCE</span>
        <span className="animate-pulse text-amber-500 group-hover:text-black">_</span>
      </button>
    </div>
  );
}