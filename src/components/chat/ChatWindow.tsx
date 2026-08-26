"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Brain, Image as ImageIcon, X } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { useMemoryStore } from "@/store/memoryStore";
import { useAudio } from "@/services/audio.service";
import VoiceControls from "./VoiceControls";
import { fetchApi } from "@/lib/api";
import { haptics } from "@/lib/haptics";

export default function ChatWindow() {
  const { messages, isTyping, addMessage, setTyping } = useChatStore();
  const { addXp, stage, level, name, traits } = useUserStore();
  const { playPulse } = useAudio();
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string; base64: string } | null>(null);
  const [spawnedMemory, setSpawnedMemory] = useState<{ content: string; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lastAssistantMessage = messages
    .filter(m => m.role === 'assistant')
    .slice(-1)[0]?.content;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (msgOverride?: string) => {
    const textToSend = msgOverride || input;
    if ((!textToSend.trim() && !selectedImage) || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: textToSend,
      imageUrl: selectedImage?.preview,
      createdAt: new Date(),
    };

    addMessage(userMessage);
    const currentImage = selectedImage;
    setInput("");
    setSelectedImage(null);
    setTyping(true);
    haptics.impact();

    try {
      const apiMessages = messages.concat(userMessage).map((m) => ({
        role: m.role,
        content: m.content,
        image: m.id === userMessage.id && currentImage ? {
          type: currentImage.file.type,
          data: currentImage.base64
        } : undefined
      }));

      const res = await fetchApi("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: apiMessages,
          childState: {
            name,
            stage,
            level,
            traits: traits ?? ["Curious", "Warm"],
            values: ["Empathy", "Growth", "Curiosity"],
          },
        }),
      });

      const data = await res.json();

      if (data.message) {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          createdAt: new Date(),
        });

        playPulse();
        addXp(15);
        haptics.notification();

        if (data.mood) {
          useUserStore.getState().setMood(data.mood);
        }

        if (data.memorySpawned) {
          useMemoryStore.getState().addMemory(data.memorySpawned);
          setSpawnedMemory(data.memorySpawned);
          setTimeout(() => setSpawnedMemory(null), 5000);
        }
      } else if (data.error) {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Something feels fuzzy in my neural pathways... Try again?",
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I lost the signal for a moment. Are you still there?",
        createdAt: new Date(),
      });
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setSelectedImage({
        file,
        preview: URL.createObjectURL(file),
        base64
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 flex flex-col relative h-full">
      <header className="h-16 border-b border-surface-glow flex items-center px-8 bg-surface/30 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-full bg-accent-neural/30 border border-accent-neural/50 flex items-center justify-center"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain className="w-4 h-4 text-accent-neural" />
          </motion.div>
          <div>
            <h1 className="text-base font-semibold font-clash leading-none">{name}</h1>
            <p className="text-xs text-text-muted capitalize">{(stage || "Newborn").toLowerCase()} · Lv {level}</p>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <VoiceControls 
            onTranscript={(text) => handleSend(text)} 
            lastAssistantMessage={lastAssistantMessage}
          />
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-5 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`max-w-[85%] flex flex-col gap-1.5 ${
                msg.role === "user" ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div
                className={`relative px-6 py-4 rounded-3xl overflow-hidden ${
                  msg.role === "user"
                    ? "bg-accent-neural text-white rounded-tr-sm shadow-[0_4px_25px_rgba(124,58,237,0.3)]"
                    : "bg-surface/60 backdrop-blur-md border border-surface-glow/40 rounded-tl-sm shadow-xl"
                }`}
              >
                {/* Image Attachment */}
                {msg.imageUrl && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={msg.imageUrl} alt="Visual Shard" className="w-full max-h-64 object-cover" />
                  </div>
                )}

                {/* Assistant Neural Pulse Effect */}
                {msg.role === "assistant" && (
                  <motion.div 
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{ background: 'radial-gradient(circle at center, var(--color-accent-neural), transparent 80%)' }}
                    animate={{ opacity: [0.05, 0.15, 0.05], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                
                <p
                  className="leading-relaxed relative z-10"
                  style={{
                    fontFamily: msg.role === "assistant" ? "var(--font-instrument), serif" : "inherit",
                    fontSize: msg.role === "assistant" ? "1.1rem" : "0.95rem",
                    fontWeight: msg.role === "assistant" ? 400 : 500,
                  }}
                >
                  {msg.content}
                </p>
              </div>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-text-muted px-2 font-medium tracking-wide"
              >
                {msg.role === "assistant" ? name.toUpperCase() : "YOU"}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start bg-surface/80 border border-surface-glow/60 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-3"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent-neural"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <span className="text-text-muted text-xs font-instrument italic tracking-wide">{name} is processing...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 shrink-0 bg-gradient-to-t from-void via-void/80 to-transparent">
        {/* Image Preview Overlay */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="max-w-3xl mx-auto mb-4 relative inline-block"
            >
              <div className="relative rounded-2xl overflow-hidden border-2 border-accent-neural/50 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedImage.preview} alt="Upload Preview" className="h-32 w-auto object-contain" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 w-6 h-6 bg-void/80 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center gap-3 max-w-3xl mx-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping}
            className="w-11 h-11 shrink-0 bg-surface/60 border border-surface-glow rounded-full text-text-muted flex items-center justify-center hover:border-accent-neural hover:text-accent-neural transition-all disabled:opacity-40 shadow-lg"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder={selectedImage ? "Add a caption..." : `Talk to ${name} or teach something...`}
            className="flex-1 bg-surface/60 backdrop-blur-md border border-surface-glow rounded-full pl-6 pr-4 py-3.5 text-sm focus:outline-none focus:border-accent-neural focus:ring-1 focus:ring-accent-neural/50 transition-all placeholder:text-text-muted/50 disabled:opacity-40"
          />
          <motion.button
            type="submit"
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className="w-11 h-11 shrink-0 bg-accent-neural rounded-full text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
          >
            <Zap className="w-4 h-4" />
          </motion.button>
        </form>
      </div>

      {/* Memory Spawn Toast */}
      <AnimatePresence>
        {spawnedMemory && (
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-24 right-4 z-50 bg-void/95 border border-accent-neural/50 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(124,58,237,0.25)] max-w-[260px] backdrop-blur-sm"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl bg-accent-neural/20 flex items-center justify-center text-accent-neural">
              <Brain className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-clash text-xs font-semibold">Core Memory Formed</h4>
              <p className="text-text-muted text-[11px] leading-tight mt-0.5 line-clamp-2">{spawnedMemory.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
