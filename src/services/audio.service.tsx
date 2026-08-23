"use client";

import { useEffect, useRef } from "react";

const getAudioContextClass = (): typeof AudioContext | null => {
  if (typeof window === "undefined") return null;
  return window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext || null;
};

export default function AudioService() {
  const contextRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    // We only initialize on first user interaction to satisfy browser policies
    const initAudio = () => {
      if (contextRef.current) return;

      const AudioCtx = getAudioContextClass();
      if (!AudioCtx) return;

      const context = new AudioCtx();
      contextRef.current = context;

      // Ambient Hum
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(55, context.currentTime); // Low A
      
      gainNode.gain.setValueAtTime(0.01, context.currentTime); // Very subtle
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.start();
      ambientRef.current = oscillator;
      
      console.log("Neural Audio Engine Synchronized");
      window.removeEventListener("click", initAudio);
    };

    window.addEventListener("click", initAudio);
    return () => window.removeEventListener("click", initAudio);
  }, []);

  return null;
}

export function useAudio() {
  const playPulse = () => {
    const AudioCtx = getAudioContextClass();
    if (!AudioCtx) return;
    
    const context = new AudioCtx();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, context.currentTime + 0.1);

    gain.gain.setValueAtTime(0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start();
    osc.stop(context.currentTime + 0.1);
  };

  const playClick = () => {
    const AudioCtx = getAudioContextClass();
    if (!AudioCtx) return;

    const context = new AudioCtx();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, context.currentTime + 0.05);

    gain.gain.setValueAtTime(0.04, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start();
    osc.stop(context.currentTime + 0.05);
  };

  const playDeepDive = () => {
    const AudioCtx = getAudioContextClass();
    if (!AudioCtx) return;

    const context = new AudioCtx();
    const osc = context.createOscillator();
    const gain = context.createGain();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(110, context.currentTime);
    osc.frequency.linearRampToValueAtTime(55, context.currentTime + 1.5);

    lfo.frequency.setValueAtTime(5, context.currentTime);
    lfoGain.gain.setValueAtTime(20, context.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, context.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start();
    lfo.start();
    osc.stop(context.currentTime + 1.5);
    lfo.stop(context.currentTime + 1.5);
  };

  const playDeepExit = () => {
    const AudioCtx = getAudioContextClass();
    if (!AudioCtx) return;

    const context = new AudioCtx();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(55, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, context.currentTime + 0.8);

    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start();
    osc.stop(context.currentTime + 0.8);
  };

  const playLevelUp = () => {
    const AudioCtx = getAudioContextClass();
    if (!AudioCtx) return;

    const context = new AudioCtx();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.5);

    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start();
    osc.stop(context.currentTime + 0.5);
  };

  return { playPulse, playClick, playLevelUp, playDeepDive, playDeepExit };
}
