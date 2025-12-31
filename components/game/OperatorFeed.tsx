'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export function OperatorFeed() {
  // 1. Select the new FEED array
  const feed = useGameStore((state) => state.feed);
  const latest = feed[feed.length - 1]; // Get the newest message

  // Local state for typewriter effect
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (!latest) return;
    setDisplayedText('');
    let i = 0;
    const speed = 20; // ms per char

    const interval = setInterval(() => {
        setDisplayedText(latest.text.substring(0, i + 1));
        i++;
        if (i >= latest.text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [latest]);

  if (!latest) return null;

  // 2. Determine Color based on Source or Meta
  let colorClass = 'text-green-500'; // Default System
  let borderColor = 'border-green-900/30';

  if (latest.source === 'ERROR') {
      colorClass = 'text-red-500';
      borderColor = 'border-red-900/50';
  } else if (latest.source === 'VOICE') {
      colorClass = 'text-cyan-400';
      borderColor = 'border-cyan-900/30';
  } else if (latest.source === 'ANALYSIS') {
      // Check the Noir Logic (Valid vs Trash)
      // The store passes Hex Codes in 'meta' usually, but we can fallback to classes
      if (latest.meta === 'VALID') colorClass = 'text-amber-500'; // Gold for clues
      else if (latest.meta === 'TRASH') colorClass = 'text-slate-400'; // Gray for junk
      else colorClass = 'text-emerald-400'; // Default Analysis
  }

  return (
    <div className={`pointer-events-none absolute bottom-4 left-1/2 w-[600px] -translate-x-1/2 overflow-hidden rounded-sm border bg-slate-950/90 p-3 font-mono text-sm shadow-2xl backdrop-blur-sm ${borderColor}`}>
        {/* Header Line */}
        <div className="flex items-center justify-between pb-1 text-[10px] uppercase tracking-widest text-slate-500">
            <span>// {latest.source}_LOG.00{latest.id % 100}</span>
            <span>{latest.meta || 'LIVE'}</span>
        </div>

        {/* Content */}
        <div className={`leading-relaxed ${colorClass}`}>
            <span className="mr-2 animate-pulse opacity-50">{'>'}</span>
            {displayedText}
            <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-current align-middle opacity-70"></span>
        </div>
    </div>
  );
}