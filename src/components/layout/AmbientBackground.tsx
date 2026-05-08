"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "@/store/chatStore";

export default function AmbientBackground() {
  const { isTyping } = useChatStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate particles
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 15 + 15,
      delay: Math.random() * 5,
    }));
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-void z-0" />;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-void">
      {/* Background Orbs */}
      <motion.div
        className="absolute inset-0 transition-all duration-1000"
        animate={{
          background: isTyping 
            ? "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 80%)"
            : "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.06) 0%, transparent 80%)"
        }}
      />

      {/* Floating Synaptic Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent-neural opacity-10 blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.05, 0.2, 0.05],
            scale: [1, 2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{ 
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", 
          backgroundSize: "64px 64px"
        }}
      />

      {/* Noise Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-100" />

      {/* Reaction Overlay */}
      <AnimatePresence>
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-accent-synapse/[0.03] backdrop-blur-[1px]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
