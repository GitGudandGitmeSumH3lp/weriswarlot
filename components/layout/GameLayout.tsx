import React from "react";

interface GameLayoutProps {
  children: React.ReactNode;
}

export const GameLayout = ({ children }: GameLayoutProps) => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-4">
      {/* The "TV Frame" - Constrains the game to a fixed aspect ratio */}
      <div className="relative w-[800px] h-[600px] bg-black shadow-2xl border border-neutral-800 rounded-sm overflow-hidden">
        {children}
      </div>
      
      {/* Footer / Meta Info */}
      <div className="mt-4 text-neutral-500 text-xs font-mono">
        WERISWARLOT v4.5.0 // SYSTEM READY
      </div>
    </main>
  );
};