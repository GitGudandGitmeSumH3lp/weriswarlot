'use client';

import { ReactNode } from 'react';

interface TacticalFrameProps {
  title: string;
  children: ReactNode;
  color?: 'red' | 'green' | 'amber' | 'zinc';
  className?: string;
}

export function TacticalFrame({ title, children, color = 'zinc', className = '' }: TacticalFrameProps) {
  // Map colors to Tailwind classes
  const colors = {
    red: 'border-red-600 text-red-500 bg-red-950/90',
    green: 'border-green-500 text-green-400 bg-green-950/90',
    amber: 'border-amber-500 text-amber-500 bg-amber-950/90',
    zinc: 'border-zinc-500 text-zinc-400 bg-zinc-950/90',
  };

  const borderColor = colors[color].split(' ')[0];
  const textColor = colors[color].split(' ')[1];
  const bgColor = colors[color].split(' ')[2];

  return (
    <div className={`relative p-8 border-y-2 ${borderColor} ${bgColor} backdrop-blur-md shadow-2xl max-w-lg w-full ${className}`}>
      
      {/* DECORATION: Corner Brackets */}
      <div className={`absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 ${borderColor}`} />
      <div className={`absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 ${borderColor}`} />
      <div className={`absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 ${borderColor}`} />
      <div className={`absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 ${borderColor}`} />

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-2">
        <h2 className={`text-2xl font-black tracking-[0.2em] ${textColor}`}>{title}</h2>
        <span className="text-[10px] opacity-50 font-mono">SYS_VER_3.0.1</span>
      </div>

      {/* CONTENT */}
      <div className="font-mono">
        {children}
      </div>
    </div>
  );
}