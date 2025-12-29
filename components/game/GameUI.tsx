'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAudio } from '@/hooks/useAudio'; // Assuming this hook exists based on previous context

export default function GameUI() {
  const { 
    gameState, 
    timeLeft, 
    bombTimer,
    score, 
    tickTimer, 
    startGame,
    startMinigame,
    resolveMinigame,
    resetGame,
    debugMode,   // <--- Get state
    toggleDebug

  } = useGameStore();

  // We presume useAudio handles bgm/sfx based on gameState
  useAudio(); 


  // Timer Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'PLAYING' || gameState === 'MINIGAME') {
      interval = setInterval(tickTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, tickTimer]);

  const formattedTime = timeLeft.toString().padStart(2, '0');
  const formattedBombTime = bombTimer.toString().padStart(2, '0').replace('.', ':');



  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col font-mono tracking-widest text-white selection:bg-red-900">
      {/* --- NEW: DEBUG TOGGLE SWITCH --- */}
      {/* Placed in top-left, interactive */}
      <div className="absolute top-2 left-2 pointer-events-auto z-50">
        <button 
          onClick={toggleDebug}
          className={`px-2 py-1 text-[10px] border ${
            debugMode ? 'bg-red-900 border-red-500 text-white' : 'bg-black border-gray-700 text-gray-500'
          }`}
        >
          DEBUG: {debugMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* --- NAVBAR HUD --- */}
      {(gameState === 'PLAYING' || gameState === 'MINIGAME' || gameState === 'FOUND') && (
        <nav className="w-full h-14 bg-black/90 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-sm pointer-events-auto transition-colors duration-500"
             style={{ borderColor: gameState === 'MINIGAME' ? 'red' : 'rgba(255,255,255,0.1)' }}
        >
            {/* Left: Time */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-600">
                  {gameState === 'MINIGAME' ? 'DETONATION_IN' : 'TIME_REM'}
                </span>
                <span className={`text-xl font-bold ${
                  gameState === 'MINIGAME' ? 'text-red-600 animate-pulse' : 
                  timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'
                }`}>
                    :{gameState === 'MINIGAME' ? formattedBombTime : formattedTime}
                </span>
            </div>

            {/* Center: Status */}
            <div className="hidden sm:block text-[10px] text-neutral-800">
                {gameState === 'MINIGAME' ? 'CRITICAL_FAILURE_IMMINENT' : 'LIVE_FEED // CAM_04'}
            </div>

            {/* Right: Score */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-600">CONFIRMED</span>
                <span className="text-xl font-bold text-white">
                    {score.toString().padStart(4, '0')}
                </span>
            </div>
        </nav>
      )}

      {/* --- CENTER SCREEN MODALS --- */}
      <div className="flex-grow flex items-center justify-center pointer-events-auto p-4">
        
        {/* 1. DIALOGUE MODE */}
        {gameState === 'FOUND' && (
          <div className="max-w-xl w-full bg-black border-2 border-white p-6 shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)] animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-red-600 text-sm mb-4">SUSPECT IDENTIFIED</h2>
            <p className="text-xl leading-relaxed mb-8 typing-effect">
              "You have good eyes, Detective. But are your hands steady enough?"
            </p>
            <button 
              onClick={startMinigame}
              className="w-full py-4 bg-white text-black font-bold hover:bg-red-600 hover:text-white transition-colors uppercase"
            >
              Attempt Disarm
            </button>
          </div>
        )}

        {/* 2. BOMB DEFUSAL MINIGAME */}
        {gameState === 'MINIGAME' && (
          <BombDefusal onResolve={resolveMinigame} />
        )}

        {/* 3. GAME OVER (TIMEOUT or EXPLOSION) */}
        {(gameState === 'TIMEOUT' || gameState === 'GAME_OVER') && (
          <div className="text-center space-y-6 animate-in zoom-in duration-300 bg-black/90 p-12 border border-red-900">
            <h1 className="text-6xl font-black text-red-600 tracking-[0.2em] glitch-text">
              {gameState === 'GAME_OVER' ? 'K.I.A.' : 'LOST'}
            </h1>
            <div className="space-y-4">
              <p className="text-neutral-500 text-xs uppercase">
                {gameState === 'GAME_OVER' ? 'Explosive device detonated.' : 'Target escaped containment.'}
              </p>
              <button 
                onClick={resetGame}
                className="px-8 py-3 border border-red-900 text-red-600 hover:bg-red-900 hover:text-white transition-all uppercase text-sm"
              >
                Reboot System
              </button>
            </div>
          </div>
        )}

        {/* 4. VICTORY */}
        {gameState === 'VICTORY' && (
          <div className="text-center space-y-6 animate-in fade-in duration-500 bg-black/90 p-12 border border-green-500/50">
            <h1 className="text-5xl font-bold text-white tracking-[0.2em]">THREAT NEUTRALIZED</h1>
            <div className="space-y-4">
              <p className="text-green-500 text-xl">+ {score} PTS</p>
              <button 
                onClick={resetGame}
                className="px-8 py-3 bg-green-900/20 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-all uppercase text-sm"
              >
                Next Assignment
              </button>
            </div>
          </div>
        )}
        
        {/* 5. TITLE SCREEN */}
        {gameState === 'IDLE' && (
          <div className="text-center max-w-lg space-y-12">
            <div className="space-y-2">
              <div className="text-red-600 text-xs mb-4 animate-pulse">Incoming Transmission...</div>
              <h1 className="text-6xl font-bold tracking-tighter">WERISWARLOT</h1>
              <div className="w-16 h-1 bg-white/20 mx-auto my-6"></div>
              <p className="text-xs text-neutral-500 leading-relaxed uppercase tracking-widest">
                Identify the anomaly.<br/>
                Disarm the threat.<br/>
                Survive.
              </p>
            </div>
            
            <button 
              onClick={startGame}
              className="group relative px-12 py-4 bg-transparent overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-white/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
              <span className="relative text-xl text-white group-hover:text-red-500 transition-colors border-b border-white/20 pb-2">
                INITIATE SEARCH
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: BOMB LOGIC ---
function BombDefusal({ onResolve }: { onResolve: (success: boolean) => void }) {
   const debugMode = useGameStore((state) => state.debugMode);
   
  // 1. Pre-determine the safe wire on mount so we can show a debug hint
  const [safeColor] = useState(() => {
    const colors = ['red', 'blue', 'green'];
    return colors[Math.floor(Math.random() * colors.length)];
  });

  const handleCut = (color: string) => {
    // 2. Deterministic Win/Loss based on the pre-selected safe color
    if (color === safeColor) {
      onResolve(true);
    } else {
      onResolve(false);
    }
  };

  return (
    <div className="bg-black/95 border-2 border-red-600 p-8 text-center max-w-md w-full">
      <div className="mb-6 uppercase tracking-widest text-red-500 animate-pulse">
        Explosive Device Detected
      </div>
      <div className="grid grid-cols-3 gap-4 h-32">
        {['red', 'blue', 'green'].map((color) => (
          <button
            key={color}
            onClick={() => handleCut(color)}
            className={`
              relative flex flex-col items-center justify-end pb-2
              h-full w-full border-b-4 transition-all hover:h-[90%]
              ${color === 'red' ? 'bg-red-900 border-red-600' : ''}
              ${color === 'blue' ? 'bg-blue-900 border-blue-600' : ''}
              ${color === 'green' ? 'bg-green-900 border-green-600' : ''}
            `}
          >
            {/* --- CONDITIONAL HINT --- */}
            {debugMode && color === safeColor && (
              <span className="absolute top-2 text-[10px] bg-white text-black px-1 font-bold animate-bounce z-10">
                SAFE
              </span>
            )}
            <span className="sr-only">{color}</span>
          </button>
        ))}
      </div>
    </div>
  );
}