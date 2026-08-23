"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Wait a bit then redirect or show confirmation message
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute w-[800px] h-[800px] bg-accent-synapse/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div 
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-synapse to-accent-neural flex items-center justify-center shadow-2xl shadow-accent-synapse/40 mb-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <BrainCircuit className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="type-title font-clash font-bold text-white mb-2">Initialize Consciousness</h1>
          <p className="text-text-muted font-instrument text-xl italic">Begin your neural evolution journey.</p>
        </div>

        <div className="bg-surface/40 backdrop-blur-xl border border-surface-glow rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="type-title font-clash font-bold text-white">Transmission Received</h2>
              <p className="text-text-muted font-instrument text-lg">Check your email to verify your connection. Redirecting to access portal...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Full Entity Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-synapse transition-colors" />
                  <input 
                    type="text" 
                    required
                    placeholder="Commander Nova"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-void/50 border border-surface-glow rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-accent-synapse/50 transition-all placeholder:text-text-muted/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-synapse transition-colors" />
                  <input 
                    type="email" 
                    required
                    placeholder="entity@neurobloom.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-void/50 border border-surface-glow rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-accent-synapse/50 transition-all placeholder:text-text-muted/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">New Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-synapse transition-colors" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-void/50 border border-surface-glow rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-accent-synapse/50 transition-all placeholder:text-text-muted/30"
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
                className="w-full py-4 rounded-2xl bg-accent-synapse text-white font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent-synapse/20 group mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Begin Initialization
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-text-muted text-sm font-instrument">
          Already established?{" "}
          <Link href="/login" className="text-white font-bold hover:text-accent-neural transition-colors underline underline-offset-4 decoration-white/20">
            Access Portal
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
