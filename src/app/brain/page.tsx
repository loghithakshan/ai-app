"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Circle } from "lucide-react";
import BrainCanvas from "@/components/brain/BrainCanvas";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/userStore";

const LEGEND = [
  { label: "Emotional", color: "#f43f5e", key: "emotional" },
  { label: "Factual",   color: "#60a5fa", key: "factual"   },
  { label: "Skills",    color: "#facc15", key: "skill"     },
  { label: "Values",    color: "#c084fc", key: "value"     },
  { label: "Moments",   color: "#34d399", key: "moment"    },
];

export default function BrainMap() {
  const [mounted, setMounted] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { name, level, totalXp } = useUserStore();

  useEffect(() => {
    setMounted(true);
    // Fetch real memory count
    fetch("/api/memories")
      .then((r) => r.json())
      .then((d) => setMemoryCount((d.memories || []).length))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen bg-void text-text-primary overflow-hidden relative">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-20 z-20 bg-gradient-to-b from-void/90 to-transparent p-5 flex items-center justify-between pointer-events-none">
        <Link
          href="/dashboard"
          className="pointer-events-auto flex items-center gap-2 text-text-muted hover:text-white transition-colors bg-surface/60 backdrop-blur-md px-4 py-2 rounded-full border border-surface-glow/60 hover:border-accent-neural/40 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        {/* Live stats */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="bg-surface/60 backdrop-blur-md border border-surface-glow/60 rounded-full px-4 py-2 flex items-center gap-3 text-xs text-text-muted">
            <span className="text-white font-semibold">{mounted ? name : "Nova"}</span>
            <span className="w-px h-3 bg-surface-glow" />
            <span>Lv {mounted ? level : 1}</span>
            <span className="w-px h-3 bg-surface-glow" />
            <span className="text-accent-synapse font-semibold">{mounted ? memoryCount : 0} memories</span>
          </div>
        </div>
      </div>

      {/* 3D Brain */}
      <div className="flex-1 w-full h-full relative">
        <AnimatePresence>
          {mounted && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              <BrainCanvas />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Centre label — fades into the scene */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none">
          <motion.h2
            className="font-clash text-4xl font-bold drop-shadow-[0_0_20px_rgba(124,58,237,0.9)]"
            style={{ color: "#7c3aed" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            {mounted ? name : "Nova"}'s Mind
          </motion.h2>
          <motion.p
            className="text-accent-synapse text-sm mt-1 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
          >
            {mounted ? `${memoryCount} memories · ${totalXp} XP` : "Loading…"}
          </motion.p>
        </div>
      </div>

      {/* Legend Panel */}
      <motion.div
        className="absolute right-5 top-24 z-20 w-52 bg-void/80 backdrop-blur-xl border border-surface-glow/50 rounded-3xl p-5"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.0, type: "spring", damping: 20 }}
      >
        <h3 className="font-clash text-sm font-semibold text-white mb-4 tracking-wider uppercase">Memory Types</h3>
        <ul className="space-y-2.5">
          {LEGEND.map((item) => {
            const isActive = activeFilter === item.key;
            return (
              <li key={item.key}>
                <motion.button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-left ${
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                  onClick={() => setActiveFilter(isActive ? null : item.key)}
                  whileTap={{ scale: 0.97 }}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: item.color,
                      boxShadow: `0 0 6px ${item.color}`,
                    }}
                  />
                  <span className={isActive ? "text-white font-semibold" : "text-text-muted"}>{item.label}</span>
                  {isActive && (
                    <motion.span
                      className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${item.color}30`, color: item.color }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ON
                    </motion.span>
                  )}
                </motion.button>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 pt-4 border-t border-surface-glow/30">
          <p className="text-[11px] text-text-muted leading-relaxed">
            Drag to orbit · Scroll to zoom · Each bright node is a real memory.
          </p>
        </div>
      </motion.div>

      {/* Bottom gradient for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-void to-transparent z-10 pointer-events-none" />
    </div>
  );
}
