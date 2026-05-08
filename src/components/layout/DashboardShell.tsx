"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import PageTransition from "./PageTransition";
import LevelUpOverlay from "@/components/ui/LevelUpOverlay";
import InitializationService from "@/services/initialization.service";
import PersistenceService from "@/services/persistence.service";

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-void text-text-primary overflow-hidden">
      <InitializationService />
      <PersistenceService />
      <Sidebar />
      <main className="flex-1 relative bg-[radial-gradient(ellipse_at_center,rgba(13,13,32,1)_0%,rgba(5,5,16,1)_100%)] overflow-hidden">
        <PageTransition>{children}</PageTransition>
      </main>
      <LevelUpOverlay />
    </div>
  );
}
