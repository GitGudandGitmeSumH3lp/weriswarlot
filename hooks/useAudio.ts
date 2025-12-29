// hooks/useAudio.ts
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { SoundSynth, initAudio } from '@/utils/SoundSynth';

export function useAudio() {
  const gameState = useGameStore(s => s.gameState);
  const timeLeft = useGameStore(s => s.timeLeft);
  const score = useGameStore(s => s.score);
  
  const lastBeatTime = useRef(0);
  const initialized = useRef(false);

  // 1. Unlock Audio Context on first interaction
  useEffect(() => {
    const unlock = () => {
      if (!initialized.current) {
        initAudio();
        initialized.current = true;
      }
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, []);

  // 2. Heartbeat Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    // Calculate BPM based on time left
    // 30s left = Slow (1000ms delay)
    // 5s left = Panic (300ms delay)
    const panicFactor = Math.max(0, (30 - timeLeft) / 30); // 0.0 to 1.0
    const delay = 1000 - (panicFactor * 700); 

    const interval = setInterval(() => {
       SoundSynth.playHeartbeat(1 + panicFactor); // Louder/Higher pitch as panic rises
    }, delay);

    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // 3. Event Sounds
  useEffect(() => {
    if (gameState === 'TIMEOUT') {
      SoundSynth.playScream();
    }
    if (gameState === 'FOUND') {
      SoundSynth.playWin();
    }
  }, [gameState]);

  // Return nothing, this is a logic hook
}