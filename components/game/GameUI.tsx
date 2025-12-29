
'use client';

import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';

// --- 1. HELPER: SMART BOMB LOGIC ---
const getWireLogic = (archetype: string | null): 'red' | 'blue' | 'green' => {
    if (!archetype) return 'red'; 
    const redness = ['artist', 'clown', 'kid_balloon', 'tourist', 'hipster'];
    const greenness = ['gardener', 'glutton', 'bodybuilder', 'human_elder'];
    const blueness = ['human_suit', 'human_punk', 'goth', 'cyclist', 'commuter', 'guitarist'];

    if (redness.some(t => archetype.includes(t))) return 'red';
    if (greenness.some(t => archetype.includes(t))) return 'green';
    if (blueness.some(t => archetype.includes(t))) return 'blue';
    return 'red';
};

// [NEW] Helper for Profiler Text
const getProfilerHint = (arch: string | null) => {
    if (arch === 'planner') return "SUBJECT PSYCHOLOGY: Obsessive attention to detail. Adheres to rigid schedules. Dislikes deviation."; // Hint: Blue (Order)
    if (arch === 'cleaner') return "SUBJECT PSYCHOLOGY: Erases tracks. Pruning weak links. Prioritizes biological/organic purity."; // Hint: Green (Nature/Clean)
    return "SUBJECT PSYCHOLOGY: Impulsive. High entropy. Prone to outbursts and messy execution."; // Hint: Red (Chaos)
};

// --- 2. COMPONENT: BOMB INTERFACE ---
function BombDefusal({ onResolve }: { onResolve: (success: boolean) => void }) {
   const bombArchetype = useGameStore((state) => state.bombArchetype);
   
   // Logic: 
   // Planner (Order) -> Blue
   // Cleaner (Nature) -> Green
   // Chaotic (Mess) -> Red
   const safeColor = bombArchetype === 'planner' ? 'blue' : bombArchetype === 'cleaner' ? 'green' : 'red';

   return (
    <div className="bg-black/90 border-4 border-gray-800 p-6 max-w-md w-full relative shadow-2xl pointer-events-auto flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full border-b border-gray-700 pb-2 mb-4 flex justify-between items-end">
        <span className="text-red-500 font-bold animate-pulse text-xs tracking-[0.2em]">ACTIVE CIRCUIT</span>
        <span className="text-gray-500 text-[10px]">MODULAR DEFUSAL</span>
      </div>

      {/* PROFILER HINT */}
      <div className="bg-gray-900/50 p-3 mb-6 w-full text-[10px] text-gray-300 font-mono border-l-2 border-yellow-600">
        <span className="text-yellow-600 font-bold">PROFILER NOTE:</span><br/>
        {getProfilerHint(bombArchetype)}
      </div>

      {/* WIRES (Visual SVG) */}
      <div className="relative w-64 h-32 bg-black border-2 border-gray-700 rounded mb-4 shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
        {/* Background Circuitry Texture */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,green,transparent_2px)] bg-[length:10px_10px]"></div>

        {['red', 'blue', 'green'].map((color, i) => {
            const yPos = 30 + (i * 30);
            return (
                <div key={color} className="absolute w-full left-0 group" style={{ top: yPos }}>
                     {/* The Wire (SVG) */}
                     <svg className="absolute top-0 left-0 w-full h-10 pointer-events-none drop-shadow-md overflow-visible">
                        <path 
                            d={`M 10,5 C 50,${20 + (i*10)} 150,${-10 - (i*5)} 240,5`} 
                            stroke={color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : '#22c55e'} 
                            strokeWidth="4" 
                            fill="none"
                            className="group-hover:stroke-white transition-colors duration-75"
                        />
                     </svg>
                     
                     {/* The Cut Interaction Zone (Invisible Button over wire) */}
                     <button 
                        onClick={() => onResolve(color === safeColor)}
                        className="absolute left-[40%] -top-2 w-12 h-12 bg-transparent hover:bg-white/10 rounded-full border border-transparent hover:border-white/50 flex items-center justify-center transition-all cursor-crosshair z-20"
                     >
                        <span className="text-[8px] uppercase bg-black text-white px-1 opacity-0 group-hover:opacity-100 transform -translate-y-4 transition-all">
                            CUT
                        </span>
                     </button>
                </div>
            )
        })}
      </div>
      
      <div className="text-[9px] text-gray-600 uppercase tracking-widest">
        Select wire to sever connection
      </div>
    </div>
   );
}

