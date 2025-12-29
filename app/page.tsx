import GameCanvas from '@/components/game/GameCanvas';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black">
      <h1 className="text-2xl font-mono text-red-600 mb-4 tracking-widest">
        SUBJECT: LAYERED_GENERATOR
      </h1>
      
      <GameCanvas />
      
      <div className="mt-4 text-xs text-neutral-600 font-mono">
        R.P.I. OS v1.0 // PHASE 3
      </div>
    </main>
  );
}