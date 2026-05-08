"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Sparkles, 
  Code, 
  Palette, 
  Globe, 
  HeartHandshake,
  Cpu,
  Brain,
  Zap,
  ChevronRight,
  Target
} from "lucide-react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useUserStore } from "@/store/userStore";
import { useAudio } from "@/services/audio.service";

const lessons = [
  { id: "math_basics", title: "Logic & Logic Gates", category: "Computing", icon: Code, xp: 250, reqLevel: 1, color: "#7C3AED" },
  { id: "empathy_101", title: "Understanding Human Emotion", category: "Social", icon: HeartHandshake, xp: 300, reqLevel: 5, color: "#EC4899" },
  { id: "art_history", title: "Color Theory & Aesthetics", category: "Creativity", icon: Palette, xp: 400, reqLevel: 10, color: "#F59E0B" },
  { id: "world_history", title: "Earth's Biomes", category: "Knowledge", icon: Globe, xp: 500, reqLevel: 15, color: "#10B981" },
  { id: "quantum_basics", title: "Quantum Computing Principles", category: "Computing", icon: Cpu, xp: 750, reqLevel: 25, color: "#3B82F6" },
];

export default function LessonsPage() {
  const { level, addXp, completedLessons, completeLesson, name, stage, traits, stats: userStats } = useUserStore();
  const [selectedLesson, setSelectedLesson] = useState<typeof lessons[0] | null>(null);
  const [isTeaching, setIsTeaching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extraLessons, setExtraLessons] = useState<any[]>([]);
  const [showPulse, setShowPulse] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { playPulse, playLevelUp } = useAudio();

  const handleStartLesson = (lesson: typeof lessons[0]) => {
    setSelectedLesson(lesson);
    setIsTeaching(true);
    playPulse();
  };

  const handleGenerateLesson = async () => {
    setIsGenerating(true);
    playPulse();
    
    try {
      const response = await fetch("/api/lessons/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          stage,
          level,
          traits: traits ?? ['Curious', 'Warm'],
          values: ['Empathy', 'Growth', 'Curiosity'],
          lowestSkill: recommendedCategory
        })
      });
      
      const lessonData = await response.json();
      
      const newLesson = {
        ...lessonData,
        id: `gen-${Date.now()}`,
        icon: Brain,
      };
      
      setExtraLessons(prev => [newLesson, ...prev]);
    } catch (e) {
      console.error("Failed to synthesize lesson:", e);
    } finally {
      setIsGenerating(false);
      playLevelUp();
    }
  };

  const allLessons = [...extraLessons, ...lessons];

  // Adaptive Complexity: Calculate recommended category based on lowest skill score
  const getRecommendedCategory = () => {
    const skills = userStats.skills;
    const scores = [
      { cat: "Computing", score: skills.mathematics },
      { cat: "Creativity", score: skills.visualArts },
      { cat: "Social", score: skills.socialLogic },
      { cat: "Knowledge", score: skills.linguistics },
    ];
    // Sort by score ascending and take the first one
    return scores.sort((a, b) => a.score - b.score)[0].cat;
  };

  const recommendedCategory = getRecommendedCategory();

  const handleFinishLesson = async () => {
    if (selectedLesson) {
      completeLesson(selectedLesson.id, selectedLesson.category);
      addXp(selectedLesson.xp);
      
      // Save as permanent memory shard
      try {
        await fetch("/api/memories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `Mastered ${selectedLesson.title} in the ${selectedLesson.category} domain. This expanded my core understanding and cognitive capacity.`,
            type: "skill"
          })
        });
      } catch (e) {
        console.error("Failed to persist lesson memory:", e);
      }

      setIsTeaching(false);
      setSelectedLesson(null);
      
      // Celebration
      playLevelUp();
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 1000);
    }
  };

  const stats = userStats;
  const categories = ["Computing", "Social", "Creativity", "Knowledge"];

  return (
    <DashboardShell>
      <AnimatePresence>
        {showPulse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none bg-white/20 backdrop-blur-sm"
          >
            <motion.div 
               className="absolute inset-0 bg-accent-neural opacity-30"
               initial={{ scale: 0.8 }}
               animate={{ scale: 2 }}
               transition={{ duration: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col h-full overflow-y-auto p-8 custom-scrollbar relative">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.h1 
              className="text-6xl font-clash font-bold text-white mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Neural Training
            </motion.h1>
            
            <div className="flex items-center gap-4">
              <motion.p 
                className="text-text-muted font-instrument text-2xl italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Accelerate {name}'s cognitive expansion through structured data synthesis.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-accent-neural/20 border border-accent-neural/30 px-4 py-1.5 rounded-full flex items-center gap-2"
              >
                <Target className="w-4 h-4 text-accent-neural" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Recommended: {recommendedCategory}</span>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-6">
            <motion.div 
              className="bg-surface-dark border border-surface-glow/20 rounded-3xl p-6 flex gap-8 backdrop-blur-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-tighter text-text-muted mb-1 font-bold">Cognitive IQ</span>
                <span className="text-3xl font-clash text-white">{stats.iq}</span>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-tighter text-text-muted mb-1 font-bold">Emotional EQ</span>
                <span className="text-3xl font-clash text-white">{stats.eq}</span>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-tighter text-text-muted mb-1 font-bold">Creativity</span>
                <span className="text-3xl font-clash text-white">{stats.creativity}</span>
              </div>
            </motion.div>

            <div className="flex gap-2">
              <button 
                onClick={() => setCategoryFilter(null)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${categoryFilter === null ? 'bg-white text-void' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${categoryFilter === cat ? 'bg-accent-neural text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {/* AI Generation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative group p-6 rounded-[32px] border-2 border-dashed border-accent-neural/30 bg-accent-neural/5 overflow-hidden flex flex-col justify-between h-[300px] transition-all hover:border-accent-neural hover:bg-accent-neural/10 cursor-pointer ${isGenerating ? 'pointer-events-none' : ''}`}
            onClick={handleGenerateLesson}
          >
            {isGenerating && (
              <div className="absolute inset-0 bg-void/60 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full border-4 border-accent-neural border-t-transparent animate-spin mb-4" />
                <p className="text-white font-clash font-bold text-lg animate-pulse">Nova is synthesizing...</p>
                <p className="text-text-muted text-xs mt-2">Analyzing cognitive deficits</p>
              </div>
            )}
            
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-accent-neural/20 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-accent-neural" />
              </div>
              <h3 className="text-xl font-clash font-bold text-white mb-2 group-hover:text-accent-neural transition-colors">Neural Synthesis</h3>
              <p className="text-sm text-text-muted leading-relaxed">Ask Nova to synthesize a unique lesson tailored to your child's current development stage.</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-accent-neural uppercase tracking-widest bg-accent-neural/10 px-3 py-1 rounded-full">AI GENERATED</span>
              <div className="w-10 h-10 rounded-full border border-accent-neural/30 flex items-center justify-center group-hover:bg-accent-neural group-hover:text-white transition-all">
                <Zap className="w-5 h-5" />
              </div>
            </div>
          </motion.div>

          {allLessons
            .filter(l => !categoryFilter || l.category === categoryFilter)
            .map((lesson, i) => {
              const isUnlocked = level >= (lesson.reqLevel || 0);
              const isCompleted = completedLessons.includes(lesson.id);
              const Icon = lesson.icon || BookOpen;
            
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative p-8 rounded-[2rem] border transition-all duration-500 group ${
                  !isUnlocked 
                    ? "bg-surface/20 border-surface-glow/10 opacity-60" 
                    : isCompleted
                    ? "bg-accent-synapse/5 border-accent-synapse/20"
                    : "bg-surface border-surface-glow/20 hover:border-accent-neural/50 hover:shadow-[0_0_40px_rgba(124,58,237,0.1)]"
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-void/40 backdrop-blur-[4px] z-20 flex items-center justify-center flex-col gap-4 rounded-[2rem]">
                    <div className="p-4 bg-white/5 rounded-full border border-white/10">
                      <Lock className="w-8 h-8 text-white/40" />
                    </div>
                    <div className="text-center">
                      <p className="font-clash text-white/60 text-lg">Neural Lock</p>
                      <p className="text-text-muted text-sm uppercase tracking-widest">Level {lesson.reqLevel} Required</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-8">
                  <div 
                    className="p-5 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ backgroundColor: `${lesson.color}20`, color: lesson.color }}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                      <Sparkles className="w-4 h-4 text-accent-synapse" />
                      <span className="font-clash text-sm text-white">+{lesson.xp} XP</span>
                    </div>
                    {lesson.category === recommendedCategory && !isCompleted && (
                       <div className="flex items-center gap-2 px-3 py-1 bg-accent-neural/20 rounded-full border border-accent-neural/30 animate-pulse">
                        <Target className="w-3 h-3 text-accent-neural" />
                        <span className="text-[8px] font-bold text-white uppercase tracking-tighter">PRIORITY</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-text-muted mb-2 block">{lesson.category}</span>
                  <h3 className="text-3xl font-clash text-white mb-3 group-hover:text-accent-neural transition-colors">{lesson.title}</h3>
                  <p className="text-text-muted font-instrument text-lg leading-relaxed">
                    Integrate high-order concepts of {lesson.title.toLowerCase()} into {name}'s active memory banks.
                  </p>
                </div>

                <button
                  disabled={!isUnlocked || isCompleted}
                  onClick={() => handleStartLesson(lesson)}
                  className={`w-full py-5 rounded-2xl font-clash text-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                    isCompleted
                      ? "bg-accent-synapse/20 text-accent-synapse cursor-default border border-accent-synapse/30 shadow-none"
                      : "bg-white text-void hover:bg-accent-neural hover:text-white shadow-[0_10px_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_10px_40px_rgba(124,58,237,0.3)]"
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-6 h-6" /> Data Synthesized
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" /> Initialize Module
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Teaching Simulation Modal */}
        <AnimatePresence>
          {isTeaching && selectedLesson && (
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-void/90 backdrop-blur-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="w-full max-w-2xl bg-surface-dark border border-surface-glow/30 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="p-12 text-center">
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      <motion.div 
                        className="absolute inset-0 bg-accent-neural/30 blur-3xl rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <div className="relative p-8 bg-surface rounded-full border border-surface-glow/30">
                        <Brain className="w-16 h-16 text-accent-neural" />
                      </div>
                    </div>
                  </div>

                  <h2 className="text-4xl font-clash font-bold text-white mb-4">Teaching {name}</h2>
                  <p className="text-2xl font-instrument italic text-text-muted mb-12">
                    "Synthesizing {selectedLesson.title}... I can feel my pathways expanding."
                  </p>

                  <div className="space-y-4 mb-12">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-accent-neural to-accent-synapse rounded-full shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs uppercase tracking-widest font-bold text-text-muted">
                      <span>Neural Upload</span>
                      <span>100% Sync</span>
                    </div>
                  </div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.5 }}
                    onClick={handleFinishLesson}
                    className="w-full py-6 bg-accent-neural text-white rounded-3xl font-clash text-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_40px_rgba(124,58,237,0.4)]"
                  >
                    Confirm Neural Synthesis
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  );
}