// --- 3. MAIN COMPONENT: GAME UI ---
export default function GameUI() {
  const gameState = useGameStore((state) => state.gameState);
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const timeLeft = useGameStore((state) => state.timeLeft);
  const level = useGameStore((state) => state.level);
  const scanLog = useGameStore((state) => state.scanLog);
  const debugMode = useGameStore((state) => state.debugMode);
  const captureSuspect = useGameStore((state) => state.captureSuspect);
  
  // Stats for Report
  const bombTimer = useGameStore((state) => state.bombTimer);
  const evidenceCount = useGameStore((state) => state.evidenceCount);
  const mistakeCount = useGameStore((state) => state.mistakeCount);

  const startGame = useGameStore((state) => state.startGame);
  const triggerBombPhase = useGameStore((state) => state.triggerBombPhase);  
  const resolveMinigame = useGameStore((state) => state.resolveMinigame);
  const resetGame = useGameStore((state) => state.resetGame);
  const nextLevel = useGameStore((state) => state.nextLevel);
  const toggleDebug = useGameStore((state) => state.toggleDebug);

  const [realTime, setRealTime] = useState('');

  // Clock for "Live Feed"
  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        setRealTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* 
     --- CHANGE LOG (Step 1: Cleanup) ---
     REMOVED: The useEffect that contained setTimeout(() => startMinigame(), 19000).
     REASON: This timer forced the player into the minigame automatically. 
             We now rely entirely on the player clicking "Wait... Something's Wrong".
  */

  const formattedTime = timeLeft.toString().padStart(2, '0');
  const formattedBombTime = bombTimer.toFixed(1);

  return (
    // GRID LAYOUT (800x600 Fixed)
    <div 
      style={{ width: '800px', height: '600px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto 1fr auto' }}
      className="pointer-events-none font-mono tracking-widest text-white absolute top-0 left-0 p-6 z-10 select-none"
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
                    LEVEL: <span className="text-white font-bold">{level}</span>
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
                        <h1 className="text-6xl font-black mb-2 drop-shadow-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                            WERISWARLOT
                        </h1>
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
                    {/* Career Score Display */}
                    <div className="mt-6 border-t border-white/10 pt-4">
                        <div className="text-[10px] text-gray-500 tracking-widest uppercase">
                            OPERATOR RECORD
                        </div>
                        <div className="text-2xl font-bold text-green-500 font-mono">
                            {highScore} PTS
                        </div>
                    </div>  
                </div>
            )}

            {/* FOUND: THE CHOICE (Branching Path) */}
            {gameState === 'FOUND' && (
                <div className="bg-black/95 border-2 border-red-600 p-8 max-w-md w-full shadow-[0_0_100px_rgba(220,38,38,0.4)] pointer-events-auto">
                    {/* ... (Header content unchanged) ... */}

                    <div className="flex flex-col gap-4">
                        {/* OPTION A (Unchanged) */}
                        <button 
                            onClick={captureSuspect}
                            className="w-full py-4 border border-red-900 text-red-500 hover:bg-red-900/20 hover:text-red-400 transition-colors uppercase tracking-[0.2em] text-xs"
                        >
                            Take Him In (Secure Target)
                        </button>

                        {/* OPTION B: UPDATED ACTION */}
                        <button 
                            onClick={triggerBombPhase} // <--- CHANGED from startMinigame
                            className="w-full py-4 bg-red-600 text-black font-black hover:bg-white hover:text-black transition-colors uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(255,0,0,0.5)]"
                        >
                            Wait... Something's Wrong
                        </button>
                    </div>
                </div>
            )}

            {/* MINIGAME: TENSION */}
            {gameState === 'MINIGAME' && <BombDefusal onResolve={resolveMinigame} />}

            {/* GAME OVER: THE REGRET */}
            {(gameState === 'TIMEOUT' || gameState === 'GAME_OVER') && (
                <div className="bg-black/95 p-12 border border-red-900 text-center shadow-2xl pointer-events-auto">
                    <h1 className="text-6xl font-black text-red-600 tracking-[0.2em] mb-2 glitch-text">
                        {useGameStore.getState().gameOverReason === 'CAPTURE' ? 'CASE CLOSED' : 'SIGNAL LOST'}
                    </h1>
                    
                    <p className="text-white text-lg mb-8 max-w-md mx-auto italic font-serif leading-relaxed">
                        {/* Dynamic Regret Text */}
                        {useGameStore.getState().gameOverReason === 'CAPTURE' && 
                            "You got him. The paperwork is filed. But the ticking never stopped."}
                        {useGameStore.getState().gameOverReason === 'BOMB' && 
                            "You hesitated. The wire was cut. The silence was louder than the explosion."}
                        {useGameStore.getState().gameOverReason === 'TIMEOUT' && 
                            "He vanished into the crowd. You were looking right at him."}
                        {!useGameStore.getState().gameOverReason && "Mission Failed."}
                    </p>

                    <button onClick={resetGame} className="px-8 py-3 border border-red-800 text-red-500 hover:bg-red-900 hover:text-white uppercase tracking-widest text-xs transition-all">
                        {useGameStore.getState().gameOverReason === 'CAPTURE' ? 'Re-Examine Evidence' : 'Re-Initialize System'}
                    </button>
                </div>
            )}

            {/* VICTORY: MISSION REPORT (Merged Logic) */}
            {gameState === 'VICTORY' && (
                <div className="bg-black/95 border border-green-500/50 p-8 w-full max-w-md relative overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.05)_50%)] bg-[length:100%_4px] pointer-events-none"></div>

                    <h1 className="text-4xl font-bold text-white tracking-[0.2em] mb-4 text-center">TARGET SECURED</h1>
                    
                    <div className="space-y-3 text-xs mb-8 font-bold font-mono">
                        {/* 1. SPEED */}
                        <div className="flex justify-between items-center text-green-300 border-b border-green-900/50 pb-1">
                            <span>DEFUSAL SPEED ({bombTimer.toFixed(1)}s)</span>
                            <span>+{Math.floor(bombTimer * 100)} PTS</span>
                        </div>
                        {/* 2. EVIDENCE */}
                        <div className="flex justify-between items-center text-blue-300 border-b border-blue-900/50 pb-1">
                            <span>EVIDENCE ({evidenceCount})</span>
                            <span>+{evidenceCount * 250} PTS</span>
                        </div>
                        {/* 3. MISTAKES */}
                        {mistakeCount > 0 && (
                            <div className="flex justify-between items-center text-red-400 border-b border-red-900/50 pb-1">
                                <span>ERRORS ({mistakeCount})</span>
                                <span>-{mistakeCount * 50} PTS</span>
                            </div>
                        )}
                        
                        {/* TOTAL */}
                        <div className="flex justify-between items-center text-lg text-white mt-4 pt-2 border-t border-white/20">
                            <span>ROUND RATING</span>
                            <span className="text-green-400">
                                {Math.max(0, (bombTimer * 100) + (evidenceCount * 250) - (mistakeCount * 50))} PTS
                            </span>
                        </div>
                    </div>

                    <div className="text-center text-[10px] text-green-600 mb-6 uppercase tracking-widest">
                        Total Career Score: {score}
                    </div>

                    <button onClick={nextLevel} className="w-full py-4 bg-green-900/20 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black uppercase tracking-widest text-xs transition-all font-bold">
                        Accept Next Contract
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