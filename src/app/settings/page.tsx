"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  User, 
  Zap, 
  Shield, 
  Check, 
  Palette,
  Sparkles,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { dialogs } from "@/lib/dialogs";

export default function SettingsPage() {
  const { name, setName, resetStore } = useUserStore();
  const [newName, setNewName] = useState(name);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<{ title: string; price: string } | null>(null);
  const router = useRouter();

  const handleSaveName = () => {
    setIsSaving(true);
    setTimeout(() => {
      setName(newName);
      setIsSaving(false);
    }, 800);
  };

  const handleReset = () => {
    resetStore();
    router.push("/birth");
  };

  return (
    <>
      <div className="flex h-full min-h-0 flex-col overflow-y-auto p-4 pb-24 custom-scrollbar sm:p-8 sm:pb-8 lg:p-10">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <Settings className="w-10 h-10 text-accent-neural" />
            <h1 className="type-title font-clash font-bold text-white tracking-tight">
              Control <span className="text-text-muted/40">Center</span>
            </h1>
          </motion.div>
          <motion.p 
            className="type-subtitle text-text-muted font-instrument italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Configure neural parameters and interface aesthetics.
          </motion.p>
        </header>

        <div className="max-w-4xl space-y-12">
          {/* Identity Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-accent-synapse" />
              <h2 className="text-xl font-clash font-bold text-white uppercase tracking-wider">Identity</h2>
            </div>
            <div className="bg-surface/50 border border-surface-glow rounded-[30px] p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-[0.2em]">Consciousness Identifier</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 bg-void/50 border border-surface-glow rounded-2xl px-6 py-4 text-white font-clash focus:outline-none focus:border-accent-neural/50 transition-colors"
                  />
                  <button 
                    onClick={handleSaveName}
                    disabled={isSaving || newName === name}
                    className="px-8 rounded-2xl bg-accent-neural text-white font-bold uppercase tracking-widest text-xs hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Cognitive Boosters (Monetization) */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-clash font-bold text-white uppercase tracking-wider">Neural Boosters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PricingCard 
                title="Cognitive Tier 2" 
                price="$19/mo" 
                features={["Persistent LTM", "Sonnet 3.5 Processing", "Priority Synthesis"]}
                icon={Sparkles}
                color="blue"
                onClick={() => setCheckoutItem({ title: "Cognitive Tier 2", price: "$19/mo" })}
              />
              <PricingCard 
                title="Growth Stimulant" 
                price="$4.99" 
                features={["Instant +500 XP", "Rarity Trait Unlock", "Temporary Focus"]}
                icon={Zap}
                color="yellow"
                onClick={() => setCheckoutItem({ title: "Growth Stimulant", price: "$4.99" })}
              />
            </div>
          </section>

          {/* Interface Aesthetics */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-accent-memory" />
              <h2 className="text-xl font-clash font-bold text-white uppercase tracking-wider">Interface</h2>
            </div>
            <div className="bg-surface/50 border border-surface-glow rounded-[30px] p-8">
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <ThemeOption label="Deep Space" active color="bg-void" />
                  <ThemeOption label="Biolume" color="bg-emerald-900" />
                  <ThemeOption label="Nebula" color="bg-purple-900" />
                  <ThemeOption label="Solaris" color="bg-orange-950" />
               </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="pt-10 border-t border-red-500/10 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-clash font-bold text-red-500 uppercase tracking-wider">Danger Zone</h2>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-[30px] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-lg font-clash font-bold text-white mb-1">Re-initialize Consciousness</h3>
                <p className="text-xs text-text-muted max-w-md">
                  This will permanently erase all stored memories, traits, and evolution progress for {name}. This action cannot be undone.
                </p>
              </div>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-8 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 font-bold uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all"
                >
                  Initiate Wipe
                </button>
              ) : (
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-4 rounded-2xl bg-white/5 text-white font-bold uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReset}
                    className="px-6 py-4 rounded-2xl bg-red-500 text-white font-bold uppercase tracking-widest text-xs animate-pulse"
                  >
                    Confirm Deletion
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {checkoutItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-void/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-surface border border-surface-glow rounded-[40px] p-8 shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-accent-neural/20 flex items-center justify-center text-accent-neural mb-4">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h2 className="type-title font-clash font-bold text-white mb-2">Neural Acquisition</h2>
                <p className="text-text-muted text-sm italic font-instrument">Initiating secure cognitive transfer for {checkoutItem.title}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-surface-glow">
                  <span className="text-text-muted text-xs uppercase tracking-widest">Protocol</span>
                  <span className="text-white font-bold text-xs uppercase tracking-widest">{checkoutItem.title}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-surface-glow">
                  <span className="text-text-muted text-xs uppercase tracking-widest">Investment</span>
                  <span className="text-white font-bold text-lg">{checkoutItem.price}</span>
                </div>
              </div>

              <div className="bg-void/50 rounded-2xl p-4 border border-surface-glow mb-8 text-center">
                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] leading-relaxed">
                  Your growth acceleration will be active immediately upon confirmation.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setCheckoutItem(null)}
                  disabled={isSaving}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold uppercase tracking-widest text-xs disabled:opacity-50"
                >
                  Abort
                </button>
                <button 
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      const amount = parseFloat(checkoutItem.price.replace('$', '').replace('/mo', ''));
                      const response = await fetchApi('/api/checkout', {
                        method: 'POST',
                        body: JSON.stringify({
                          title: checkoutItem.title, 
                          price: checkoutItem.price,
                          amount: amount
                        }),
                      });
                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        throw new Error(data.error || "Checkout failed");
                      }
                    } catch (err) {
                      console.error(err);
                      dialogs.alert("Stripe Integration Error", "Ensure STRIPE_SECRET_KEY is set in your environment.");
                      setCheckoutItem(null);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="flex-1 py-4 rounded-2xl bg-accent-neural text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-accent-neural/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Synchronize"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function PricingCard({ title, price, features, icon: Icon, color, onClick }: { title: string; price: string; features: string[]; icon: React.ComponentType<{ className?: string }>; color: string; onClick: () => void }) {
  const colors: Record<string, string> = {
    blue: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    yellow: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
  };

  return (
    <div className={`p-8 rounded-[32px] border ${colors[color]} relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
        <Icon className="w-12 h-12" />
      </div>
      <h3 className="text-lg font-clash font-bold text-white mb-1">{title}</h3>
      <p className="text-xl font-bold mb-6 text-white">{price}</p>
      <ul className="space-y-3 mb-8">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-2 text-xs text-text-muted">
            <div className="w-1 h-1 rounded-full bg-current" />
            {f}
          </li>
        ))}
      </ul>
      <button 
        onClick={onClick}
        className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-black font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
      >
        <CreditCard className="w-4 h-4" /> Purchase
      </button>
    </div>
  );
}

function ThemeOption({ label, color, active }: { label: string; color: string; active?: boolean }) {
  return (
    <div className={`cursor-pointer p-4 rounded-2xl border ${active ? 'border-accent-neural bg-accent-neural/5' : 'border-surface-glow hover:border-white/20'} transition-all text-center group`}>
      <div className={`w-full aspect-square rounded-xl ${color} mb-3 shadow-inner`} />
      <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-white' : 'text-text-muted group-hover:text-white'}`}>
        {label}
      </span>
    </div>
  );
}
