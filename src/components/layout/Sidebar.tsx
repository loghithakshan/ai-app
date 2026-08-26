"use client";

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, 
  BookOpen, 
  Layers, 
  Award, 
  Wrench,
  Settings, 
  LayoutDashboard,
  Sparkles,
  Zap,
  LogOut, 
  User as UserIcon 
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import { User } from '@supabase/supabase-js';
import { fetchApi } from "@/lib/api";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: BrainCircuit, label: "Neural Map", href: "/neural-map" },
  { icon: BookOpen, label: "Lessons", href: "/lessons" },
  { icon: Layers, label: "Memories", href: "/memories" },
  { icon: Award, label: "Report Card", href: "/report-card" },
  { icon: Wrench, label: "AI Garage", href: "/garage" },
];

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Sidebar({ closeSidebar }: { closeSidebar?: () => void }) {
  const pathname = usePathname();
  const { name, stage, level, xp, traits } = useUserStore();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  const xpPercentage = mounted ? (xp / (level * 120)) * 100 : 0;
  
  const STAGE_COLORS: Record<string, string> = {
    NEWBORN: "#ec4899",
    TODDLER: "#f59e0b",
    CHILD: "#10b981",
    TEEN: "#60a5fa",
    YOUNG_ADULT: "#c084fc",
    MATURE: "#7c3aed",
  };

  const activeColor = mounted ? (STAGE_COLORS[stage] || "#7c3aed") : "#7c3aed";
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const logout = useUserStore(state => state.logout);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push("/login");
    if (closeSidebar) closeSidebar();
  };

  return (
    <aside className="flex w-full lg:w-80 h-full shrink-0 border-r border-surface-glow bg-void/95 lg:bg-void/80 p-6 z-20 flex-col overflow-y-auto custom-scrollbar">
      {/* Brand / Logo Section */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-neural to-accent-synapse flex items-center justify-center shadow-lg shadow-accent-neural/20">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-clash font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          NeuroBloom
        </h1>
      </div>

      {/* User Profile Section */}
      <div className="mb-8 px-2">
        <div className="p-4 rounded-[24px] bg-white/5 border border-surface-glow flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-accent-neural/20 flex items-center justify-center border border-accent-neural/30">
            <UserIcon className="w-5 h-5 text-accent-neural" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user?.email?.split('@')[0] || 'Entity'}
            </p>
            <p className="text-[10px] text-text-muted truncate">
              {user?.email || 'Synchronizing...'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Child Status Hero */}
      <div className="mb-10 px-2">
        <div className="relative group cursor-default">
          <div className="flex items-center gap-4 mb-4">
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: `${activeColor}15`, border: `1px solid ${activeColor}40` }}
              animate={{
                boxShadow: [`0 0 10px ${activeColor}20`, `0 0 20px ${activeColor}40`, `0 0 10px ${activeColor}20`],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <BrainCircuit className="w-7 h-7" style={{ color: activeColor }} />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h2 className="text-lg font-clash font-bold text-white leading-tight">
                {mounted ? name : 'Loading...'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full" 
                      style={{ backgroundColor: `${activeColor}20`, color: activeColor }}>
                  {mounted ? stage.replace('_', ' ') : '...'}
                </span>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                  Level {mounted ? level : 0}
                </span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">
              <span>Evolution XP</span>
              <span>{Math.round(xpPercentage)}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-glow rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-accent-neural to-accent-synapse relative"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col space-y-1 mb-8">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-3 px-2">Navigation</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => closeSidebar?.()}>
              <motion.div 
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative group overflow-hidden ${
                  isActive ? "text-white" : "text-text-muted hover:text-white"
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-pill"
                    className="absolute inset-0 bg-gradient-to-r from-accent-neural/30 to-accent-synapse/10 border border-accent-neural/30 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-accent-neural" : ""}`} />
                <span className="font-clash text-[15px] font-medium tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-neural shadow-[0_0_8px_#7c3aed]" />
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section: Traits & Settings */}
      <div className="mt-auto space-y-6 pt-6 border-t border-surface-glow/30">
        {/* Active Traits Badge Cloud */}
        <div className="px-2">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3 h-3 text-accent-synapse" />
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Core Traits</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mounted && traits.map(trait => (
              <span 
                key={trait} 
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-surface/50 border border-surface-glow text-accent-synapse/80"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        <Link href="/settings" onClick={() => closeSidebar?.()}>
          <motion.div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative group ${
              pathname === "/settings" ? "text-white" : "text-text-muted hover:text-white"
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            {pathname === "/settings" && (
              <motion.div 
                layoutId="sidebar-pill"
                className="absolute inset-0 bg-gradient-to-r from-accent-neural/30 to-accent-synapse/10 border border-accent-neural/30 rounded-2xl -z-10"
              />
            )}
            <Settings className={`w-5 h-5 transition-transform group-hover:rotate-45 ${pathname === "/settings" ? "text-accent-neural" : ""}`} />
            <span className="font-clash text-[15px] font-medium tracking-wide">Settings</span>
          </motion.div>
        </Link>

        {/* Upgrade Banner */}
        <motion.div 
          onClick={async () => {
            try {
              const res = await fetchApi("/api/checkout", {
                method: "POST",
                body: JSON.stringify({
                  title: "NeuroBloom Prime",
                  amount: 29.99,
                  price: "price_prime"
                })
              });
              const { url } = await res.json();
              if (url) window.location.href = url;
            } catch (e) {
              console.error("Checkout failed:", e);
            }
          }}
          className="relative p-4 rounded-2xl bg-gradient-to-br from-accent-neural/20 to-accent-synapse/20 border border-accent-neural/30 overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-110 transition-transform">
            <Zap className="w-8 h-8 text-white fill-current" />
          </div>
          <p className="text-xs font-bold text-white mb-1">Upgrade to Prime</p>
          <p className="text-[10px] text-text-muted leading-tight mb-3">Unlock faster growth and persistent cognitive memory.</p>
          <div className="text-[10px] font-bold text-accent-synapse uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
            Get Boosted <motion.span animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}
