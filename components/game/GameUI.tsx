'use client';

import { useGameStore } from '@/store/gameStore';
import { OperatorFeed } from './OperatorFeed';
import { ConfrontationScreen } from './modals/ConfrontationScreen';
import { LevelReport } from './modals/LevelReport';
import { StartScreen } from './modals/StartScreen'; // <--- IMPORT

export function GameUI() {
  const gameState = useGameStore((state) => state.gameState);
  const victimCount = useGameStore((state) => state.victimCount);
  const convictionScore = useGameStore((state) => state.convictionScore);
  const activeScenario = useGameStore((state) => state.activeScenario);
  const scenarioTimer = useGameStore((state) => state.scenarioTimer);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      
      {/* GLOBAL HUD (Visible unless in Start Screen) */}
      {gameState !== 'IDLE' && (
        <>
            {/* UI: VICTIM COUNT */}
            <div className="absolute left-4 top-4 font-mono pointer-events-auto">
                <div className="flex items-center gap-2 rounded-sm bg-black/80 px-3 py-1 text-red-600 border border-red-900/50 shadow-lg">
                <span className="text-xs uppercase tracking-widest text-red-900">DEATH TOLL</span>
                <span className="text-xl font-bold">{victimCount}</span>
                </div>
            </div>

            {/* UI: CONVICTION METER */}
            <div className="absolute right-4 top-4 w-48 font-mono pointer-events-auto">
                <div className="mb-1 flex justify-between text-[10px] uppercase text-slate-400 bg-black/50 px-1">
                    <span>Case Strength</span>
                    <span>{convictionScore}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 border border-slate-700">
                    <div 
                        className={`h-full transition-all duration-500 ${convictionScore > 80 ? 'bg-amber-500' : 'bg-slate-500'}`} 
                        style={{ width: `${convictionScore}%` }}
                    />
                </div>
            </div>
            
             {/* UI: FEED */}
             <OperatorFeed />
        </>
      )}

      {/* UI: SCENARIO TIMER */}
      {gameState === 'SCENARIO_ACTIVE' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto">
             <div className="animate-pulse text-4xl font-black text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] tracking-tighter bg-black/80 px-4 py-1 rounded-sm border border-red-600">
                00:{scenarioTimer.toString().padStart(2, '0')}
             </div>
             <div className="text-center text-xs text-red-500 font-bold tracking-[0.3em] mt-1 uppercase">
                {activeScenario} THREAT
             </div>
        </div>
      )}

      {/* MODALS */}
      <div className="pointer-events-auto">
        {gameState === 'IDLE' && <StartScreen />}
        {gameState === 'CONFRONTATION' && <ConfrontationScreen />}
        {gameState === 'LEVEL_COMPLETE' && <LevelReport />}
      </div>
      
    </div>
  );
}