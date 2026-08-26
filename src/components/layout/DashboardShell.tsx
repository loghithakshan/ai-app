"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import PageTransition from "./PageTransition";
import LevelUpOverlay from "@/components/ui/LevelUpOverlay";
import PersistenceService from "@/services/persistence.service";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-void text-text-primary relative">
      <PersistenceService />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden absolute top-4 left-4 z-50 p-2 rounded-xl bg-surface/50 backdrop-blur-md border border-white/10"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-void/80 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-80 z-[70] shadow-2xl"
            >
              <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="relative min-w-0 flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(13,13,32,1)_0%,rgba(5,5,16,1)_100%)]">
        <PageTransition>{children}</PageTransition>
      </main>
      <LevelUpOverlay />
    </div>
  );
}
