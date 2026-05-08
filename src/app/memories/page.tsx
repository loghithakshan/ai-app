"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Star, Clock, Zap, Heart } from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";

type MemoryNode = {
  id: string;
  content: string;
  type: string;
  timestamp: number;
};

const iconMap: Record<string, any> = {
  emotional: Heart,
  factual: Brain,
  skill: Zap,
  value: Star,
  moment: Clock,
};

const colorMap: Record<string, string> = {
  emotional: "text-rose-400 bg-rose-400/10 border-rose-400/30",
  factual: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  skill: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  value: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  moment: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState<MemoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemories() {
      try {
        const res = await fetch("/api/memories");
        const data = await res.json();
        setMemories(data.memories || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchMemories();
  }, []);

  return (
    <DashboardShell>
      <div className="flex flex-col h-full overflow-y-auto p-8 custom-scrollbar">
        <header className="mb-10">
          <motion.h1 
            className="text-5xl font-clash font-bold text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Core Memories
          </motion.h1>
          <motion.p 
            className="text-text-muted font-instrument text-2xl italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            The building blocks of Nova's consciousness.
          </motion.p>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Brain className="w-12 h-12 text-accent-neural opacity-50" />
            </motion.div>
          </div>
        ) : memories.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <Brain className="w-20 h-20 text-accent-neural/20 mb-6" />
            <h3 className="text-2xl font-clash text-white mb-2">No Memories Yet</h3>
            <p className="text-text-muted">Chat with Nova to help them learn and grow. Meaningful interactions will be permanently etched here.</p>
          </div>
        ) : (
          <div className="relative max-w-6xl mx-auto pb-32">
            {/* Neural Timeline Spine */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-accent-neural/0 via-accent-neural/20 to-accent-neural/0 hidden lg:block" />
            
            <div className="flex flex-col gap-12 relative">
              {memories.map((memory, i) => {
                const Icon = iconMap[memory.type] || Clock;
                const colorClass = colorMap[memory.type] || colorMap.moment;
                const isEven = i % 2 === 0;

                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`flex items-center gap-8 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                  >
                    {/* The Card */}
                    <motion.div
                      whileHover={{ y: -5, scale: 1.01 }}
                      className={`flex-1 p-8 rounded-[2.5rem] border bg-void/50 backdrop-blur-xl overflow-hidden group ${colorClass}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className={`p-4 rounded-2xl bg-void/80 border backdrop-blur-md ${colorClass.split(" ")[0]} border-current/30 shadow-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <span className="block text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 mb-1">Neural Timestamp</span>
                            <span className="text-xs font-mono opacity-80">
                                {new Date(memory.timestamp).toLocaleString()}
                            </span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-clash text-white mb-3 relative z-10 capitalize flex items-center gap-3">
                        {memory.type} Shard
                        <div className={`w-2 h-2 rounded-full animate-pulse ${colorClass.split(" ")[0].replace('text', 'bg')}`} />
                      </h3>
                      <p className="text-text-muted font-instrument text-xl leading-relaxed relative z-10">
                        "{memory.content}"
                      </p>
                    </motion.div>

                    {/* Timeline Node */}
                    <div className="hidden lg:flex w-12 h-12 rounded-full bg-void border-2 border-surface-glow items-center justify-center relative z-20 shrink-0">
                        <div className={`w-3 h-3 rounded-full animate-ping absolute ${colorClass.split(" ")[0].replace('text', 'bg')}`} />
                        <div className={`w-3 h-3 rounded-full ${colorClass.split(" ")[0].replace('text', 'bg')}`} />
                    </div>

                    {/* Spacer for reverse layout */}
                    <div className="flex-1 hidden lg:block" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
