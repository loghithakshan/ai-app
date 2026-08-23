"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import PageTransition from "./PageTransition";
import LevelUpOverlay from "@/components/ui/LevelUpOverlay";
import PersistenceService from "@/services/persistence.service";

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-void text-text-primary">
      <PersistenceService />
      <Sidebar />
      <main className="relative min-w-0 flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(13,13,32,1)_0%,rgba(5,5,16,1)_100%)]">
        <PageTransition>{children}</PageTransition>
      </main>
      <LevelUpOverlay />
    </div>
  );
}
