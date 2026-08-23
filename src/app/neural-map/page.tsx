"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Info, Zap, Heart, Book, Terminal, Music } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

const pathwayData = [
  { id: "computing", label: "Computing", planetName: "Aetheris", levelRange: "1-40", abstract: "A fast electric world for coding, systems, and pattern discovery.", icon: Terminal, color: "text-blue-400", bg: "bg-blue-400/20", pos: { x: 20, y: 30 } },
  { id: "social", label: "Social", planetName: "Amoria", levelRange: "41-80", abstract: "A warm rose world where empathy, communication, and relationships grow.", icon: Heart, color: "text-rose-400", bg: "bg-rose-400/20", pos: { x: 70, y: 25 } },
  { id: "creativity", label: "Creativity", planetName: "Lumina", levelRange: "81-120", abstract: "A golden ringed world for imagination, art, and original expression.", icon: Music, color: "text-yellow-400", bg: "bg-yellow-400/20", pos: { x: 80, y: 65 } },
  { id: "knowledge", label: "Knowledge", planetName: "Verdara", levelRange: "121-160", abstract: "A living green world built from language, facts, and curiosity.", icon: Book, color: "text-emerald-400", bg: "bg-emerald-400/20", pos: { x: 30, y: 75 } },
  { id: "logic", label: "Logic", planetName: "Nexis", levelRange: "161-200", abstract: "A violet world of reasoning, structure, and clear decisions.", icon: Zap, color: "text-purple-400", bg: "bg-purple-400/20", pos: { x: 50, y: 14 } },
];

const PLANET_STYLES: Record<string, { primary: string; secondary: string; highlight: string; texture: string }> = {
  computing: { primary: "#1d4ed8", secondary: "#38bdf8", highlight: "#dbeafe", texture: "radial-gradient(circle at 66% 38%, #0e7490 0 6%, transparent 7%), radial-gradient(circle at 36% 64%, #93c5fd 0 4%, transparent 5%)" },
  social: { primary: "#9f1239", secondary: "#fb7185", highlight: "#ffe4e6", texture: "radial-gradient(circle at 60% 32%, #fecdd3 0 5%, transparent 6%), radial-gradient(circle at 34% 68%, #881337 0 7%, transparent 8%)" },
  creativity: { primary: "#92400e", secondary: "#f59e0b", highlight: "#fef3c7", texture: "repeating-linear-gradient(174deg, transparent 0 7px, #fde68a55 8px 11px, transparent 12px 17px)" },
  knowledge: { primary: "#065f46", secondary: "#34d399", highlight: "#d1fae5", texture: "radial-gradient(ellipse at 58% 38%, #86efac 0 13%, transparent 14%), radial-gradient(ellipse at 34% 62%, #15803d 0 11%, transparent 12%)" },
  logic: { primary: "#4c1d95", secondary: "#8b5cf6", highlight: "#ede9fe", texture: "radial-gradient(circle at 62% 62%, #c4b5fd 0 5%, transparent 6%), radial-gradient(circle at 35% 35%, #312e81 0 8%, transparent 9%)" },
};

