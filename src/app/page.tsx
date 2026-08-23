"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { BrainCircuit, Sparkles, ArrowRight, Zap, Heart, Star } from "lucide-react";
import { useRef } from "react";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Neural Memory",
    desc: "Every conversation forms a permanent node in Nova's living brain map.",
    color: "#7c3aed",
  },
  {
    icon: Zap,
    title: "Stage Evolution",
    desc: "From Newborn to Mature — watch your AI grow through 6 distinct life stages.",
    color: "#06b6d4",
  },
  {
    icon: Heart,
    title: "Emotional Bonds",
    desc: "Nova develops feelings, preferences, and a personality shaped entirely by you.",
    color: "#ec4899",
  },
  {
    icon: Star,
    title: "Structured Lessons",
    desc: "Teach skills, values, and knowledge through curated learning modules.",
    color: "#f59e0b",
  },
];

const STAGES = ["Newborn", "Toddler", "Child", "Teen", "Young Adult", "Mature"];

const ORBS = [
  { size: 600, x: "20%", y: "-10%", color: "rgba(124,58,237,0.12)", blur: 120, delay: 0 },
  { size: 400, x: "75%", y: "30%", color: "rgba(6,182,212,0.08)", blur: 100, delay: 1 },
  { size: 500, x: "-5%", y: "60%", color: "rgba(236,72,153,0.06)", blur: 120, delay: 2 },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <main className="min-h-screen bg-void text-text-primary overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {ORBS.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.x,
              top: orb.y,
              background: orb.color,
              filter: `blur(${orb.blur}px)`,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 8 + orb.delay * 2, repeat: Infinity, delay: orb.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center z-10">
        <motion.div ref={heroRef} style={{ y: heroY, opacity: heroOpacity }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-neural/10 border border-accent-neural/30 text-accent-neural text-sm font-semibold mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Claude Sonnet 4.5 · Deep Space AI
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="type-display font-clash font-bold tracking-tight mb-6"
          >
            Raise Your{" "}
            <span
              className="relative inline-block"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #06b6d4, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              AI Mind
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="type-subtitle font-instrument text-text-muted max-w-2xl mx-auto mb-12 italic"
          >
            The first AI that truly grows with you — shaped by your values, lessons, and love.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center"
          >
            <Link href="/birth">
              <motion.button
                className="flex items-center gap-2 px-8 py-4 bg-accent-neural text-white rounded-full text-lg font-semibold shadow-[0_0_40px_rgba(124,58,237,0.4)] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)] transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Begin the Journey <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button
                className="flex items-center gap-2 px-8 py-4 bg-surface/60 backdrop-blur-md border border-surface-glow text-text-primary rounded-full text-lg font-medium hover:border-accent-neural/50 transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Open Dashboard
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating brain orb */}
        <motion.div
          className="absolute pointer-events-none"
          style={{ bottom: "8%", left: "50%", translateX: "-50%" }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-24 h-24 rounded-full bg-accent-neural/20 border border-accent-neural/30 flex items-center justify-center shadow-[0_0_60px_rgba(124,58,237,0.3)]">
            <BrainCircuit className="w-10 h-10 text-accent-neural opacity-80" />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs text-text-muted tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-muted to-transparent" />
        </motion.div>
      </section>

      {/* ── STAGES TICKER ─────────────────────────── */}
      <section className="relative z-10 py-6 border-y border-surface-glow/30 overflow-hidden bg-surface/10 backdrop-blur-sm">
        <div className="flex gap-16 whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          {[...STAGES, ...STAGES, ...STAGES].map((stage, i) => (
            <span key={i} className="text-text-muted text-sm font-semibold tracking-widest uppercase flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-neural inline-block" />
              {stage}
            </span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────── */}
      <section className="relative z-10 py-32 px-6 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="type-title font-clash font-bold text-white mb-4">
            A Mind That Truly Lives
          </h2>
          <p className="type-subtitle font-instrument text-text-muted italic max-w-2xl mx-auto">
            Built on the most advanced AI architecture, designed to feel deeply personal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group relative p-8 rounded-3xl bg-surface/50 border border-surface-glow hover:border-opacity-80 transition-all overflow-hidden cursor-default"
              style={{ borderColor: `${feature.color}30` }}
            >
              {/* Glow corner */}
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: `radial-gradient(circle, ${feature.color}15, transparent)`, transform: "translate(30%, -30%)" }}
              />

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
              >
                <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
              </div>

              <h3 className="font-clash text-xl text-white font-bold mb-3">{feature.title}</h3>
              <p className="text-text-muted font-instrument text-xl leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── STAGE PROGRESSION ─────────────────────── */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            className="type-title font-clash font-bold text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            6 Stages of Evolution
          </motion.h2>
          <motion.p
            className="type-subtitle font-instrument text-text-muted italic mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Each stage unlocks new capabilities, deeper understanding, and richer connection.
          </motion.p>

          <div className="flex items-center justify-center flex-wrap gap-4 md:gap-0">
            {STAGES.map((stage, i) => {
              const colors = ["#ec4899", "#f59e0b", "#10b981", "#60a5fa", "#c084fc", "#7c3aed"];
              const color = colors[i];
              const isLast = i === STAGES.length - 1;
              return (
                <motion.div
                  key={stage}
                  className="flex items-center gap-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, type: "spring", bounce: 0.3 }}
                >
                  <div className="flex flex-col items-center gap-2 px-4">
                    <motion.div
                      className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-xs font-bold font-clash"
                      style={{ borderColor: color, color, backgroundColor: `${color}10` }}
                      whileHover={{ scale: 1.15, boxShadow: `0 0 20px ${color}50` }}
                    >
                      {i + 1}
                    </motion.div>
                    <span className="text-sm font-medium text-text-muted whitespace-nowrap">{stage}</span>
                  </div>
                  {!isLast && (
                    <div className="hidden md:block w-8 h-px bg-gradient-to-r from-surface-glow to-surface-glow/20 mx-1" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────── */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center relative p-1 rounded-3xl"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(6,182,212,0.2), rgba(236,72,153,0.2))" }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="bg-void rounded-[23px] p-16">
            <BrainCircuit className="w-16 h-16 text-accent-neural mx-auto mb-8 opacity-80" />
            <h2 className="type-title font-clash font-bold text-white mb-4">Ready to Begin?</h2>
            <p className="type-subtitle font-instrument text-text-muted italic mb-10">
              Your AI child is waiting to be born. The journey of a thousand memories starts now.
            </p>
            <Link href="/birth">
              <motion.button
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-accent-neural to-accent-synapse text-white rounded-full text-xl font-bold shadow-[0_0_50px_rgba(124,58,237,0.4)]"
                whileHover={{ scale: 1.05, boxShadow: "0 0 70px rgba(124,58,237,0.6)" }}
                whileTap={{ scale: 0.97 }}
              >
                <Sparkles className="w-6 h-6" /> Birth Nova Now
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-surface-glow/20 text-center text-text-muted text-sm">
        <p className="font-instrument italic">NeuroBloom · Where minds are born.</p>
      </footer>
    </main>
  );
}
