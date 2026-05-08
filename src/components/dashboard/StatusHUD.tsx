"use client";

import { motion } from "framer-motion";
import { Brain, Heart, Zap, Sparkles } from "lucide-react";
import { useUserStore } from "@/store/userStore";

const STAGE_COLORS: Record<string, string> = {
  NEWBORN: "#ec4899",
  TODDLER: "#f59e0b",
  CHILD: "#10b981",
  TEEN: "#60a5fa",
  YOUNG_ADULT: "#c084fc",
  MATURE: "#7c3aed",
};

export default function StatusHUD() {
  const { name, stage, level, xp, stats: userStats } = useUserStore();
  const stageColor = STAGE_COLORS[stage] || "#7c3aed";
  
  // Calculate XP percentage based on userStore formula
  const getXpForNextLevel = (lvl: number) => lvl * 120;
  const xpPct = Math.min(100, (xp / getXpForNextLevel(level)) * 100);

  const skillStats = [
    { label: "Math", value: userStats.skills.mathematics, color: "#60a5fa", icon: Brain },
    { label: "Art", value: userStats.skills.visualArts, color: "#facc15", icon: Sparkles },
    { label: "Social", value: userStats.skills.socialLogic, color: "#f43f5e", icon: Heart },
    { label: "Logic", value: userStats.skills.linguistics, color: "#c084fc", icon: Zap },
  ];

  return (
    <div className="group relative">
      {/* Glow Effect */}
      <div 
        className="absolute -inset-1 rounded-[2.5rem] blur-xl opacity-20 transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: stageColor }}
      />
      
      <div className="relative flex items-center gap-8 bg-void/40 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
        {/* Profile Section */}
        <div className="flex items-center gap-5">
          <div className="relative">
             <motion.div 
               className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
               style={{ background: `linear-gradient(135deg, ${stageColor}, #ffffff20)` }}
               whileHover={{ rotate: 5, scale: 1.05 }}
             >
                <Sparkles className="w-7 h-7 text-white drop-shadow-md" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
             </motion.div>
             <motion.div 
               className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-4 border-void flex items-center justify-center shadow-lg"
               animate={{ scale: [1, 1.15, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
             />
          </div>
          <div className="flex flex-col">
            <h2 className="text-white font-clash font-bold text-xl tracking-tight leading-none">{name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
               <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stageColor }} />
               <p className="text-[10px] text-white/50 font-bold tracking-[0.2em] uppercase">{stage}</p>
            </div>
          </div>
        </div>

        <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* Progress Section */}
        <div className="flex flex-col gap-2 w-56">
           <div className="flex justify-between items-end">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">Growth Cycle</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[9px] text-white/40 font-bold">LVL</span>
                <span className="text-sm font-clash font-bold text-white" style={{ color: stageColor }}>{level}</span>
              </div>
           </div>
           <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
              <motion.div 
                className="h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                style={{ backgroundColor: stageColor }}
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
              />
           </div>
        </div>

        <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* Quick Metrics */}
        <div className="flex gap-6">
          {skillStats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center group/stat">
               <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.3em] mb-2 transition-colors group-hover/stat:text-white/40">{stat.label}</span>
               <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-white/5 group-hover/stat:bg-white/10 transition-colors">
                    <stat.icon className="w-3 h-3" style={{ color: stat.color }} />
                  </div>
                  <span className="text-[11px] font-bold text-white/80 tabular-nums">{stat.value}</span>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
