"use client";

import { motion } from "framer-motion";
import { Brain, Star, Zap, Heart, Globe, Book, Terminal, Music } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { useUserStore } from "@/store/userStore";

const pathwayData = [
  { id: "computing", label: "Computing", icon: Terminal, color: "text-blue-400", bg: "bg-blue-400/20", pos: { x: 20, y: 30 } },
  { id: "social", label: "Social", icon: Heart, color: "text-rose-400", bg: "bg-rose-400/20", pos: { x: 70, y: 25 } },
  { id: "creativity", label: "Creativity", icon: Music, color: "text-yellow-400", bg: "bg-yellow-400/20", pos: { x: 80, y: 65 } },
  { id: "knowledge", label: "Knowledge", icon: Book, color: "text-emerald-400", bg: "bg-emerald-400/20", pos: { x: 30, y: 75 } },
  { id: "logic", label: "Logic", icon: Zap, color: "text-purple-400", bg: "bg-purple-400/20", pos: { x: 50, y: 50 } },
];

export default function NeuralMapPage() {
  const router = useRouter();
  const { completedLessons, stats } = useUserStore();

  return (
    <DashboardShell>
      <div className="flex flex-col h-full relative overflow-hidden bg-void p-8">
        {/* Background Neural Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(124, 58, 237, 0.2) 1px, transparent 0)", backgroundSize: "40px 40px" }} 
        />

        <header className="mb-12 relative z-10">
          <motion.h1 
            className="text-5xl font-clash font-bold text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Neural Pathways
          </motion.h1>
          <motion.p 
            className="text-text-muted font-instrument text-2xl italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            A visual constellation of Nova's expanding cognitive architecture.
          </motion.p>
        </header>

        <div className="flex-1 relative">
          {/* Constellation Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {pathwayData.map((p1, i) => 
              pathwayData.slice(i + 1).map((p2) => (
                <motion.line
                  key={`${p1.id}-${p2.id}`}
                  x1={`${p1.pos.x}%`}
                  y1={`${p1.pos.y}%`}
                  x2={`${p2.pos.x}%`}
                  y2={`${p2.pos.y}%`}
                  stroke="currentColor"
                  className="text-white/5"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
              ))
            )}
          </svg>

          {/* Pathway Nodes */}
          {pathwayData.map((node, i) => {
            const isActive = true; // For now
            const strength = node.id === 'computing' ? stats.iq : (node.id === 'social' ? stats.eq : (node.id === 'creativity' ? stats.creativity : 120));
            const scale = 1 + (strength - 100) / 200;

            return (
              <motion.div
                key={node.id}
                className="absolute group cursor-pointer"
                style={{ left: `${node.pos.x}%`, top: `${node.pos.y}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: scale, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: i * 0.1 }}
                whileHover={{ scale: scale + 0.1, zIndex: 50 }}
                onClick={() => router.push(`/lessons?category=${node.label}`)}
              >
                {/* Node Core */}
                <div className={`relative p-6 rounded-full border-2 ${node.bg} ${node.color.replace('text', 'border')} backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_30px_currentColor]`}>
                  <node.icon className={`w-8 h-8 ${node.color}`} />
                  
                  {/* Label Tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <div className="bg-void/90 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                      <p className="text-white font-clash font-bold text-sm">{node.label}</p>
                      <p className={`text-xs font-mono font-bold ${node.color}`}>Strength: {strength}</p>
                    </div>
                  </div>

                  {/* Pulsing Aura */}
                  <motion.div 
                    className={`absolute inset-0 rounded-full border ${node.color.replace('text', 'border')} opacity-20`}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Stats Overlay */}
        <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 pt-12 border-t border-white/5">
           <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Total Connections</span>
              <span className="text-2xl font-clash text-white">4,281</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Pathways Mapped</span>
              <span className="text-2xl font-clash text-white">5 / 12</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Neural Density</span>
              <span className="text-2xl font-clash text-white">84.2%</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Sync State</span>
              <span className="text-2xl font-clash text-emerald-400">Stable</span>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
