"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Loader2 } from "lucide-react";

interface IntroSequenceProps {
  onComplete: () => void;
  name: string;
}

export default function IntroSequence({ onComplete, name }: IntroSequenceProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const sequences = [
    { text: "Establishing Neural Link...", duration: 2000 },
    { text: `Synchronizing with ${name}'s Consciousness...`, duration: 2500 },
    { text: "Decrypting Synaptic Pathways...", duration: 2000 },
    { text: "Neural Mapping Complete.", duration: 1500 },
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 0.5;
      });
    }, 50);

    const runSequence = async () => {
      for (let i = 0; i < sequences.length; i++) {
        setStep(i);
        await new Promise((r) => setTimeout(r, sequences[i].duration));
      }
      onComplete();
    };

    runSequence();
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-void flex flex-col items-center justify-center p-8 text-center"
    >
      {/* Background Neural Pulse */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{ 
          background: [
            "radial-gradient(circle at center, #7c3aed 0%, transparent 70%)",
            "radial-gradient(circle at center, #06b6d4 0%, transparent 70%)",
            "radial-gradient(circle at center, #7c3aed 0%, transparent 70%)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-md w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="w-24 h-24 rounded-3xl bg-surface/40 border border-white/10 flex items-center justify-center mx-auto relative overflow-hidden group">
             <div className="absolute inset-0 bg-accent-neural/20 animate-pulse" />
             <Brain className="w-12 h-12 text-accent-neural relative z-10" />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-12 flex flex-col items-center justify-center"
          >
            <span className="text-white font-clash font-semibold text-lg tracking-wider uppercase">
              {sequences[step].text}
            </span>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 space-y-4">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-accent-neural shadow-[0_0_15px_#7c3aed]"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-text-muted tracking-widest uppercase">
            <span>Progress: {Math.floor(progress)}%</span>
            <span>Bitrate: 2.4 GB/s</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex items-center justify-center gap-6"
        >
          <div className="flex flex-col items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mb-2" />
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Server Link</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-neural animate-pulse mb-2" />
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Cognitive Engine</span>
          </div>
        </motion.div>
      </div>

      {/* Decorative Text Scroller */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
        <div className="text-left">
           <p className="text-[10px] font-mono text-white/20 uppercase mb-1">SYSTEM_INIT_VER_4.02</p>
           <p className="text-[10px] font-mono text-white/20 uppercase">NEUROBLOOM_PROTO_ALPHA</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-mono text-white/20 uppercase">LATENCY: 12ms</p>
           <p className="text-[10px] font-mono text-white/20 uppercase">SYNC_MODE: FULL_CONSCIOUSNESS</p>
        </div>
      </div>
    </motion.div>
  );
}
