import GameCanvas from '@/components/game/GameCanvas';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-10">
      
      {/* TITLE */}
      <h1 className="mb-6 font-mono text-xl tracking-[0.5em] text-neutral-700 opacity-50">
        WERISWARLOT
      </h1>
      
      {/* THE MONITOR FRAME */}
      <div className="relative group shadow-2xl">
        
        {/* 1. THE GAME (Bottom Layer) */}
        <GameCanvas />

        {/* 2. THE VISUAL EFFECTS LAYER (Top Overlay) */}
        {/* These sit ON TOP of the canvas but let clicks pass through */}
        <div className="absolute inset-0 pointer-events-none z-50 rounded-sm overflow-hidden border-4 border-neutral-800">
            {/* Scanlines */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]" />
            {/* Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />
            {/* Noise */}
            <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay">
                <svg className="h-full w-full"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>
            </div>
            {/* Screen Reflection/Glare (Subtle) */}
            <div className="absolute top-0 right-0 w-full h-1/3 bg-gradient-to-b from-white/5 to-transparent skew-y-3" />
        </div>

      </div>
      
      {/* FOOTER */}
      <div className="mt-8 flex flex-col items-center gap-1 text-[10px] font-mono text-neutral-800">
        <span>R.P.I. SYSTEM ONLINE</span>
        <span>SECURITY LEVEL: CLEARANCE_0</span>
      </div>
    </main>
  );
}