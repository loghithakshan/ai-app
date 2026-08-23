"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Brain, 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Settings, 
  Zap,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

const MENU_ITEMS = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { id: "brain", label: "Neural Map", icon: Brain, href: "/neural-map" },
  { id: "lessons", label: "Learning", icon: BookOpen, href: "/lessons" },
  { id: "memories", label: "Memories", icon: History, href: "/memories" },
  { id: "report", label: "Evolution Report", icon: Zap, href: "/report-card" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 lg:w-64 h-full bg-surface/20 backdrop-blur-xl border-r border-surface-glow/30 flex flex-col shrink-0 transition-all duration-500 overflow-hidden group">
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 gap-3 border-b border-surface-glow/20">
        <div className="w-10 h-10 rounded-2xl bg-accent-neural flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <span className="font-clash font-bold text-xl tracking-tight hidden lg:block">NeuroBloom</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all cursor-pointer group/item ${
                  isActive 
                    ? "bg-accent-neural/10 text-accent-neural" 
                    : "text-text-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover/item:scale-110 ${isActive ? "text-accent-neural" : ""}`} />
                <span className="font-medium text-sm hidden lg:block">{item.label}</span>
                {isActive && (
                   <motion.div 
                     layoutId="sidebar-active"
                     className="absolute left-0 w-1 h-8 bg-accent-neural rounded-r-full lg:hidden"
                   />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile/Booster */}
      <div className="p-4 mt-auto">
        <div className="bg-surface/40 border border-surface-glow/40 rounded-3xl p-4 hidden lg:block relative overflow-hidden">
           <div className="absolute top-0 right-0 p-2 opacity-20">
              <Zap className="w-8 h-8 text-accent-neural" />
           </div>
           <p className="text-[10px] font-bold text-accent-neural uppercase tracking-widest mb-1">Boost Active</p>
           <h4 className="text-xs font-semibold text-white mb-3">Neural Surge V.1</h4>
           <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent-neural"
                animate={{ width: "65%" }}
              />
           </div>
        </div>
        
        <Link href="/settings" className="mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-colors group/settings">
          <Settings className="w-5 h-5 text-text-muted group-hover/settings:rotate-90 transition-transform duration-500" />
          <span className="text-sm font-medium text-text-muted hidden lg:block">System Config</span>
        </Link>
      </div>
    </aside>
  );
}
