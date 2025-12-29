'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAudio } from '@/hooks/useAudio'; 

export default function GameUI() {
  const { 
    gameState, timeLeft, bombTimer, score, tickTimer, 
    startGame, startMinigame, resolveMinigame, resetGame, 
    debugMode, toggleDebug, scanLog, setScanLog, foundKiller,
    panicLevel,
  } = useGameStore();

  useAudio(); 

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'PLAYING' || gameState === 'MINIGAME') {
      interval = setInterval(tickTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, tickTimer]);

  // Real-time Clock
  const [realTime, setRealTime] = useState('');
  useEffect(() => {
    const update = () => setRealTime(new Date().toISOString().replace('T', ' ').substring(0, 19));
    const i = setInterval(update, 1000); update();
    return () => clearInterval(i);
  }, []);

  const formattedTime = timeLeft.toString().padStart(2, '0');
  const formattedBombTime = bombTimer.toString().padStart(2, '0').replace('.', ':');

  return (
    // GRID LAYOUT (800x600 Fixed)
    <div 
      style={{ width: '800px', height: '600px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto 1fr auto' }}
      className="pointer-events-none font-mono tracking-widest text-white absolute top-0 left-0 p-6 z-10"
    >
      
      {/* --- ROW 1: TOP HUD --- */}
      
      {/* 1. TOP-LEFT: FEED INFO */}
      <div className="flex flex-col items-start justify-start gap-4">
        {gameState !== 'IDLE' && (
             <div className="bg-black/40 backdrop-blur-md border-l-4 border-red-500 px-3 py-2 text-xs shadow-lg pointer-events-auto">
                <div className="font-bold whitespace-nowrap text-red-500 animate-pulse">LIVE FEED // CAM_04</div>
                <div className="text-gray-400 text-[10px] mt-1">{realTime}</div>
             </div>
        )}
        <button onClick={toggleDebug} className={`pointer-events-auto text-[10px] px-2 py-1 border whitespace-nowrap transition-colors ${debugMode ? 'bg-red-900 border-red-500 hover:bg-red-800' : 'bg-black/50 border-white/20 text-white/50 hover:text-white'}`}>
            DEBUG_OVERRIDE: {debugMode ? 'ACTIVE' : 'STANDBY'}
        </button>
      </div>

      {/* 2. TOP-CENTER: MISSION TIMER */}
      <div className="flex justify-center items-start">
         {gameState !== 'IDLE' && (
            <div className="flex flex-col items-center bg-black/80 px-8 py-2 rounded-b-lg border-x border-b border-white/10 pointer-events-auto shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                <span className="text-[9px] text-neutral-500 mb-1 whitespace-nowrap tracking-[0.2em]">
                    {gameState === 'MINIGAME' ? 'TIME TO DETONATION' : 'PATROL WINDOW'}
                </span>
                <span className={`text-3xl font-bold font-mono ${gameState === 'MINIGAME' || timeLeft < 10 ? 'text-red-600 animate-pulse glitch-text' : 'text-white'}`}>
                    00:{gameState === 'MINIGAME' ? formattedBombTime : formattedTime}
                </span>
            </div>
         )}
      </div>

      {/* 3. TOP-RIGHT: STATUS */}
      <div className="flex flex-col items-end justify-start gap-2">
         {gameState !== 'IDLE' && (
            <>
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-white/10 pointer-events-auto">
                    <span className="animate-pulse text-red-500 text-xl">●</span>
                    <span className="font-bold text-xs text-red-500">RECORDING</span>
                </div>
                <div className="text-xs text-neutral-400 bg-black/20 px-2 py-1 rounded pointer-events-auto border border-white/5">
                    MERIT: <span className="text-white font-bold">{score}</span>
                </div>
            </>
         )}
      </div>


      {/* --- ROW 2: CENTER MODALS --- */}
      <div style={{ gridColumn: '1 / span 3' }} className="flex items-center justify-center pointer-events-none relative">
        <div className="pointer-events-auto">
            
            {/* IDLE: MISSION BRIEFING */}
            {gameState === 'IDLE' && (
                <div className="text-center space-y-8 bg-black/80 p-10 border-y-2 border-white/10 backdrop-blur-sm">
                    <div className="space-y-2">
                        <div className="text-red-500 text-[10px] tracking-[0.5em] animate-pulse">ENCRYPTED CONNECTION ESTABLISHED</div>
                        <h1 className="text-6xl font-black mb-2 drop-shadow-2xl tracking-tighter">WERISWARLOT</h1>
                        <div className="text-xs text-neutral-500 uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                            <p>Mission: Identify High-Value Target.</p>
                            <p>Warning: Subject is armed and volatile.</p>
                            <p>Collateral Damage: Not Authorized.</p>
                        </div>
                    </div>
                    <button 
                        onClick={startGame} 
                        className="group relative px-12 py-4 bg-white/5 border border-white/20 hover:bg-red-900/20 hover:border-red-500 transition-all duration-300"
                    >
                        <span className="text-xl tracking-[0.2em] group-hover:text-red-500 transition-colors">CONNECT TO FEED</span>
                        <div className="absolute inset-0 border border-white/0 group-hover:border-red-500/50 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    </button>
                </div>
            )}

            {/* FOUND: APPREHENSION */}
            {gameState === 'FOUND' && (
                <div className="bg-black/95 border-2 border-red-600 p-8 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                    <div className="flex justify-between items-center mb-6 border-b border-red-900 pb-2">
                        <h2 className="text-red-500 text-xs tracking-[0.2em]">POSITIVE MATCH</h2>
                        <span className="text-red-600 animate-pulse text-[10px]">THREAT LEVEL: CRITICAL</span>
                    </div>
                    <p className="text-lg mb-8 font-light text-white/90 leading-relaxed">
                      "Subject has been cornered. <br/>
                      <span className="text-red-500">Explosive signature detected.</span>"
                    </p>
                    <button onClick={startMinigame} className="w-full py-4 bg-white text-black font-black hover:bg-red-600 hover:text-white transition-colors uppercase tracking-[0.2em]">
                        Attempt Disarm
                    </button>
                </div>
            )}

            {/* MINIGAME: TENSION */}
            {gameState === 'MINIGAME' && <BombDefusal onResolve={resolveMinigame} />}

            {/* GAME OVER: FAILURE */}
            {(gameState === 'TIMEOUT' || gameState === 'GAME_OVER') && (
                <div className="bg-black/95 p-12 border border-red-900 text-center shadow-2xl">
                    <h1 className="text-6xl font-black text-red-600 tracking-[0.2em] mb-2 glitch-text">SIGNAL LOST</h1>
                    <p className="text-neutral-500 text-xs uppercase mb-8 tracking-widest">
                        {gameState === 'TIMEOUT' ? 'Target escaped surveillance net.' : 'Catastrophic event recorded.'}
                    </p>
                    <button onClick={resetGame} className="px-8 py-3 border border-red-800 text-red-500 hover:bg-red-900 hover:text-white uppercase tracking-widest text-xs transition-all">
                        Re-Initialize System
                    </button>
                </div>
            )}

            {/* VICTORY: REPORT */}
            {gameState === 'VICTORY' && (
                <div className="bg-black/95 p-12 border border-green-500/50 text-center shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                    <h1 className="text-5xl font-bold text-white tracking-[0.2em] mb-4">TARGET SECURED</h1>
                    <div className="mb-8 border-y border-green-900 py-4">
                        <p className="text-green-500 text-xl font-mono">PERFORMANCE RATING: S</p>
                        <p className="text-green-800 text-xs mt-1">MERIT POINTS AWARDED: {score}</p>
                    </div>
                    <button onClick={resetGame} className="px-8 py-3 bg-green-900/10 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black uppercase tracking-widest text-xs transition-all">
                        Accept New Contract
                    </button>
                </div>
            )}
        </div>
      </div>


      {/* --- ROW 3: BOTTOM HUD --- */}
      
      {/* 4. BOTTOM-LEFT: FORENSICS */}
      <div className="flex items-end justify-start">
        {gameState === 'PLAYING' && (
            <div className="bg-black/80 backdrop-blur-md border-l-4 border-yellow-500 p-4 shadow-xl transition-all hover:bg-black pointer-events-auto max-w-xs group">
                <div className="text-[9px] text-yellow-500 uppercase font-bold mb-2 flex items-center gap-2 tracking-widest">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"/>
                    Forensic Analyzer v2.0
                </div>
                <div className="text-[11px] text-white font-bold uppercase border-t border-white/10 pt-2 leading-relaxed group-hover:text-yellow-100 transition-colors">
                    {scanLog ? (
                         <span className="typing-effect">{scanLog}</span>
                    ) : (
                         <span className="text-white/30 italic">AWAITING BIOMETRIC INPUT...</span>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* 5. BOTTOM-CENTER (Empty) */}
      <div></div>

      {/* 6. BOTTOM-RIGHT: METADATA */}
      <div className="flex items-end justify-end text-right text-[9px] text-white/30 leading-loose">
          <div>
            PROTOCOL: SEARCH_DESTROY<br/>
            ISO 800 // F/2.8<br/>
            FRAME 60FPS
          </div>
      </div>

    </div>
  );
}

// BOMB COMPONENT (Refined Text)
// Helper to map archetype to wire color
const getWireLogic = (archetype: string | null): 'red' | 'blue' | 'green' => {
    if (!archetype) return 'red'; // Fallback
    
    const redness = ['artist', 'clown', 'kid_balloon', 'tourist', 'hipster'];
    const greenness = ['gardener', 'glutton', 'bodybuilder', 'human_elder'];
    const blueness = ['human_suit', 'human_punk', 'goth', 'cyclist', 'commuter', 'guitarist'];

    if (redness.some(t => archetype.includes(t))) return 'red';
    if (greenness.some(t => archetype.includes(t))) return 'green';
    if (blueness.some(t => archetype.includes(t))) return 'blue';
    return 'red';
};

function BombDefusal({ onResolve }: { onResolve: (success: boolean) => void }) {
   const debugMode = useGameStore((state) => state.debugMode);
   const killerArchetype = useGameStore((state) => state.killerArchetype);
   
   // Logic: The safe wire depends on the killer we just caught
   const safeColor = getWireLogic(killerArchetype);

   return (
    <div className="bg-black/95 border-2 border-red-600 p-8 text-center max-w-md w-full relative overflow-hidden">
      {/* Background Warning Stripes */}
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ff0000_10px,#ff0000_20px)]"></div>
      
      <div className="relative z-10">
        <div className="mb-2 text-red-500 font-bold animate-pulse tracking-[0.2em] text-xs border-b border-red-900 pb-2">
            IED ACTIVE // TAMPER PROTECTION
        </div>
        
        {/* NEW: Narrative Hint */}
        <div className="mb-6 text-gray-400 text-xs font-mono uppercase">
            TARGET IDENTITY: <span className="text-white font-bold">{killerArchetype?.replace('human_', '').toUpperCase() || 'UNKNOWN'}</span>
            <br/>
            <span className="text-[10px] text-gray-600">
                (RED: Chaos/Art | GREEN: Nature/Physique | BLUE: Order/Urban)
            </span>
        </div>

        <div className="grid grid-cols-3 gap-4 h-24">
            {['red', 'blue', 'green'].map((color) => (
            <button key={color} onClick={() => onResolve(color === safeColor)} 
                className={`group relative h-full w-full border-b-4 transition-all hover:opacity-100 opacity-80 ${color === 'red' ? 'bg-red-900/40 border-red-600' : color === 'blue' ? 'bg-blue-900/40 border-blue-600' : 'bg-green-900/40 border-green-600'}`}>
                
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest text-white/50 group-hover:text-white">
                    CUT
                </span>

                {debugMode && color === safeColor && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] bg-white text-black px-2 font-bold z-20">
                        SAFE
                    </span>
                )}
            </button>
            ))}
        </div>
      </div>
    </div>
   );
}