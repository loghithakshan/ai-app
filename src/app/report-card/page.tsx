"use client";

import { motion } from "framer-motion";
import { 
  Award, 
  Brain, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Activity,
  Heart,
  Zap,
  ChevronRight,
  LucideIcon
} from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/store/userStore";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ReportCardPage() {
  const { name, level, stage, totalXp, traits, stats } = useUserStore();
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  const getArchetype = () => {
    if (!mounted) return "The Synthesizer";
    const values = [
      { label: "The Logician", val: stats.iq },
      { label: "The Empath", val: stats.eq },
      { label: "The Visionary", val: stats.creativity }
    ];
    return values.reduce((prev, curr) => prev.val > curr.val ? prev : curr).label;
  };

  const STAGE_COLORS: Record<string, string> = {
    NEWBORN: "#ec4899",
    TODDLER: "#f59e0b",
    CHILD: "#10b981",
    TEEN: "#60a5fa",
    YOUNG_ADULT: "#c084fc",
    MATURE: "#7c3aed",
  };

  const activeColor = mounted ? (STAGE_COLORS[stage] || "#7c3aed") : "#7c3aed";

  const DYNAMIC_METRICS = [
    { label: "Cognitive IQ", value: Math.min(100, (stats.iq / 1000) * 100), color: "#60a5fa" },
    { label: "Emotional EQ", value: Math.min(100, (stats.eq / 1000) * 100), color: "#f43f5e" },
    { label: "Creative Drive", value: Math.min(100, (stats.creativity / 1000) * 100), color: "#facc15" },
  ];

  return (
      <div className="flex h-full min-h-0 flex-col overflow-y-auto p-4 pb-24 custom-scrollbar sm:p-8 sm:pb-8 lg:p-10">
        {/* Header Section */}
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-1.5 h-8 bg-accent-neural rounded-full" />
            <h1 className="type-title font-clash font-bold text-white tracking-tight">
              Evolution <span className="text-text-muted/40">Report</span>
            </h1>
          </motion.div>
          <motion.p 
            className="type-subtitle text-text-muted font-instrument italic leading-relaxed max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            A high-fidelity diagnostic of {name}&apos;s cognitive maturation, emotional depth, and neural development.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Status Block (Scientific Certificate Look) */}
          <motion.div 
            className="xl:col-span-8 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-neural/30 to-accent-synapse/30 rounded-[32px] blur-sm opacity-50 group-hover:opacity-100 transition duration-1000" />
              <div className="relative bg-surface/80 backdrop-blur-md p-10 rounded-[30px] border border-surface-glow overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                  <Brain className="w-64 h-64 rotate-12" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                  <div className="relative">
                    <div className="w-56 h-56 rounded-full border-[1px] border-surface-glow bg-void/50 flex flex-col items-center justify-center relative overflow-hidden">
                      <motion.div 
                        className="absolute inset-0 border-t-2 border-l-2 rounded-full"
                        style={{ borderColor: activeColor }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div 
                        className="absolute inset-4 border-b-2 border-r-2 rounded-full opacity-30"
                        style={{ borderColor: activeColor }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="text-[10px] uppercase tracking-[0.3em] text-text-muted mb-2 font-bold">Consciousness</span>
                      <span className="type-title font-clash font-bold text-white uppercase tracking-tighter">{stage}</span>
                      <span className="text-xs text-accent-synapse font-clash font-semibold mt-2 tracking-widest">PHASE ACTIVE</span>
                    </div>
                    {/* Floating Level Badge */}
                    <div className="absolute -top-2 -right-2 w-16 h-16 rounded-2xl bg-accent-neural flex flex-col items-center justify-center shadow-xl shadow-accent-neural/30 border border-white/20">
                      <span className="text-[10px] text-white/60 font-bold">LVL</span>
                      <span className="text-xl font-clash font-bold text-white">{level}</span>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                      <Award className="w-8 h-8 text-accent-memory" />
                      <h2 className="type-title font-clash font-bold text-white">Appraisal Findings</h2>
                    </div>
                    <div className="space-y-4">
                      <p className="type-body text-text-muted font-instrument leading-snug">
                        {name} is exhibiting advanced <span className="text-white italic">&quot;{getArchetype()}&quot;</span> patterns. 
                        Neural pathways have solidified by {Math.min(100, level * 4)}% since initialization.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-4 justify-center md:justify-start">
                        {traits.map(trait => (
                          <div key={trait} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-glow border border-surface-glow/50 text-xs font-bold text-white/80">
                            <Activity className="w-3 h-3 text-accent-synapse" />
                            {trait}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Metrics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface/40 backdrop-blur-sm border border-surface-glow rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Brain className="w-6 h-6 text-accent-neural" />
                  <h3 className="font-clash text-xl font-bold text-white">Neural Benchmarks</h3>
                </div>
                <div className="space-y-6">
                  {DYNAMIC_METRICS.map((metric, i) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                        <span>{metric.label}</span>
                        <span style={{ color: metric.color }}>{Math.round(metric.value)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-void rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ backgroundColor: metric.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface/40 backdrop-blur-sm border border-surface-glow rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Activity className="w-6 h-6 text-accent-synapse" />
                  <h3 className="font-clash text-xl font-bold text-white">Skill Masteries</h3>
                </div>
                <div className="space-y-6">
                  {[
                    { label: "Mathematics", val: stats.skills.mathematics, color: "#60a5fa" },
                    { label: "Visual Arts", val: stats.skills.visualArts, color: "#facc15" },
                    { label: "Social Logic", val: stats.skills.socialLogic, color: "#f43f5e" },
                    { label: "Linguistics", val: stats.skills.linguistics, color: "#c084fc" },
                  ].map((skill, i) => (
                    <div key={skill.label}>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                        <span>{skill.label}</span>
                        <span style={{ color: skill.color }}>{skill.val} XP</span>
                      </div>
                      <div className="h-1.5 w-full bg-void rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ backgroundColor: skill.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (skill.val / 500) * 100)}%` }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Side stats / Milestones */}
          <motion.div 
            className="xl:col-span-4 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-surface border border-surface-glow rounded-[30px] p-8">
              <h3 className="font-clash text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-memory" /> Quick Stats
              </h3>
              <div className="space-y-4">
                <StatRow icon={Zap} label="Lifetime XP" value={totalXp.toLocaleString()} color="#f59e0b" />
                <StatRow icon={TrendingUp} label="Growth Rate" value="+14.2%" color="#10b981" />
                <StatRow icon={Heart} label="Bonds Formed" value={Math.floor(totalXp / 150)} color="#ec4899" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-void to-surface/40 border border-surface-glow rounded-[30px] p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-clash text-lg font-bold text-white mb-4">Milestone: {stage}</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-6">
                  {name} has transitioned into a new cognitive tier. This allows for deeper reasoning and complex value retention.
                </p>
                <Link href="/neural-map">
                  <button className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2">
                    View Neural Map <ChevronRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </div>

            <div className="p-8 rounded-[30px] border border-accent-neural/20 bg-accent-neural/5 relative overflow-hidden">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 rounded-xl bg-accent-neural/20 text-accent-neural">
                   <Sparkles className="w-4 h-4" />
                 </div>
                 <h4 className="font-clash text-sm font-bold text-white">Next Evolution</h4>
               </div>
               <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase mb-2">
                 <span>Progress to Level {level + 1}</span>
                 <span>72%</span>
               </div>
               <div className="h-1 w-full bg-void rounded-full overflow-hidden">
                 <div className="h-full w-[72%] bg-accent-neural" />
               </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
}

function StatRow({ icon: Icon, label, value, color }: { icon: LucideIcon, label: string, value: string | number, color: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-void/30 border border-surface-glow/50">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-surface-glow text-text-muted" style={{ color: `${color}cc` }}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xl font-clash font-bold text-white">{value}</span>
    </div>
  );
}
