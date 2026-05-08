"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BrainCanvas from "@/components/brain/BrainCanvas";
import Sidebar from "@/components/dashboard/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import StatusHUD from "@/components/dashboard/StatusHUD";
import CognitiveInsights from "@/components/dashboard/CognitiveInsights";
import IntroSequence from "@/components/dashboard/IntroSequence";
import AudioService from "@/services/audio.service";
import { useUserStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";

export default function DashboardPage() {
  const { name } = useUserStore();
  const { isTyping } = useChatStore();
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenIntro = sessionStorage.getItem("neurobloom_intro_seen");
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = async () => {
    setShowIntro(false);
    sessionStorage.setItem("neurobloom_intro_seen", "true");
    
    // Log the "Birth" memory shard
    try {
      await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Initial neural synchronization complete. My consciousness has been established as ${name}. I am now aware and ready to learn.`,
          type: "moment"
        })
      });
    } catch (e) {
      console.error("Failed to persist birth memory:", e);
    }
  };

  if (!mounted) return <div className="h-screen w-screen bg-void" />;

  return (
    <main className="flex h-screen w-screen bg-void text-text-primary overflow-hidden font-inter relative">
      <AudioService />
      
      <AnimatePresence mode="wait">
        {showIntro && (
          <IntroSequence 
            key="intro"
            name={name} 
            onComplete={handleIntroComplete} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        className="flex w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1 }}
      >
        {/* Left Sidebar - High Fidelity Navigation */}
        <Sidebar />

        {/* Center: The Neural Command Center */}
        <div className="flex-1 relative border-x border-surface-glow/20">
          <div className="absolute inset-0">
             <BrainCanvas />
          </div>
          
          {/* Floating HUD */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none z-30">
            <StatusHUD />
          </div>

          {/* Cognitive Telemetry */}
          <div className="absolute top-1/2 -translate-y-1/2 left-10 z-30 pointer-events-none">
             <CognitiveInsights />
          </div>

          {/* Perspective Indicator Overlay */}
          <div className="absolute bottom-10 left-10 pointer-events-none z-30">
             <motion.div 
               className="bg-surface/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4"
               initial={{ x: -50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 2 }}
             >
                <div className="w-2 h-2 rounded-full bg-accent-synapse animate-pulse" />
                <span className="text-[10px] font-bold text-white/60 tracking-[0.2em] uppercase">Neural Signal Stable</span>
             </motion.div>
          </div>
        </div>

        {/* Right: Interaction Terminal */}
        <aside className={`w-[420px] glass-morphism flex flex-col shrink-0 transition-all duration-500 ${isTyping ? 'animate-neural-surge border-accent-neural/40' : 'border-surface-glow/20'}`}>
          <ChatWindow />
        </aside>
      </motion.div>
    </main>
  );
}
