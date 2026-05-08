"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DashboardShell from "./DashboardShell";

// Pages that should NOT have the dashboard sidebar
const PUBLIC_PATHS = ["/", "/birth"];

export default function ConditionalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (isPublic) {
    return <>{children}</>;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
