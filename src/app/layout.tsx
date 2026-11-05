import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import ConditionalShell from "@/components/layout/ConditionalShell";
import { cn } from "@/lib/utils";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const clashFallback = Space_Grotesk({ subsets: ["latin"], variable: "--font-clash" });
const instrumentFallback = { variable: "--font-instrument" }; // Using system serif for reliability in build

export const metadata: Metadata = {
  title: "NeuroBloom — Raise Your AI Mind",
  description:
    "A premium AI companion app where users raise, teach, and bond with their own AI child that grows through 6 distinct stages of consciousness.",
  keywords: ["AI companion", "AI child", "neural", "NeuroBloom", "deep space"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NeuroBloom",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "NeuroBloom — Raise Your AI Mind",
    description: "The first AI that truly grows with you.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

import AmbientBackground from "@/components/layout/AmbientBackground";
import AudioService from "@/services/audio.service";
import AndroidBackHandler from "@/components/layout/AndroidBackHandler";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", sans.variable)}>
      <body
        className={`${clashFallback.variable} ${instrumentFallback.variable} bg-void text-text-primary antialiased`}
      >
        <AndroidBackHandler />
        <AudioService />
        <AmbientBackground />
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
