'use client';

import { TacticalFrame } from './TacticalFrame';

interface ResultScreenProps {
  type: 'VICTORY' | 'DEFEAT';
  reason?: string;
  onAction: () => void;
}

export function ResultScreen({ type, reason, onAction }: ResultScreenProps) {
  const isVictory = type === 'VICTORY';
  
  return (
    <TacticalFrame 
      title={isVictory ? 'MISSION SUCCESS' : 'SIGNAL LOST'} 
      color={isVictory ? 'green' : 'red'}
    >
      <div className="text-center space-y-6">
        <div className="py-4">
          <h2 className={`text-4xl font-black mb-2 ${isVictory ? 'text-white' : 'text-red-600'}`}>
            {isVictory ? 'TARGET SECURED' : 'MISSION FAILED'}
          </h2>
          {reason && (
             <p className="text-xs uppercase tracking-widest opacity-70 border-t border-white/10 pt-2 inline-block">
               CAUSE: {reason}
             </p>
          )}
        </div>

        <button 
          onClick={onAction}
          className={`w-full py-4 border ${isVictory ? 'border-green-600 text-green-400 hover:bg-green-900/30' : 'border-red-600 text-red-500 hover:bg-red-900/30'} font-bold uppercase tracking-widest transition-all`}
        >
          {isVictory ? 'Accept Next Contract' : 'Re-Initialize System'}
        </button>
      </div>
    </TacticalFrame>
  );
}