export default function NeuralMapPage() {
  const router = useRouter();
  const { name, level, stats } = useUserStore();
  const [selectedPlanet, setSelectedPlanet] = useState<typeof pathwayData[number] | null>(null);

  return (
       <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#03040d] p-4 pb-24 sm:p-8 sm:pb-8">
        {/* Background Neural Grid */}
         <div className="pointer-events-none absolute inset-0 opacity-40" 
           style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(56,189,248,0.18) 0 1px, transparent 2px), radial-gradient(circle at 75% 65%, rgba(244,114,182,0.16) 0 1px, transparent 2px), radial-gradient(circle at 2px 2px, rgba(148,163,184,0.12) 1px, transparent 0)", backgroundSize: "240px 220px, 310px 280px, 36px 36px" }} 
        />
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,41,80,0.25),transparent_62%)]" />

        <header className="mb-12 relative z-10">
          <motion.h1 
            className="type-title font-clash font-bold text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Neural Pathways
          </motion.h1>
          <motion.p 
            className="type-subtitle text-text-muted font-instrument italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            A visual constellation of Nova&apos;s expanding cognitive architecture.
          </motion.p>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {/* Orbital paths */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(72vw,560px)] w-[min(72vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/10" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(48vw,380px)] w-[min(48vw,380px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-200/10" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(27vw,210px)] w-[min(27vw,210px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/10" />

          {/* Baby AI sun */}
          <motion.button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="absolute left-1/2 top-1/2 z-20 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-visible rounded-full border-2 border-amber-100/80 bg-[#7c2d12] text-center shadow-[0_0_35px_rgba(251,191,36,0.75),0_0_100px_rgba(249,115,22,0.35)] sm:h-40 sm:w-40"
            animate={{ scale: [1, 1.04, 1], boxShadow: ["0 0 35px rgba(251,191,36,0.75), 0 0 100px rgba(249,115,22,0.35)", "0 0 55px rgba(251,191,36,0.95), 0 0 130px rgba(249,115,22,0.5)", "0 0 35px rgba(251,191,36,0.75), 0 0 100px rgba(249,115,22,0.35)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.span
              className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_25%,#fff7ed_0%,#fde047_12%,#fb923c_35%,#dc2626_68%,#450a0a_100%)]"
              animate={{ rotate: [0, 360], scale: [1, 1.04, 1] }}
              transition={{ rotate: { duration: 18, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
            />
            <motion.span
              className="pointer-events-none absolute -top-8 left-1/2 h-12 w-5 -translate-x-1/2 rounded-full bg-gradient-to-t from-red-600 via-orange-400 to-yellow-100 blur-[2px]"
              animate={{ y: [4, -8, 4], scaleX: [1, 0.65, 1], opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="pointer-events-none absolute -right-5 top-1/4 h-4 w-12 rotate-[-28deg] rounded-full bg-gradient-to-r from-yellow-100 via-orange-400 to-red-700 blur-[2px]"
              animate={{ x: [0, 8, 0], scaleX: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
            <span className="pointer-events-none absolute inset-2 rounded-full border border-yellow-100/60 opacity-80" />
            <span className="pointer-events-none absolute -inset-3 rounded-full border border-amber-200/40" />
            <span className="pointer-events-none absolute -inset-7 rounded-full border border-orange-300/20" />
            <div className="pointer-events-none absolute inset-3 rounded-full border border-white/35 opacity-70" />
            <Brain className="relative z-10 h-8 w-8 text-amber-950 sm:h-10 sm:w-10" />
            <span className="relative z-10 mt-1 text-sm font-bold text-amber-950">{name}</span>
            <span className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-amber-950/70">Level {level}</span>
          </motion.button>

          {/* Pathway Nodes */}
          {pathwayData.map((node, i) => {
            const strength = node.id === 'computing' ? stats.iq : (node.id === 'social' ? stats.eq : (node.id === 'creativity' ? stats.creativity : 120));
            const scale = 1 + (strength - 100) / 200;

            return (
              <motion.div
                key={node.id}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${node.pos.x}%`, top: `${node.pos.y}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: scale, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: i * 0.1 }}
                whileHover={{ scale: scale + 0.1, zIndex: 50 }}
                onClick={() => setSelectedPlanet(node)}
              >
                {/* Topic planet */}
                {(() => {
                  const planet = PLANET_STYLES[node.id];
                  return (
                    <div
                      className="pointer-events-none absolute -inset-4 rounded-full border opacity-40 transition-transform duration-500 group-hover:rotate-45"
                      style={{ borderColor: planet.highlight, boxShadow: `0 0 18px ${planet.secondary}60` }}
                    />
                  );
                })()}
                <div className="absolute -inset-3 rounded-full border border-white/10 opacity-60 transition-transform duration-500 group-hover:rotate-12" />
                <div
                  className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/50 shadow-2xl transition-all duration-500 group-hover:scale-110 sm:h-20 sm:w-20"
                  style={{
                    background: `${PLANET_STYLES[node.id].texture}, repeating-linear-gradient(168deg, transparent 0 8px, ${PLANET_STYLES[node.id].highlight}35 9px 11px, transparent 12px 18px), radial-gradient(circle at 30% 24%, ${PLANET_STYLES[node.id].highlight} 0%, ${PLANET_STYLES[node.id].secondary} 16%, ${PLANET_STYLES[node.id].primary} 48%, #080b1d 100%)`,
                    boxShadow: `inset -12px -10px 18px rgba(0,0,0,0.65), inset 8px 7px 12px rgba(255,255,255,0.25), 0 0 26px ${PLANET_STYLES[node.id].secondary}80`,
                  }}
                >
                  <div className="absolute -left-2 top-5 h-2 w-20 rotate-[-18deg] rounded-full border border-white/25 bg-white/15 blur-[1px]" />
                  <div className="absolute -right-1 top-1 h-1.5 w-1.5 rounded-full bg-black/40 shadow-[8px_10px_0_1px_rgba(0,0,0,0.25),-12px_20px_0_0_rgba(255,255,255,0.12)]" />
                  <div className="pointer-events-none absolute inset-0 rounded-full border border-white/40 bg-[linear-gradient(115deg,rgba(255,255,255,0.24),transparent_28%,transparent_60%,rgba(0,0,0,0.4))]" />
                  {node.id === "creativity" && <div className="absolute -inset-3 rotate-[-18deg] rounded-full border-2 border-amber-200/40" />}
                  {node.id === "computing" && <div className="absolute left-1/2 top-0 h-full w-px rotate-45 bg-cyan-100/30" />}
                  {node.id === "knowledge" && <div className="absolute bottom-3 left-3 h-2 w-8 rounded-full bg-emerald-200/30 blur-sm" />}
                  <node.icon className="relative z-10 h-6 w-6 text-white/80 drop-shadow-lg sm:h-7 sm:w-7" />
                  <span className="absolute -bottom-7 whitespace-nowrap text-[11px] font-bold text-white/80">{node.planetName}</span>
                  <span className={`absolute -top-7 whitespace-nowrap text-[10px] font-mono font-bold ${node.color}`}>Levels {node.levelRange}</span>
                  
                  {/* Label Tooltip */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <div className="bg-void/90 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                      <p className="text-white font-clash font-bold text-sm">{node.planetName}</p>
                      <p className={`text-xs font-mono font-bold ${node.color}`}>Levels {node.levelRange} · Strength {strength}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`About ${node.planetName}`}
                    title={`About ${node.planetName}`}
                    onClick={(event) => { event.stopPropagation(); setSelectedPlanet(node); }}
                    className="pointer-events-auto absolute -right-4 -top-4 z-30 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/50 bg-[#070914]/95 text-white/90 shadow-lg"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>

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

        {selectedPlanet && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#02030a]/70 p-6 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-label={`${selectedPlanet.planetName} information`}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0b1022]/95 p-7 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${selectedPlanet.color}`}>{selectedPlanet.label} planet</p>
                  <h2 className="mt-2 text-3xl font-clash font-bold text-white">{selectedPlanet.planetName}</h2>
                </div>
                <button type="button" aria-label="Close planet information" onClick={() => setSelectedPlanet(null)} className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/60 hover:text-white">Close</button>
              </div>
              <p className="mt-5 text-base leading-relaxed text-white/70">{selectedPlanet.abstract}</p>
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="text-sm text-white/50">Current growth</span>
                <span className={`font-clash text-xl font-bold ${selectedPlanet.color}`}>{selectedPlanet.id === "computing" ? stats.iq : selectedPlanet.id === "social" ? stats.eq : selectedPlanet.id === "creativity" ? stats.creativity : 120}%</span>
              </div>
              <button type="button" onClick={() => router.push(`/lessons?category=${selectedPlanet.label}`)} className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#070914] transition-colors hover:bg-cyan-100">Explore {selectedPlanet.label} lessons</button>
            </motion.div>
          </div>
        )}

        {/* Footer Stats Overlay */}
        <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 pt-12 border-t border-white/5">
           <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Total Connections</span>
              <span className="text-xl font-clash text-white">4,281</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Pathways Mapped</span>
              <span className="text-xl font-clash text-white">5 / 12</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Neural Density</span>
              <span className="text-xl font-clash text-white">84.2%</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Sync State</span>
              <span className="text-xl font-clash text-emerald-400">Stable</span>
           </div>
        </div>
      </div>
  );
}
