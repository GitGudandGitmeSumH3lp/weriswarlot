// utils/SoundSynth.ts

const AudioContextClass = (typeof window !== 'undefined') 
  ? (window.AudioContext || (window as any).webkitAudioContext) 
  : null;

let audioCtx: AudioContext | null = null;

// Initialize Context (Must be triggered by user interaction first)
export const initAudio = () => {
  if (!audioCtx && AudioContextClass) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx?.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const SoundSynth = {
  // 1. The Heartbeat (Low Thud)
  playHeartbeat: (intensity = 1) => {
    const ctx = initAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Low frequency thud (50Hz dropping to 0)
    osc.frequency.setValueAtTime(60 * intensity, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.1);
    
    // Envelope (Short attack, decay)
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  },

  // 2. The Scream (High Pitch Noise + Distortion)
  playScream: () => {
    const ctx = initAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Sawtooth for harshness
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1); // Scream up
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4); // Die down

    // Loud!
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  },

  // 3. Success Chime (Retro)
  playWin: () => {
    const ctx = initAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }
};