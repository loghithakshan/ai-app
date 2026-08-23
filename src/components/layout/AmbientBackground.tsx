"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useSyncExternalStore } from "react";
import { useChatStore } from "@/store/chatStore";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function AmbientBackground() {
  const { isTyping } = useChatStore();
  const isMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  // Generate particles deterministically
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: ((i * 13) % 100 / 100) * 2 + 1,
      x: (i * 41) % 100,
      y: (i * 67) % 100,
      duration: ((i * 23) % 100 / 100) * 15 + 15,
      delay: ((i * 31) % 100 / 100) * 5,
    }));
  }, []);

  if (!isMounted) return <div className="fixed inset-0 bg-void z-0" />;

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
