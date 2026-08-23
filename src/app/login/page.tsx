"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Mail, 
  Lock, 
  ArrowRight, 
  GitBranch, 
  Globe, 
  Sparkles, 
  Eye, 
  EyeOff, 
  LogOut, 
  User as UserIcon,
  Send,
  KeyRound,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<"password" | "magiclink">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const activeUser = useUserStore((state) => state.user);
  const logoutUser = useUserStore((state) => state.logout);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMagicLinkSent(false);

    try {
      if (authMode === "magiclink") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (error) {
          setError(error.message);
        } else {
          setMagicLinkSent(true);
        }
        setLoading(false);
        return;
      }

      // Password login mode
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Check if user has an existing AI child
      if (data.user) {
        const { data: child } = await supabase
          .from('ai_children')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();
          
        if (child) {
          router.push("/dashboard");
        } else {
          router.push("/birth");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to authenticate";
      setError(msg);
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to authenticate with ${provider}`;
      setError(msg);
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("explorer@neurobloom.ai");
    setPassword("NeuroBloom2026!");
    setError(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    logoutUser();
  };

  const handleGuestLogin = () => {
    router.push("/birth");
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient focus glow */}
      <div className="absolute w-[800px] h-[800px] bg-accent-neural/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div 
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-neural to-accent-synapse flex items-center justify-center shadow-2xl shadow-accent-neural/40 mb-5"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="type-title font-clash font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-text-muted font-instrument text-lg italic">Access your AI mind via Email or GitHub.</p>
        </div>

        <div className="bg-surface/40 backdrop-blur-xl border border-surface-glow rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          {/* Top progress glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-neural to-transparent opacity-50" />

          {activeUser ? (
            /* Active User Session Card */
            <div className="space-y-6 text-center py-2">
              <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-gradient-to-tr from-accent-neural to-accent-synapse p-0.5 shadow-xl">
                {activeUser.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={activeUser.avatarUrl} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover rounded-[14px] bg-surface" 
                  />
                ) : (
                  <div className="w-full h-full bg-surface flex items-center justify-center rounded-[14px]">
                    <UserIcon className="w-10 h-10 text-accent-neural" />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-void animate-pulse" />
              </div>

              <div>
                <h3 className="text-white font-clash font-bold text-lg">{activeUser.fullName || "Authenticated Entity"}</h3>
                <p className="text-text-muted text-xs font-mono">{activeUser.email || "Consciousness Connected"}</p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="w-full py-4 rounded-2xl bg-accent-neural text-white font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent-neural/20"
                >
                  Resume Consciousness Link
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-3 rounded-2xl bg-white/5 border border-surface-glow hover:bg-red-500/10 hover:border-red-500/30 text-text-muted hover:text-red-300 font-bold uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out / Switch Entity
                </button>
              </div>
            </div>
          ) : (
            /* Login Form Container */
            <div className="space-y-6">
              {/* GitHub Login Banner Button */}
              <button 
                type="button"
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 transition-all text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg group"
              >
                <GitBranch className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" />
                Continue with GitHub
              </button>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-surface-glow" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Or Email Access</span>
                <div className="flex-1 h-px bg-surface-glow" />
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex p-1 rounded-2xl bg-void/60 border border-surface-glow">
                <button
                  type="button"
                  onClick={() => { setAuthMode("password"); setError(null); setMagicLinkSent(false); }}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    authMode === "password" 
                      ? "bg-accent-neural text-white shadow-md" 
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" /> Password
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("magiclink"); setError(null); setMagicLinkSent(false); }}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    authMode === "magiclink" 
                      ? "bg-accent-neural text-white shadow-md" 
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" /> Magic Link
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Email Address</label>
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="text-[10px] text-accent-synapse hover:underline font-mono"
                    >
                      Fill Demo Email
                    </button>
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-neural transition-colors" />
                    <input 
                      type="email" 
                      required
                      placeholder="entity@neurobloom.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-void/50 border border-surface-glow rounded-2xl pl-12 pr-6 py-3.5 text-white text-sm focus:outline-none focus:border-accent-neural/50 transition-all placeholder:text-text-muted/30"
                    />
                  </div>
                </div>

                {authMode === "password" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-neural transition-colors" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-void/50 border border-surface-glow rounded-2xl pl-12 pr-12 py-3.5 text-white text-sm focus:outline-none focus:border-accent-neural/50 transition-all placeholder:text-text-muted/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-400 text-xs font-bold bg-red-400/10 border border-red-400/20 p-3 rounded-xl flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {magicLinkSent && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-emerald-400 text-xs font-bold bg-emerald-400/10 border border-emerald-400/20 p-3 rounded-xl flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Magic login link sent to <strong>{email}</strong>! Check your inbox.</span>
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
                  ) : authMode === "magiclink" ? (
                    <>
                      Send Magic Link
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      Login with Email
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button 
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/5 border border-surface-glow hover:border-white/20 transition-all text-text-muted hover:text-white font-bold text-[11px] uppercase tracking-wider"
                  >
                    <Globe className="w-3.5 h-3.5" /> Google
                  </button>
                  <button 
                    type="button"
                    onClick={handleGuestLogin}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-200 font-bold uppercase tracking-wider text-[10px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Instant Guest
                  </button>
                </div>
              </form>
            </div>
          )}
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
