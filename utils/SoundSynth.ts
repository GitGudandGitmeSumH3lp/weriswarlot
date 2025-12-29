// utils/SoundSynth.ts

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

export const initAudio = () => {
    if (!audioCtx) {
        // Fallback for Safari/Webkit
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = 0.3; // Global Volume
            masterGain.connect(audioCtx.destination);
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
};

const createOscillator = (freq: number, type: OscillatorType, duration: number, startTime: number = 0) => {
    if (!audioCtx || !masterGain) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
    
    // Envelope to avoid popping
    gain.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start(audioCtx.currentTime + startTime);
    osc.stop(audioCtx.currentTime + startTime + duration + 0.1);
};

export const SoundSynth = {
    playClick: () => {
        if (!audioCtx) return;
        // High pitch "mech" click
        createOscillator(1200, 'square', 0.05);
        createOscillator(800, 'sawtooth', 0.02);
    },

    playReveal: () => {
        if (!audioCtx) return;
        // Mystery Chord (Diminished)
        createOscillator(440, 'sine', 0.5, 0);
        createOscillator(523.25, 'sine', 0.5, 0.1); // C5
        createOscillator(622.25, 'sine', 0.5, 0.2); // Eb5
    },

    playHeartbeat: (pitch = 1.0) => {
        if (!audioCtx) return;
        // Low thud
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(60 * pitch, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(masterGain!);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    },

    playError: () => {
        if (!audioCtx) return;
        // Low Buzz
        createOscillator(150, 'sawtooth', 0.2);
        createOscillator(145, 'sawtooth', 0.2); // Beating effect
    },

    playWin: () => {
        if (!audioCtx) return;
        // Victory Arpeggio
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            createOscillator(freq, 'square', 0.4, i * 0.1);
        });
    },

    playScream: () => {
        if (!audioCtx) return;
        // Noise buffer simulation via erratic frequency modulation
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(masterGain!);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    }
};