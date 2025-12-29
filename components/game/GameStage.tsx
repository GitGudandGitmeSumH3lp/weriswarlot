'use client';

import { Application } from '@pixi/react';
import './PixiSetup'; 
import { useState, useEffect } from 'react';
import World from './World';

// Note: NO useGameStore import here. 
// This component must remain static to prevent the Pixi Application from reloading.

const WIDTH = 800;
const HEIGHT = 600;

export default function GameStage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // We use React.memo logic implicitly by not having any props or state that changes
  return (
    <div className="border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl">
      <Application 
        width={WIDTH} 
        height={HEIGHT} 
        backgroundColor={0x000000} 
        antialias={false}
      >
        <World />
      </Application>
    </div>
  );
}