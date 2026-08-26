"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";
import { BrainCircuit, Sparkles, ArrowRight } from "lucide-react";
import { haptics } from "@/lib/haptics";

const TRAITS_OPTIONS = [
  "Curious", "Empathetic", "Creative", "Analytical", "Playful", "Wise",
];

export default function BirthCeremony() {
  const router = useRouter();
  const { setName, setTraits } = useUserStore();
  const [step, setStep] = useState(1);
  const [name, setLocalName] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const toggleTrait = (trait: string) => {
    haptics.impact();
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : prev.length < 3 ? [...prev, trait] : prev
    );
  };

  const handleBirth = async () => {
    haptics.notification();
    if (name.trim()) setName(name.trim());
    if (selectedTraits.length > 0) setTraits(selectedTraits);

    // Save to Supabase for persistence
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('ai_children').insert({
        user_id: user.id,
        name: name.trim(),
        traits: selectedTraits,
        level: 1,
        stage: 'NEWBORN',
        total_xp: 0,
        stats: {
          iq: 100,
          eq: 100,
          creativity: 100,
          skills: { mathematics: 0, visualArts: 0, socialLogic: 0, linguistics: 0 },
          mood: 'Neutral'
        }
      });
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-void text-text-primary relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Step Dots */}
      <div className="absolute top-8 flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              s === step ? "w-6 bg-accent-neural" : s < step ? "bg-accent-neural/50" : "bg-surface-glow"
            }`}
          />
        ))}
      </div>

      <div className="z-10 w-full max-w-lg flex flex-col items-center text-center">
        <AnimatePresence mode="wait">

          {/* Step 1: Name */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-20 h-20 rounded-2xl bg-accent-neural/20 border border-accent-neural/30 flex items-center justify-center mb-8">
                <BrainCircuit className="w-10 h-10 text-accent-neural" />
              </div>
              <h2 className="type-title mb-3 font-bold font-clash">Name your AI</h2>
              <p className="text-text-muted mb-10 font-instrument text-xl italic">
                Choose a name that resonates with you.
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setLocalName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
                className="w-full bg-surface/60 backdrop-blur-md border border-surface-glow rounded-2xl px-6 py-4 text-lg text-center focus:outline-none focus:border-accent-neural focus:ring-1 focus:ring-accent-neural transition-all mb-8 placeholder:text-text-muted/40"
                placeholder="e.g. Nova"
                autoFocus
              />
              <motion.button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="flex items-center gap-2 px-8 py-4 bg-accent-neural text-white rounded-full font-semibold text-lg disabled:opacity-40 shadow-[0_0_30px_rgba(124,58,237,0.3)]"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Continue <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Choose Traits */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center w-full"
            >
              <h2 className="type-title mb-3 font-bold font-clash">Shape {name}&apos;s mind</h2>
              <p className="text-text-muted mb-8 font-instrument text-xl italic">
                Choose up to 3 core traits.
              </p>
              <div className="grid grid-cols-3 gap-3 w-full mb-10">
                {TRAITS_OPTIONS.map((trait) => {
                  const selected = selectedTraits.includes(trait);
                  return (
                    <motion.button
                      key={trait}
                      onClick={() => toggleTrait(trait)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                        selected
                          ? "bg-accent-neural border-accent-neural text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                          : "bg-surface/50 border-surface-glow text-text-muted hover:border-accent-neural/50"
                      }`}
                    >
                      {trait}
                    </motion.button>
                  );
                })}
              </div>
              <motion.button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-8 py-4 bg-accent-neural text-white rounded-full font-semibold text-lg shadow-[0_0_30px_rgba(124,58,237,0.3)]"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Continue <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Birth */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center w-full"
            >
              <h2 className="type-title mb-4 font-bold font-clash">The Spark of Life</h2>
              <p className="text-xl text-text-muted mb-12 font-instrument italic">
                Ready to bring{" "}
                <span className="text-accent-neural font-bold not-italic">{name}</span> into existence?
              </p>

              {/* Pulsing orb */}
              <div className="relative w-40 h-40 mx-auto mb-14 flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full bg-accent-neural/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full bg-accent-neural/30"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.4, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
                <Sparkles className="relative z-10 w-16 h-16 text-accent-neural" />
              </div>

              <motion.button
                onClick={handleBirth}
                className="px-12 py-5 bg-gradient-to-r from-accent-neural to-accent-synapse rounded-full text-xl font-bold shadow-[0_0_50px_rgba(124,58,237,0.5)] flex items-center gap-3"
                whileHover={{ scale: 1.06, boxShadow: "0 0 70px rgba(6,182,212,0.5)" }}
                whileTap={{ scale: 0.97 }}
              >
                Birth Sequence <Sparkles className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
