"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DashboardShell from "./DashboardShell";
import InitializationService from "@/services/initialization.service";

// Pages that should NOT have the dashboard sidebar
const PUBLIC_PATHS = ["/", "/birth", "/login", "/signup"];

export default function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  return (
    <>
      <InitializationService />
      {isPublic ? children : <DashboardShell>{children}</DashboardShell>}
    </>
  );
}

