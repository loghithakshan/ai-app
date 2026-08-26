"use client";

import { useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BrainCanvas from "@/components/brain/BrainCanvas";
import ChatWindow from "@/components/chat/ChatWindow";
import StatusHUD from "@/components/dashboard/StatusHUD";
import CognitiveInsights from "@/components/dashboard/CognitiveInsights";
import IntroSequence from "@/components/dashboard/IntroSequence";
import { useUserStore } from "@/store/userStore";
import { useChatStore } from "@/store/chatStore";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchApi } from "@/lib/api";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function DashboardPage() {
  const { name } = useUserStore();
  const { isTyping } = useChatStore();
  const isMobile = useIsMobile();
  const [showIntro, setShowIntro] = useState(() =>
    typeof sessionStorage !== "undefined" ? !sessionStorage.getItem("neurobloom_intro_seen") : true
  );
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  const handleIntroComplete = async () => {
    setShowIntro(false);
    sessionStorage.setItem("neurobloom_intro_seen", "true");
    
    // Log the "Birth" memory shard
    try {
      if (!isSupabaseConfigured) return;
      await fetchApi("/api/memories", {
        method: "POST",
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
    <main className="relative flex h-full min-h-0 w-full overflow-hidden bg-void font-inter text-text-primary">
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
        className="flex h-full min-h-0 w-full flex-col lg:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 1 }}
      >
        {/* Center: The Neural Command Center */}
        <div className={`relative min-h-0 min-w-0 flex-1 border-surface-glow/20 ${isMobile ? 'h-1/3' : 'h-full border-x'}`}>
          <div className="absolute inset-0">
             <BrainCanvas />
          </div>
          
          {/* Floating HUD */}
          <div className={`pointer-events-none absolute left-1/2 z-30 w-full -translate-x-1/2 ${isMobile ? 'top-14 scale-75' : 'top-8'}`}>
            <StatusHUD />
          </div>

          {/* Cognitive Telemetry */}
          <div className={`pointer-events-none absolute left-4 z-30 ${isMobile ? 'bottom-4 scale-75' : 'bottom-16'}`}>
             <CognitiveInsights />
          </div>

          {/* Perspective Indicator Overlay */}
          {!isMobile && (
            <div className="pointer-events-none absolute bottom-6 right-6 z-30">
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
          )}
        </div>

        {/* Right: Interaction Terminal */}
        <aside className={`flex min-h-0 shrink-0 flex-col transition-all duration-500 ${isMobile ? 'h-2/3 w-full' : 'h-full w-[420px]'} ${isTyping ? 'animate-neural-surge border-accent-neural/40' : 'glass-morphism border-surface-glow/20'}`}>
          <ChatWindow />
        </aside>
      </motion.div>
    </main>
  );
}
