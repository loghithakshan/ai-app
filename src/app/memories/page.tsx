"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Star, 
  Clock, 
  Zap, 
  Heart, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Copy, 
  Check, 
  Eye, 
  Edit3,
  ArrowUpDown
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useMemoryStore, MemoryNode } from "@/store/memoryStore";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  emotional: Heart,
  factual: Brain,
  skill: Zap,
  value: Star,
  moment: Clock,
};

const colorMap: Record<string, { badge: string; text: string; bg: string; border: string; glow: string }> = {
  emotional: {
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30 hover:border-rose-400/60",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.15)]",
  },
  factual: {
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30 hover:border-cyan-400/60",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.15)]",
  },
  skill: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30 hover:border-amber-400/60",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
  },
  value: {
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30 hover:border-purple-400/60",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.15)]",
  },
  moment: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30 hover:border-emerald-400/60",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
  },
};

const CATEGORIES = [
  { id: "all", label: "All Shards" },
  { id: "emotional", label: "Emotional" },
  { id: "factual", label: "Factual" },
  { id: "skill", label: "Skills" },
  { id: "value", label: "Values" },
  { id: "moment", label: "Moments" },
];

export default function MemoriesPage() {
  const { level, totalXp, name } = useUserStore();
  const memories = useMemoryStore((state) => state.memories);
  const addMemory = useMemoryStore((state) => state.addMemory);
  const deleteMemory = useMemoryStore((state) => state.deleteMemory);
  const updateMemory = useMemoryStore((state) => state.updateMemory);
  const fetchMemoriesFromApi = useMemoryStore((state) => state.fetchMemoriesFromApi);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  // Inspection modal state
  const [activeModalMemoryId, setActiveModalMemoryId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteInput, setNoteInput] = useState("");

  // Create memory modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<string>("moment");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    async function init() {
      await fetchMemoriesFromApi();
      setLoading(false);
    }
    init();
  }, [fetchMemoriesFromApi]);

  // Filter & sort memories
  const filteredMemories = useMemo(() => {
    let result = [...memories];

    if (selectedCategory !== "all") {
      result = result.filter((m) => (m.type || "").toLowerCase() === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          (m.content || "").toLowerCase().includes(q) ||
          (m.type || "").toLowerCase().includes(q) ||
          (m.notes && m.notes.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      return sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    });

    return result;
  }, [memories, selectedCategory, searchQuery, sortOrder]);

  const activeMemoryIndex = useMemo(() => {
    if (!activeModalMemoryId) return -1;
    return filteredMemories.findIndex((m) => m.id === activeModalMemoryId);
  }, [activeModalMemoryId, filteredMemories]);

  const activeMemory = useMemo(() => {
    if (activeMemoryIndex === -1) return null;
    return filteredMemories[activeMemoryIndex];
  }, [activeMemoryIndex, filteredMemories]);

  const openModalForMemory = (m: MemoryNode) => {
    setActiveModalMemoryId(m.id);
    setNoteInput(m.notes || "");
    setIsEditingNotes(false);
    setCopied(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = () => {
    if (activeMemory) {
      updateMemory(activeMemory.id, { notes: noteInput });
      setIsEditingNotes(false);
    }
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const created = addMemory({
      content: newContent.trim(),
      type: newType,
      notes: newNotes.trim(),
      timestamp: Date.now(),
    });

    setNewContent("");
    setNewNotes("");
    setIsCreateOpen(false);
    openModalForMemory(created);
  };

  const navigateModal = (direction: "prev" | "next") => {
    if (activeMemoryIndex === -1) return;
    const nextIdx =
      direction === "next"
        ? (activeMemoryIndex + 1) % filteredMemories.length
        : (activeMemoryIndex - 1 + filteredMemories.length) % filteredMemories.length;
    openModalForMemory(filteredMemories[nextIdx]);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto p-4 pb-24 custom-scrollbar sm:p-8 sm:pb-8">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <motion.h1 
            className="type-title font-clash font-bold text-white mb-1 text-2xl sm:text-3xl flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Core Memories
            <span className="text-xs px-2.5 py-1 rounded-full bg-accent-neural/20 border border-accent-neural/40 text-accent-neural font-mono">
              {memories.length} Shards
            </span>
          </motion.h1>
          <motion.p 
            className="type-subtitle text-text-muted font-instrument italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            The persistent building blocks of {name}&apos;s consciousness. Click any memory shard to inspect.
          </motion.p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-accent-neural hover:bg-accent-neural/90 text-white font-clash font-semibold text-sm shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Etch Core Memory
        </motion.button>
      </header>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-200/70">Growth Chapters</p>
          <p className="mt-2 text-2xl font-clash font-bold text-white">Chapter {Math.max(1, memories.length)}</p>
          <p className="mt-1 text-sm text-white/50">{memories.length} total core memories recorded</p>
        </div>
        <div className="rounded-2xl border border-violet-300/20 bg-violet-300/5 p-5 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-200/70">Learning Level</p>
          <p className="mt-2 text-2xl font-clash font-bold text-white">Level {level}</p>
          <p className="mt-1 text-sm text-white/50">{totalXp} XP accumulated</p>
        </div>
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/5 p-5 backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200/70">Active Lattice Filter</p>
          <p className="mt-2 text-2xl font-clash font-bold text-white capitalize">{selectedCategory}</p>
          <p className="mt-1 text-sm text-white/50">Showing {filteredMemories.length} matching entries</p>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-void/60 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past memories, thoughts, or notes..."
            className="w-full rounded-xl border border-surface-glow bg-surface/40 py-2.5 pl-11 pr-10 text-sm text-white placeholder-text-muted/60 focus:border-accent-neural focus:outline-none focus:ring-1 focus:ring-accent-neural"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Pills & Sort Selector */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 rounded-xl bg-surface/40 p-1 border border-surface-glow">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-accent-neural text-white shadow-md"
                      : "text-text-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-1.5 rounded-xl border border-surface-glow bg-surface/40 px-3 py-2 text-xs font-semibold text-text-muted hover:border-accent-neural hover:text-white transition-all"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-accent-neural" />
            <span className="capitalize">{sortOrder}</span>
          </button>
        </div>
      </div>

      {/* Main Content List / Grid */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Brain className="h-12 w-12 text-accent-neural opacity-50" />
          </motion.div>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="mx-auto flex flex-1 max-w-md flex-col items-center justify-center py-16 text-center">
          <Brain className="mb-6 h-20 w-20 text-accent-neural/20" />
          <h3 className="type-title mb-2 font-clash text-xl font-bold text-white">No Matching Memories</h3>
          <p className="text-sm text-text-muted">
            {searchQuery || selectedCategory !== "all"
              ? "No core memories match your search query or filter. Try clearing filters."
              : "Chat with Nova to help them learn and grow. Meaningful interactions will be permanently etched here."}
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 rounded-xl border border-accent-neural/40 bg-accent-neural/10 px-4 py-2 text-xs font-semibold text-accent-neural hover:bg-accent-neural/20"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-6xl pb-32">
          <div className="relative pb-4">
            {/* Neural Spine line */}
            <div className="absolute bottom-0 left-1/2 top-0 hidden w-[1px] bg-gradient-to-b from-accent-neural/0 via-accent-neural/20 to-accent-neural/0 lg:block" />

            <div className="relative flex flex-col gap-6">
              {filteredMemories.map((memory, i) => {
                const typeKey = (memory.type || "moment").toLowerCase();
                const Icon = iconMap[typeKey] || Clock;
                const colors = colorMap[typeKey] || colorMap.moment;
                const isEven = i % 2 === 0;

                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`flex flex-col gap-6 lg:flex-row ${
                      isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                    } items-center`}
                  >
                    {/* The Clickable Memory Card */}
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      onClick={() => openModalForMemory(memory)}
                      className={`group relative flex-1 cursor-pointer overflow-hidden rounded-[2rem] border bg-void/60 p-6 backdrop-blur-xl transition-all duration-300 ${colors.border} ${colors.glow}`}
                    >
                      {/* Ambient background hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      <div className="relative z-10 flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl border backdrop-blur-md ${colors.badge}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
                              Data Shard
                            </span>
                            <h3 className="font-clash text-lg font-semibold text-white capitalize flex items-center gap-2">
                              {memory.type} Memory
                              <span className={`w-2 h-2 rounded-full animate-pulse ${colors.text.replace('text', 'bg')}`} />
                            </h3>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="block text-[10px] font-bold uppercase tracking-[0.15em] opacity-40">
                            Neural Stamp
                          </span>
                          <span className="text-xs font-mono opacity-80 text-white">
                            {new Date(memory.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Memory Content Preview */}
                      <p className="relative z-10 font-instrument text-base leading-relaxed text-white/90 italic mb-4 line-clamp-3">
                        &quot;{memory.content}&quot;
                      </p>

                      {/* Additional Notes preview if present */}
                      {memory.notes && (
                        <div className="relative z-10 mb-4 rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-text-muted">
                          <span className="font-bold text-accent-synapse">Notes: </span>
                          {memory.notes}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                        <span className="text-[11px] font-semibold text-white/50 group-hover:text-white/80 transition-colors flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-accent-neural" />
                          Click to view full memory
                        </span>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60 group-hover:bg-accent-neural/20 group-hover:text-accent-neural transition-colors">
                          Inspect Shard →
                        </span>
                      </div>
                    </motion.div>

                    {/* Timeline Spine Node */}
                    <div className="hidden lg:flex w-10 h-10 rounded-full bg-void border-2 border-surface-glow items-center justify-center relative z-20 shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full animate-ping absolute ${colors.text.replace('text', 'bg')}`} />
                      <div className={`w-2.5 h-2.5 rounded-full ${colors.text.replace('text', 'bg')}`} />
                    </div>

                    {/* Spacer for alternate layout */}
                    <div className="flex-1 hidden lg:block" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FULL MEMORY INSPECTION MODAL */}
      <AnimatePresence>
        {activeMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalMemoryId(null)}
              className="absolute inset-0 bg-void/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-surface-glow/80 bg-surface/90 p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-10"
            >
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl border ${colorMap[(activeMemory.type || "moment").toLowerCase()]?.badge || colorMap.moment.badge}`}>
                    {(() => {
                      const Icon = iconMap[(activeMemory.type || "moment").toLowerCase()] || Clock;
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-neural">
                      Memory Shard #{activeMemoryIndex + 1}
                    </span>
                    <h2 className="font-clash text-xl font-bold text-white capitalize">
                      {activeMemory.type} Memory Shard
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalMemoryId(null)}
                  className="rounded-full bg-white/5 p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Memory Body */}
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="rounded-2xl border border-white/10 bg-void/50 p-6 backdrop-blur-sm">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                    Neural Content
                  </span>
                  <p className="font-instrument text-lg leading-relaxed text-white italic">
                    &quot;{activeMemory.content}&quot;
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <span className="block text-[10px] uppercase font-bold text-white/40">Timestamp</span>
                    <span className="font-mono text-white text-xs mt-1 block">
                      {new Date(activeMemory.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <span className="block text-[10px] uppercase font-bold text-white/40">Category</span>
                    <span className="font-semibold text-white capitalize mt-1 block">
                      {activeMemory.type}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 rounded-xl border border-white/5 bg-white/5 p-3">
                    <span className="block text-[10px] uppercase font-bold text-white/40">Resonance</span>
                    <span className="font-semibold text-emerald-400 mt-1 block">
                      100% Synced
                    </span>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="rounded-2xl border border-white/10 bg-void/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white/70 flex items-center gap-2">
                      <Edit3 className="w-3.5 h-3.5 text-accent-synapse" />
                      Personal Reflections & Notes
                    </span>
                    {!isEditingNotes ? (
                      <button
                        onClick={() => setIsEditingNotes(true)}
                        className="text-[11px] text-accent-synapse font-semibold hover:underline"
                      >
                        {activeMemory.notes ? "Edit Note" : "+ Add Note"}
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveNotes}
                        className="text-[11px] text-emerald-400 font-semibold hover:underline"
                      >
                        Save Note
                      </button>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <textarea
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add personal notes or context to this memory shard..."
                      className="w-full h-24 rounded-xl border border-surface-glow bg-surface/60 p-3 text-xs text-white placeholder-text-muted focus:border-accent-neural focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-text-muted italic">
                      {activeMemory.notes || "No extra notes attached to this shard."}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Controls & Navigation */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                {/* Prev / Next Pagination */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateModal("prev")}
                    className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    onClick={() => navigateModal("next")}
                    className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeMemory.content)}
                    className="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/20 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy Text"}
                  </button>

                  <button
                    onClick={() => {
                      deleteMemory(activeMemory.id);
                      setActiveModalMemoryId(null);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Prune Shard
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE MEMORY MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
              className="absolute inset-0 bg-void/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-surface-glow/80 bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-accent-neural/20 border border-accent-neural/40 text-accent-neural">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-clash text-xl font-bold text-white">Etch Core Memory</h2>
                    <p className="text-xs text-text-muted">Record a new memory directly into {name}&apos;s lattice.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-full bg-white/5 p-2 text-text-muted hover:bg-white/10 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMemory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Memory Category
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full rounded-xl border border-surface-glow bg-surface/60 p-3 text-sm text-white focus:border-accent-neural focus:outline-none"
                  >
                    <option value="moment">Moment (Key experience)</option>
                    <option value="emotional">Emotional (Bond & feeling)</option>
                    <option value="skill">Skill (Cognitive ability)</option>
                    <option value="factual">Factual (Knowledge & logic)</option>
                    <option value="value">Value (Belief & principle)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Memory Content *
                  </label>
                  <textarea
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Describe what occurred or what was learned..."
                    className="w-full h-28 rounded-xl border border-surface-glow bg-surface/60 p-3 text-sm text-white placeholder-text-muted/60 focus:border-accent-neural focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Extra context or reflection..."
                    className="w-full rounded-xl border border-surface-glow bg-surface/60 p-3 text-sm text-white placeholder-text-muted/60 focus:border-accent-neural focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-accent-neural px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-accent-neural/90"
                  >
                    Etch Memory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
