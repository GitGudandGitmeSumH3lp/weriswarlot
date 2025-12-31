'use client';

import { TacticalFrame } from './TacticalFrame';

interface FoundScreenProps {
  onCapture: () => void;
  onWait: () => void;
}

export function FoundScreen({ onCapture, onWait }: FoundScreenProps) {
  return (
    <TacticalFrame title="TARGET ACQUIRED" color="red" className="animate-shake">
      <div className="text-center space-y-4">
        <p className="text-red-400/80 text-sm mb-4">
          POSITIVE ID CONFIRMED. AWAITING ORDERS.
        </p>

        <div className="flex flex-col gap-3">
          {/* PRIMARY ACTION */}
          <button 
            onClick={onCapture}
            className="w-full py-4 bg-red-600 text-black font-black hover:bg-white hover:text-black transition-colors uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(220,38,38,0.5)]"
          >
            EXECUTE WARRANT
          </button>
          
          {/* SECONDARY ACTION */}
          <button 
            onClick={onWait}
            className="w-full py-3 border border-amber-600/50 text-amber-500 hover:bg-amber-900/20 hover:text-amber-300 uppercase tracking-widest text-sm"
          >
            Wait... Something's Wrong
          </button>
        </div>
      </div>
    </TacticalFrame>
  );
}