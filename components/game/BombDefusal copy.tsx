'use client';

import { useGameStore } from '@/store/gameStore';
import { useState } from 'react';

export function BombDefusal({ onResolve }: { onResolve: (success: boolean) => void }) {
   const bombArchetype = useGameStore((state) => state.bombArchetype);
   const [cutWires, setCutWires] = useState<Record<string, boolean>>({});
   const [processing, setProcessing] = useState(false);
   const safeColor = bombArchetype === 'planner' ? 'blue' : bombArchetype === 'cleaner' ? 'green' : 'red';

   const handleCut = (color: string) => {
       if (cutWires[color] || processing) return;
       setProcessing(true);
       setCutWires(prev => ({ ...prev, [color]: true }));

       setTimeout(() => {
           onResolve(color === safeColor);
           setProcessing(false);
       }, 400);
   };

   const getProfilerHint = (arch: string | null) => {
        if (arch === 'planner') return <span>PROFILE: <span className="text-blue-400">SYSTEMATIC</span>. FOLLOWS <span className="text-blue-400">BLUEPRINT</span>.</span>;
        if (arch === 'cleaner') return <span>PROFILE: <span className="text-green-400">PRAGMATIC</span>. SEEKS <span className="text-green-400">PURITY</span>.</span>;
        return <span>PROFILE: <span className="text-red-500">VOLATILE</span>. HIGH <span className="text-red-500">ENTROPY</span>.</span>;
   };

   return (
    <div 
        className="fixed inset-0 flex items-center justify-center pointer-events-none"
        style={{ 
            width: '800px',
            height: '600px',
            margin: '0 auto'
        }}
    >
      <div 
        className="relative flex flex-col pointer-events-auto select-none"
        style={{ 
            fontFamily: '"Press Start 2P", monospace',
            imageRendering: 'pixelated',
            filter: 'contrast(1.1)',
            maxWidth: '500px'
        }}
      >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .scanline {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(0, 0, 0, 0.05) 51%
          );
          background-size: 100% 4px;
          pointer-events: none;
          z-index: 1000;
        }
        
        .crt-flicker {
          animation: flicker 0.15s infinite;
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.97; }
        }
        
        .pixel-border {
          box-shadow: 
            0 0 0 2px #1a1a1a,
            0 0 0 4px #22c55e,
            0 0 20px rgba(34, 197, 94, 0.5),
            inset 0 0 30px rgba(0, 0, 0, 0.8);
        }
        
        .glitch {
          animation: glitch-anim 3s infinite;
        }
        
        @keyframes glitch-anim {
          0%, 90%, 100% { transform: translate(0); }
          91% { transform: translate(-1px, 1px); }
          93% { transform: translate(1px, -1px); }
          95% { transform: translate(0); }
        }
      `}</style>

      {/* CRT SCANLINES */}
      <div className="scanline"></div>

      {/* MAIN CONTAINER */}
      <div className="bg-black pixel-border relative overflow-hidden">
        {/* HEADER BAR */}
        <div className="border-b-4 border-black px-6 py-4 flex justify-between items-center relative" style={{ backgroundColor: '#15803d' }}>
          <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'linear-gradient(to bottom, #16a34a, #15803d)' }}></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-4 h-4 bg-red-500 animate-pulse shadow-lg" style={{ boxShadow: '0 0 10px #ef4444' }}></div>
            <span className="text-white text-[10px] tracking-wider">EXPLOSIVE DEVICE</span>
          </div>
          <div className="relative z-10 text-red-300 text-[10px] tracking-wider crt-flicker">
            ARMED
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="p-10 relative" style={{ 
          backgroundColor: '#14532d',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }}>
          
          {/* TIMER DISPLAY */}
          <div className="border-4 p-6 mb-8 relative" style={{ backgroundColor: '#052e16', borderColor: '#15803d' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #052e16 100%)' }}></div>
            <div className="text-center relative z-10">
              <div className="text-[12px] mb-3 tracking-widest" style={{ color: '#4ade80' }}>TIME REMAINING</div>
              <div className="text-5xl tracking-widest glitch font-bold" style={{ color: '#22c55e', textShadow: '2px 2px 0 #000, 0 0 20px #22c55e' }}>
                00:{(Math.random()*60).toFixed(0).padStart(2,'0')}
              </div>
            </div>
          </div>

          {/* WIRE SECTION */}
          <div className="border-4 p-8 mb-8 relative" style={{ backgroundColor: '#1c4532', borderColor: '#166534' }}>
            <div className="absolute top-2 left-2 right-2 h-[2px]" style={{ background: 'linear-gradient(to right, transparent, #4ade80, transparent)' }}></div>
            
            <div className="text-[10px] mb-6 tracking-widest text-center" style={{ color: '#86efac' }}>SELECT WIRE TO CUT</div>
            
            <div className="flex flex-col gap-8">
              {['red', 'blue', 'green'].map((color) => {
                const isCut = cutWires[color];
                const wireColor = color === 'red' ? '#dc2626' : color === 'blue' ? '#2563eb' : '#16a34a';
                const wireName = color.toUpperCase();
                
                return (
                  <div key={color} className="relative">
                    {/* WIRE LABEL */}
                    <div className="flex justify-between mb-3">
                      <span className="text-[10px] tracking-widest" style={{ color: wireColor }}>{wireName} WIRE</span>
                      <span className="text-[10px] text-zinc-600 tracking-widest">{isCut ? 'CUT' : 'INTACT'}</span>
                    </div>
                    
                    {/* WIRE DISPLAY */}
                    <div 
                      onClick={() => handleCut(color)}
                      className={`h-12 border-2 relative overflow-hidden ${isCut ? 'cursor-default' : 'cursor-crosshair hover:border-white'}`}
                      style={{ 
                        borderColor: isCut ? '#3f3f46' : wireColor,
                        backgroundColor: '#0f172a'
                      }}
                    >
                      {/* TERMINAL LEFT */}
                      <div className="absolute left-0 top-0 w-12 h-full border-r-2 flex items-center justify-center" style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}>
                        <div className="w-3 h-3 border" style={{ backgroundColor: '#ca8a04', borderColor: '#a16207' }}></div>
                      </div>
                      
                      {/* WIRE */}
                      <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-4 flex items-center justify-center">
                        {isCut ? (
                          <>
                            <div className="w-[45%] h-full border-2" style={{ 
                              backgroundColor: wireColor,
                              borderColor: color === 'red' ? '#991b1b' : color === 'blue' ? '#1e3a8a' : '#166534',
                              opacity: 0.4
                            }}></div>
                            <div className="w-[10%] h-full flex items-center justify-center">
                              <div className="text-red-500 text-lg leading-none">✕</div>
                            </div>
                            <div className="w-[45%] h-full border-2" style={{ 
                              backgroundColor: wireColor,
                              borderColor: color === 'red' ? '#991b1b' : color === 'blue' ? '#1e3a8a' : '#166534',
                              opacity: 0.4
                            }}></div>
                          </>
                        ) : (
                          <div className="w-full h-full border-2 relative" style={{ 
                            backgroundColor: wireColor,
                            borderColor: color === 'red' ? '#991b1b' : color === 'blue' ? '#1e3a8a' : '#166534',
                            boxShadow: `0 0 10px ${wireColor}80`
                          }}>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* TERMINAL RIGHT */}
                      <div className="absolute right-0 top-0 w-12 h-full border-l-2 flex items-center justify-center" style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}>
                        <div className="w-3 h-3 border" style={{ backgroundColor: '#ca8a04', borderColor: '#a16207' }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ANALYSIS SECTION */}
          <div className="border-4 p-6 relative" style={{ backgroundColor: '#422006', borderColor: '#92400e' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #78350f 0%, #422006 100%)' }}></div>
            <div className="relative z-10">
              <div className="text-[10px] mb-4 tracking-widest flex items-center gap-3" style={{ color: '#fbbf24' }}>
                <span className="inline-block w-3 h-3 animate-pulse" style={{ backgroundColor: '#fbbf24' }}></span>
                PSYCHOLOGICAL ANALYSIS
              </div>
              <div className="text-[10px] leading-relaxed tracking-wide" style={{ color: '#fde68a' }}>
                {getProfilerHint(bombArchetype)}
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER BAR */}
        <div className="border-t-4 border-black px-6 py-3 flex justify-between items-center" style={{ backgroundColor: '#166534' }}>
          <span className="text-[8px] tracking-widest" style={{ color: '#86efac' }}>SYS.v2.4.1</span>
          <span className="text-[8px] tracking-widest" style={{ color: '#86efac' }}>M112 BLOCK-IV</span>
        </div>
      </div>

      {/* CORNER DECORATIONS */}
      <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2" style={{ borderColor: '#22c55e' }}></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2" style={{ borderColor: '#22c55e' }}></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2" style={{ borderColor: '#22c55e' }}></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2" style={{ borderColor: '#22c55e' }}></div>
      </div>
    </div>
   );
}