'use client';

import { TacticalFrame } from './TacticalFrame';

interface IdleScreenProps {
  onStart: () => void;
  highScore: number;
}

export function IdleScreen({ onStart, highScore }: IdleScreenProps) {
  return (
    <TacticalFrame title="LINK ESTABLISHED" color="zinc">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 tracking-widest">ENCRYPTION: AES-256 // SECURE</p>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            WERIS<span className="text-red-600">WARLOT</span>
          </h1>
        </div>

        <div className="py-4">
          <button 
            onClick={onStart}
            className="w-full py-4 border border-zinc-600 hover:border-red-500 hover:bg-red-500/10 hover:text-red-500 transition-all text-xl tracking-[0.3em] font-bold text-white group"
          >
            <span className="animate-pulse">INITIALIZE FEED</span>
          </button>
        </div>

        <div className="border-t border-zinc-800 pt-4 flex justify-between items-center text-xs">
          <span className="text-zinc-600">OPERATOR RANK</span>
          <span className="text-green-500 font-bold text-lg">{highScore.toString().padStart(6, '0')}</span>
        </div>
      </div>
    </TacticalFrame>
  );
}