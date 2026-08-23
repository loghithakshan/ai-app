"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useMemo, useSyncExternalStore } from "react";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";

const MOOD_COLORS = {
  Neutral: "rgba(124, 58, 237, 0.1)",  // Purple
  Inspired: "rgba(245, 158, 11, 0.15)", // Gold
  Focused: "rgba(59, 130, 246, 0.15)",  // Blue
  Empathic: "rgba(236, 72, 153, 0.15)" // Rose
};

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function NeuralBackground() {
  const { isTyping } = useChatStore();
  const { stats } = useUserStore();
  const { scrollY } = useScroll();
  const isMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  const currentMood = stats.mood || 'Neutral';
  const moodColor = MOOD_COLORS[currentMood as keyof typeof MOOD_COLORS];

  // Responsive opacity and movement based on scroll
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 200]);

  // Generate deterministic floating particles for the "Neural Network" feel
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: ((i * 17) % 100 / 100) * 3 + 1,
      x: (i * 37) % 100,
      y: (i * 73) % 100,
      duration: ((i * 19) % 100 / 100) * 10 + 10,
      delay: ((i * 29) % 100 / 100) * 5,
    }));
  }, []);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-void">
      {/* Dynamic Gradient Core */}
      <motion.div 
        className="absolute inset-0 transition-colors duration-1000"
        animate={{
          background: isTyping 
            ? "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 70%)"
            : `radial-gradient(circle at 50% 50%, ${moodColor} 0%, transparent 70%)`
        }}
      />

      {/* Floating Synaptic Particles */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-accent-neural opacity-20 blur-[1px]"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <motion.div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", 
          backgroundSize: "60px 60px",
          y: backgroundY
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,16,0.8)_100%)]" />

      {/* Neural Surge Pulse (when AI is active) */}
      <AnimatePresence>
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-accent-synapse/5 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
