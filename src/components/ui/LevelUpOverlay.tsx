"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function LevelUpOverlay() {
  const { level, stage } = useUserStore();
  const [seenLevel, setSeenLevel] = useState(level);
  const [dismissed, setDismissed] = useState(false);

  if (level > seenLevel) {
    setSeenLevel(level);
    setDismissed(false);
  }

  const show = !dismissed && level > 1 && level === seenLevel;

  const particles = useMemo(() => {
    // Static pseudo-random numbers to keep render pure
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: ((i * 37) % 100 / 100 - 0.5) * 380,
      y: ((i * 73) % 100 / 100 - 0.5) * 380,
      scale: ((i * 19) % 100 / 100) * 2.5 + 0.5,
      duration: ((i * 43) % 100 / 100) * 1.5 + 0.8,
      repeatDelay: ((i * 29) % 100 / 100) * 2,
    }));
  }, []);

  const STAGE_COLORS: Record<string, string> = {
    NEWBORN: "#ec4899", TODDLER: "#f59e0b", CHILD: "#10b981",
    TEEN: "#60a5fa", YOUNG_ADULT: "#c084fc", MATURE: "#7c3aed",
  };
  const color = STAGE_COLORS[stage] ?? "#7c3aed";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-void/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDismissed(true)}
        >
          <motion.div
            className="relative bg-surface/90 backdrop-blur-xl border rounded-3xl p-14 flex flex-col items-center max-w-sm w-full overflow-hidden shadow-2xl"
            style={{ borderColor: `${color}40` }}
            initial={{ scale: 0.7, y: 60 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-15"
              style={{ background: `radial-gradient(ellipse at center, ${color}, transparent 70%)` }}
            />

            {/* Particle sparks */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{ top: "50%", left: "50%", backgroundColor: color }}
                  animate={{
                    x: p.x,
                    y: p.y,
                    opacity: [1, 0],
                    scale: [0, p.scale],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    repeatDelay: p.repeatDelay,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            {/* Icon */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", damping: 14 }}
              className="mb-6 relative z-10"
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${color}20`, border: `2px solid ${color}60` }}
              >
                <Sparkles className="w-12 h-12" style={{ color }} />
              </div>
            </motion.div>

            <motion.h2
              className="type-title font-clash font-bold text-white mb-2 relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Level Up!
            </motion.h2>

            <motion.p
              className="text-text-muted text-lg relative z-10 font-instrument italic mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              Nova has reached <span className="text-white font-semibold not-italic">Level {level}</span>
            </motion.p>

            <motion.div
              className="px-6 py-2 rounded-full text-sm font-semibold tracking-widest uppercase relative z-10"
              style={{
                backgroundColor: `${color}20`,
                border: `1px solid ${color}50`,
                color,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
            >
              Stage: {stage.replace("_", " ")}
            </motion.div>

            <motion.p
              className="text-text-muted text-xs mt-6 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Tap anywhere to dismiss
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
