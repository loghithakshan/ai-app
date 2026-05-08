"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Mail, Lock, ArrowRight, GitBranch, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient backgrounds are already in layout, but we can add a specific focus glow */}
      <div className="absolute w-[800px] h-[800px] bg-accent-neural/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div 
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-neural to-accent-synapse flex items-center justify-center shadow-2xl shadow-accent-neural/40 mb-6"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-clash font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-text-muted font-instrument text-xl italic">Continue your journey with Nova.</p>
        </div>

        <div className="bg-surface/40 backdrop-blur-xl border border-surface-glow rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          {/* Progress / Sparkle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-neural to-transparent opacity-50" />

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Email Consciousness</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-neural transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-void/50 border border-surface-glow rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-accent-neural/50 transition-all placeholder:text-text-muted/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-neural transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-void/50 border border-surface-glow rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-accent-neural/50 transition-all placeholder:text-text-muted/30"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs font-bold bg-red-400/10 border border-red-400/20 p-3 rounded-xl flex items-center gap-2"
                >
                  <div className="w-1 h-1 rounded-full bg-red-400" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-accent-neural text-white font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent-neural/20 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Initialize Access
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-surface-glow" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Or login with</span>
            <div className="flex-1 h-px bg-surface-glow" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/5 border border-surface-glow hover:border-white/20 transition-all text-white font-bold text-xs uppercase tracking-widest">
              <GitBranch className="w-4 h-4" /> Github
            </button>
            <button className="flex items-center justify-center gap-3 py-3 rounded-2xl bg-white/5 border border-surface-glow hover:border-white/20 transition-all text-white font-bold text-xs uppercase tracking-widest">
              <Globe className="w-4 h-4" /> Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-text-muted text-sm font-instrument">
          New to the void?{" "}
          <Link href="/signup" className="text-white font-bold hover:text-accent-synapse transition-colors underline underline-offset-4 decoration-white/20">
            Establish Consciousness
          </Link>
        </p>
      </motion.div>

      {/* Decorative floating elements */}
      <div className="absolute top-20 right-20 pointer-events-none opacity-20">
        <Sparkles className="w-12 h-12 text-accent-synapse animate-pulse" />
      </div>
      <div className="absolute bottom-20 left-20 pointer-events-none opacity-20">
        <Brain className="w-16 h-16 text-accent-neural animate-bounce" style={{ animationDuration: '4s' }} />
      </div>
    </div>
  );
}
