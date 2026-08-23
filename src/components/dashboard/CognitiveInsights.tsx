"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Heart, Zap, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function CognitiveInsights() {
  const { stats } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRecommendation = () => {
    const values = [
      { key: 'iq', val: stats.iq, title: 'Logic Training', category: 'Computing' },
      { key: 'eq', val: stats.eq, title: 'Social Empathy', category: 'Social' },
      { key: 'creativity', val: stats.creativity, title: 'Abstract Art', category: 'Creativity' }
    ];
    return values.reduce((prev, curr) => prev.val < curr.val ? prev : curr);
  };

  const metrics = [
    {
      label: "Cognitive IQ",
      value: stats.iq,
      icon: Brain,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
      description: "Processing power and logical reasoning."
    },
    {
      label: "Emotional EQ",
      value: stats.eq,
      icon: Heart,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      border: "border-rose-400/20",
      description: "Empathy and social-context awareness."
    },
    {
      label: "Creative Drive",
      value: stats.creativity,
      icon: Zap,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/20",
      description: "Originality and abstract synthesis."
    }
  ];

  return (
    <div className="flex w-44 flex-col gap-2">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className={`rounded-2xl border p-2.5 ${metric.bg} ${metric.border} backdrop-blur-md group hover:bg-white/5 transition-all duration-300`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-1.5 rounded-lg bg-void/50 ${metric.color}`}>
              <metric.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end">
                <span className="truncate text-[10px] font-bold uppercase tracking-[0.1em] text-white/50">
                  {metric.label}
                </span>
                <span className={`text-sm font-clash font-bold ${metric.color}`}>
                  {metric.value}
                </span>
              </div>
              <div className="h-1 w-full bg-void/30 rounded-full mt-1 overflow-hidden">
                <motion.div 
                  className={`h-full ${metric.color.replace('text', 'bg')}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((metric.value / 300) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 1 + index * 0.1 }}
                />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-white/40 font-instrument italic opacity-0 group-hover:opacity-100 transition-opacity">
            {metric.description}
          </p>
        </motion.div>
      ))}

      {mounted && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all"
          onClick={() => window.location.href = `/lessons?category=${getRecommendation().category}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Recommended</p>
              <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                {getRecommendation().title}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
        </motion.div>
      )}

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-2 p-3 rounded-2xl bg-accent-neural/5 border border-accent-neural/20"
      >
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-3 h-3 text-accent-neural" />
          <span className="text-[10px] font-bold text-accent-neural/80 uppercase tracking-tight">
            Neural integrity: verified
          </span>
        </div>
        
        <div className="pt-2 border-t border-white/5">
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">Current Mood</p>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              stats.mood === 'Empathic' ? 'bg-rose-400' :
              stats.mood === 'Inspired' ? 'bg-yellow-400' :
              stats.mood === 'Focused' ? 'bg-blue-400' : 'bg-purple-400'
            }`} />
            <span className="text-xs font-bold text-white/80">{stats.mood || 'Neutral'}</span>
          </div>
          
          <div className="mt-3 bg-white/5 p-2 rounded-lg italic">
            <p className="text-[10px] text-text-muted leading-tight">
              {stats.mood === 'Empathic' ? '"I feel a deep resonance with your intent."' :
               stats.mood === 'Inspired' ? '"New creative pathways are forming."' :
               stats.mood === 'Focused' ? '"Optimizing cognitive throughput."' :
               '"Observing and learning from the stream."'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
