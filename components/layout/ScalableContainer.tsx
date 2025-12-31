'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ScalableContainerProps {
  children: ReactNode;
}

export default function ScalableContainer({ children }: ScalableContainerProps) {
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const targetW = 800;
      const targetH = 600;
      
      const scaleX = window.innerWidth / targetW;
      const scaleY = window.innerHeight / targetH;
      
      // Use 95% of the smallest dimension to ensure it fits with a margin
      const newScale = Math.min(scaleX, scaleY) * 0.95; 
      setScale(newScale); 
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  return (
    // Outer Wrapper: Full Screen
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-zinc-950">
      
      {/* Inner Game Box: Absolute Centered + Scaled */}
      <div 
        style={{ 
          width: 800, 
          height: 600, 
          position: 'absolute',
          top: '50%',
          left: '50%',
          // The Magic Formula: Center it, THEN scale it
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          boxShadow: '0 0 50px rgba(0,0,0,0.8)' // Nice shadow for cinematic feel
        }}
        className="bg-black relative"
      >
        {children}
      </div>

      {/* Portrait Warning Overlay */}
      <div className="portrait-warning fixed inset-0 z-[999] bg-black hidden flex-col items-center justify-center text-red-500 font-mono">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl uppercase tracking-widest">Rotate Device</h1>
      </div>
    </div>
  );
}