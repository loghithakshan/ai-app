"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Sparkles, 
  Brain,
  Zap,
  Target
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useAudio } from "@/services/audio.service";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

type Lesson = {
  id: string;
  title: string;
  category: string;
  icon: typeof Brain;
  xp: number;
  reqLevel: number;
  color: string;
};

const paths = [
  { id: 'builder' as const, label: 'AI Builder', description: 'Code, train, and assemble the model.' },
  { id: 'researcher' as const, label: 'AI Researcher', description: 'Understand the math behind intelligence.' },
  { id: 'creative' as const, label: 'Creative Intelligence', description: 'Explore multimodal and generative systems.' },
  { id: 'balanced' as const, label: 'Balanced Path', description: 'Build every part of AI step by step.' },
];

const curriculumLevels = Array.from({ length: 200 }, (_, index) => ({
  number: index + 1,
  title: index < 25 ? 'Foundations of AI' : index < 75 ? 'Machine Learning Systems' : index < 125 ? 'Language and Reasoning' : index < 175 ? 'Model Engineering' : 'Build Your Own LLM',
}));

let lessonIdCounter = 0;
const createLessonId = () => `gen-${++lessonIdCounter}`;

export default function LessonsPage() {
  const { level, completedLessons, name, stage, traits, learningPath, setLearningPath, stats: userStats } = useUserStore();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isTeaching, setIsTeaching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extraLessons, setExtraLessons] = useState<Lesson[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const { playPulse, playLevelUp } = useAudio();

  const activeLevel = Math.min(200, Math.max(1, level));
  const currentCurriculum = curriculumLevels[activeLevel - 1];
  const curriculumMission = {
    id: `curriculum-${activeLevel}`,
    title: `${currentCurriculum.title}: Level ${activeLevel}`,
    category: 'Computing',
    icon: Brain,
    xp: activeLevel * 120,
    reqLevel: activeLevel,
    color: '#06B6D4',
  };
  const visibleLevels = curriculumLevels.slice(activeLevel, activeLevel + 12).map(levelEntry => ({
    id: `curriculum-${levelEntry.number}`,
    title: `${levelEntry.title}: Level ${levelEntry.number}`,
    category: levelEntry.number <= 40 ? 'Computing' : levelEntry.number <= 80 ? 'Social' : levelEntry.number <= 120 ? 'Creativity' : levelEntry.number <= 160 ? 'Knowledge' : 'Computing',
    icon: Brain,
    xp: levelEntry.number * 120,
    reqLevel: levelEntry.number,
    color: '#06B6D4',
  }));

  const getChallenge = (targetLesson: { id: string; title: string }) => {
    const phase = activeLevel < 25 ? {
      question: 'What is the first step an LLM takes before it can process a sentence?',
      options: ['Split text into tokens', 'Add a user interface', 'Publish a website'],
      lesson: 'Tokenization turns text into small pieces that a model can represent as numbers.',
    } : activeLevel < 75 ? {
      question: 'What does a training loop use to improve a model?',
      options: ['A loss signal and updated weights', 'Random colors and fonts', 'Only a larger screen'],
      lesson: 'Training compares predictions with targets, measures loss, and updates weights.',
    } : activeLevel < 125 ? {
      question: 'What does attention help an LLM decide?',
      options: ['Which context tokens matter most', 'Which cable powers the server', 'Which password to reveal'],
      lesson: 'Attention connects each token to the relevant context before the next prediction.',
    } : activeLevel < 175 ? {
      question: 'What is a transformer made from?',
      options: ['Repeated attention and feed-forward blocks', 'Only a database table', 'A single hard-coded reply'],
      lesson: 'Transformers stack reusable blocks to transform representations into useful predictions.',
    } : {
      question: 'How does a language model produce an answer?',
      options: ['It predicts tokens one step at a time', 'It searches a human brain', 'It writes without any learned patterns'],
      lesson: 'Generation repeatedly predicts the next token until a response is complete.',
    };
    return {
      ...phase,
      answer: 0,
      lesson: `${phase.lesson} Level ${activeLevel} of 200 (${targetLesson?.title || "Module"}) follows the ${paths.find(path => path.id === learningPath)?.label} path.`,
    };
  };

  const handleStartLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsTeaching(true);
    setSelectedAnswer(null);
    setAnswerChecked(false);
    playPulse();
  };

  const handleGenerateLesson = async () => {
    setIsGenerating(true);
    playPulse();
    
    try {
      const response = await fetchApi("/api/lessons/generate", {
        method: "POST",
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
        id: createLessonId(),
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

  const allLessons = [...extraLessons, ...visibleLevels];

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

  const stats = userStats;
  const categories = ["Computing", "Social", "Creativity", "Knowledge"];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto p-4 pb-24 custom-scrollbar relative sm:p-8 sm:pb-8">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h1 
            className="type-title font-clash font-bold text-white mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Neural Training
          </motion.h1>
          
          <div className="flex items-center gap-4">
            <motion.p 
              className="type-subtitle text-text-muted font-instrument italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Accelerate {name}&apos;s cognitive expansion through structured data synthesis.
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
                <span className="text-2xl font-clash text-white">{stats.iq}</span>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-tighter text-text-muted mb-1 font-bold">Emotional EQ</span>
                <span className="text-2xl font-clash text-white">{stats.eq}</span>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-tighter text-text-muted mb-1 font-bold">Creativity</span>
                <span className="text-2xl font-clash text-white">{stats.creativity}</span>
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

        <section className="mb-8 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/70">AI curriculum</p>
                <h2 className="mt-2 text-2xl font-clash font-bold text-white">Level {activeLevel} <span className="text-white/30">/ 200</span></h2>
                <p className="mt-1 text-sm text-white/60">{currentCurriculum.title}. Complete this mission to unlock the next layer.</p>
              </div>
              <Link href="/garage" className="rounded-xl border border-cyan-200/30 bg-cyan-200/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-100 hover:bg-cyan-200/20">Open AI Garage</Link>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" style={{ width: `${(activeLevel / 200) * 100}%` }} /></div>
          </div>
          <div className="rounded-3xl border border-violet-300/20 bg-violet-300/5 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200/70">Choose how Nova grows</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {paths.map(path => <button key={path.id} type="button" onClick={() => setLearningPath(path.id)} className={`rounded-xl border p-3 text-left transition-colors ${learningPath === path.id ? 'border-violet-300/60 bg-violet-300/15 text-white' : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'}`}><span className="block text-xs font-bold">{path.label}</span><span className="mt-1 block text-[10px] leading-snug text-white/40">{path.description}</span></button>)}
            </div>
          </div>
        </section>

        <section className="mb-8 flex items-center justify-between gap-4 rounded-3xl border border-cyan-300/20 bg-surface/60 p-5">
          <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-200/70">Current mission</p><h2 className="mt-1 text-lg font-clash font-bold text-white">{curriculumMission.title}</h2><p className="mt-1 text-sm text-white/50">Learn, answer, and add one component to the model.</p></div>
          <button type="button" onClick={() => handleStartLesson(curriculumMission)} className="shrink-0 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200">Start task</button>
        </section>

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
              <p className="text-sm text-text-muted leading-relaxed">Ask Nova to synthesize a unique lesson tailored to your child&apos;s current development stage.</p>
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
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">PRIORITY</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-text-muted mb-2 block">{lesson.category}</span>
                  <h3 className="type-title font-clash text-white mb-3 group-hover:text-accent-neural transition-colors">{lesson.title}</h3>
                  <p className="text-text-muted font-instrument text-lg leading-relaxed">
                    Integrate high-order concepts of {(lesson.title || "this module").toLowerCase()} into {name}&apos;s active memory banks.
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

                  <h2 className="type-title font-clash font-bold text-white mb-4">Level {activeLevel} mission</h2>
                  <p className="type-subtitle font-instrument italic text-text-muted mb-8">
                    {getChallenge(selectedLesson).lesson}
                  </p>

                  <div className="mb-8 text-left">
                    <p className="mb-4 text-sm font-bold uppercase tracking-widest text-white/70">Mission: {getChallenge(selectedLesson).question}</p>
                    <div className="grid gap-3">
                      {getChallenge(selectedLesson).options.map((option, index) => {
                        const selected = selectedAnswer === index;
                        const correct = answerChecked && index === getChallenge(selectedLesson).answer;
                        const incorrect = answerChecked && selected && !correct;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => { setSelectedAnswer(index); setAnswerChecked(false); }}
                            className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${correct ? "border-emerald-400 bg-emerald-400/15 text-emerald-200" : incorrect ? "border-red-400 bg-red-400/10 text-red-200" : selected ? "border-accent-neural bg-accent-neural/15 text-white" : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"}`}
                          >
                            <span className="mr-3 text-white/40">{String.fromCharCode(65 + index)}.</span>{option}
                          </button>
                        );
                      })}
                    </div>
                    {answerChecked && selectedAnswer !== getChallenge(selectedLesson).answer && <p className="mt-3 text-sm text-red-300">Not quite. Try another answer.</p>}
                    {answerChecked && selectedAnswer === getChallenge(selectedLesson).answer && <p className="mt-3 text-sm text-emerald-300">Correct. Neural pathway strengthened.</p>}
                  </div>

                  <div className="space-y-4 mb-12">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-accent-neural to-accent-synapse rounded-full shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                        initial={{ width: "0%" }}
                        animate={{ width: answerChecked && selectedAnswer === getChallenge(selectedLesson).answer ? "100%" : "0%" }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs uppercase tracking-widest font-bold text-text-muted">
                      <span>Task progress</span>
                      <span>{answerChecked && selectedAnswer === getChallenge(selectedLesson).answer ? 'Complete' : 'Awaiting answer'}</span>
                    </div>
                  </div>

                  {!answerChecked || selectedAnswer !== getChallenge(selectedLesson).answer ? (
                    <motion.button
                      type="button"
                      onClick={() => setAnswerChecked(true)}
                      disabled={selectedAnswer === null}
                      className="w-full rounded-3xl bg-accent-neural py-5 font-clash text-lg text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Check Answer
                    </motion.button>
                  ) : (
                  <Link
                    href={`/garage?level=${activeLevel}`}
                    className="block w-full rounded-3xl bg-accent-neural py-5 text-center font-clash text-lg text-white transition-all hover:scale-[1.02]"
                  >
                    Open Practical Garage Task
                  </Link>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
