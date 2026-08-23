"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, CheckCircle2, Lock, Play, Wrench } from "lucide-react";
import { useUserStore } from "@/store/userStore";

const BUILD_STAGES = [
  { title: "Tokenizer", description: "Turn language into the tokens a model can process.", unlock: 1, color: "#38bdf8" },
  { title: "Embeddings", description: "Give tokens coordinates in a space of meaning.", unlock: 10, color: "#a78bfa" },
  { title: "Attention", description: "Teach the model which parts of context matter most.", unlock: 30, color: "#f472b6" },
  { title: "Transformer blocks", description: "Stack attention and feed-forward layers into a reasoning engine.", unlock: 60, color: "#fbbf24" },
  { title: "Training loop", description: "Use loss, gradients, and data to improve predictions.", unlock: 100, color: "#34d399" },
  { title: "Your first LLM", description: "Connect every component and generate a response.", unlock: 200, color: "#fb923c" },
];

export default function GaragePage() {
  const router = useRouter();
  const { level, completedLessons, completeLesson, addXp, name } = useUserStore();
  const [requestedLevel] = useState(() => 
    typeof window !== "undefined" ? Number(new URLSearchParams(window.location.search).get("level")) || 0 : 0
  );
  const buildLevel = requestedLevel > 0 ? Math.min(200, requestedLevel) : level;
  const buildId = `curriculum-${buildLevel}`;
  const [practicalComplete, setPracticalComplete] = useState(completedLessons.includes(buildId));
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceTarget, setPracticeTarget] = useState("");
  const [practiceOutput, setPracticeOutput] = useState<string[]>([]);
  const [modelName, setModelName] = useState(`${name} Core`);
  const [modelPrompt, setModelPrompt] = useState("");
  const [modelOutput, setModelOutput] = useState("");
  const practicalTask = buildLevel < 25 ? "Create a tokenizer map with five tokens from a sentence." : buildLevel < 75 ? "Run one training step: compare a prediction with its target and record the loss." : buildLevel < 125 ? "Highlight which words in a prompt should receive the most attention." : buildLevel < 175 ? "Connect an attention block to a feed-forward block in the model pipeline." : "Generate the next token from a short prompt using your model pipeline.";
  const completedParts = Math.min(BUILD_STAGES.length, Math.floor(level / 35) + (completedLessons.length > 0 ? 1 : 0));

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#050711] p-4 pb-24 sm:p-8 sm:pb-8">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300/70">NeuroBloom workshop</p>
          <h1 className="type-title mt-2 font-clash font-bold text-white">AI Garage</h1>
          <p className="type-subtitle mt-2 max-w-2xl text-white/60">Build an LLM from first principles. Every lesson completed adds another working part to {name}&apos;s model.</p>
        </div>
        <Link href="/lessons" className="rounded-xl border border-orange-300/30 bg-orange-300/10 px-4 py-2 text-sm font-bold text-orange-100 hover:bg-orange-300/20">Back to lessons</Link>
      </header>

      <section className="mt-7 grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="relative min-h-[430px] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_50%_48%,rgba(251,146,60,0.16),transparent_27%),linear-gradient(145deg,#10172b,#070913)] p-6">
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-200/20" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-300/30" />
          <motion.div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-orange-200/60 bg-orange-400/20 shadow-[0_0_70px_rgba(251,146,60,0.45)]" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }}>
            <Brain className="h-9 w-9 text-orange-200" />
            <span className="mt-1 text-xs font-bold text-orange-100">{name}&apos;s LLM</span>
          </motion.div>
          {BUILD_STAGES.map((part, index) => {
            const angle = (index / BUILD_STAGES.length) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + Math.cos(angle) * 38;
            const y = 50 + Math.sin(angle) * 38;
            const unlocked = level >= part.unlock;
            return <div key={part.title} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${x}%`, top: `${y}%` }}><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: unlocked ? part.color : "rgba(255,255,255,0.15)", backgroundColor: unlocked ? `${part.color}22` : "rgba(255,255,255,0.04)" }}>{unlocked ? <CheckCircle2 className="h-5 w-5" style={{ color: part.color }} /> : <Lock className="h-4 w-4 text-white/30" />}</div><span className="mt-2 block max-w-28 text-[11px] font-semibold text-white/70">{part.title}</span></div>;
          })}
        </div>

        <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3"><Wrench className="h-5 w-5 text-orange-300" /><h2 className="font-clash text-lg font-bold text-white">Build status</h2></div>
          <p className="mt-5 text-3xl font-clash font-bold text-white">{completedParts} <span className="text-base text-white/40">/ {BUILD_STAGES.length} parts</span></p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-orange-300 to-rose-400" style={{ width: `${(completedParts / BUILD_STAGES.length) * 100}%` }} /></div>
          <p className="mt-5 text-sm leading-relaxed text-white/55">Complete lessons to unlock components. The final stage is your own small language model, assembled piece by piece.</p>
          <Link href="/lessons" className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-orange-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-orange-200"><Play className="h-4 w-4" /> Continue curriculum</Link>
        </aside>
      </section>

      <section className="mt-7 rounded-3xl border border-orange-300/30 bg-orange-300/5 p-6">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200/70">Practical task · Level {buildLevel}</p>
            <h2 className="mt-2 text-2xl font-clash font-bold text-white">Build it, don&apos;t just read it</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">{practicalTask} This hands-on step makes the lesson part of {name}&apos;s working model.</p>
          </div>
          {!practicalComplete && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-200/70">{buildLevel < 25 ? "Tokenizer sandbox" : buildLevel < 75 ? "Training loop sandbox" : buildLevel < 125 ? "Attention sandbox" : buildLevel < 175 ? "Transformer assembly sandbox" : "Generation sandbox"}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <input value={practiceInput} onChange={(event) => setPracticeInput(event.target.value)} placeholder={buildLevel < 75 ? "Enter a prediction or sentence" : "Enter a short prompt"} className="min-w-[260px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-orange-300/60" />
                {buildLevel >= 25 && buildLevel < 75 && <input value={practiceTarget} onChange={(event) => setPracticeTarget(event.target.value)} placeholder="Enter the target" className="min-w-[180px] flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-orange-300/60" />}
                <button type="button" disabled={!practiceInput.trim() || (buildLevel >= 25 && buildLevel < 75 && !practiceTarget.trim())} onClick={() => {
                  if (buildLevel < 25) setPracticeOutput(practiceInput.trim().split(/\s+/));
                  else if (buildLevel < 75) setPracticeOutput([`prediction: ${practiceInput.trim()}`, `target: ${practiceTarget.trim()}`, `loss: ${practiceInput.trim() === practiceTarget.trim() ? "0.00" : "0.42"}`]);
                  else if (buildLevel < 125) setPracticeOutput(practiceInput.trim().split(/\s+/).map((token, index) => `${token}: attention ${(100 - index * 12).toFixed(0)}%`));
                  else if (buildLevel < 175) setPracticeOutput(["embedding layer connected", "attention layer connected", "feed-forward layer connected", "residual path verified"]);
                  else setPracticeOutput([`prompt: ${practiceInput.trim()}`, "next-token probabilities calculated", "response stream ready"]);
                }} className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-40">{buildLevel < 25 ? "Run tokenizer" : buildLevel < 75 ? "Run training step" : buildLevel < 125 ? "Inspect attention" : buildLevel < 175 ? "Assemble block" : "Generate next token"}</button>
              </div>
              {practiceOutput.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{practiceOutput.map((token, index) => <span key={`${token}-${index}`} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 font-mono text-xs text-cyan-100">{token}</span>)}</div>}
            </div>
          )}
          <button
            type="button"
            disabled={practicalComplete || practiceOutput.length === 0}
            onClick={() => {
              completeLesson(buildId, "Computing");
              addXp(buildLevel * 120);
              setPracticalComplete(true);
              window.setTimeout(() => router.push(`/lessons`), 700);
            }}
            className="flex w-fit shrink-0 items-center gap-2 rounded-2xl bg-orange-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:bg-emerald-300 disabled:text-emerald-950"
          >
            {practicalComplete ? <CheckCircle2 className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
            {practicalComplete ? "Level completed" : "Approve & complete level"}
          </button>
        </div>
      </section>

      <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {BUILD_STAGES.map((part) => { const unlocked = level >= part.unlock; return <article key={part.title} className={`rounded-2xl border p-5 ${unlocked ? "border-white/15 bg-white/[0.04]" : "border-white/8 bg-white/[0.02] opacity-60"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest" style={{ color: part.color }}>Stage {BUILD_STAGES.indexOf(part) + 1}</p><h3 className="mt-2 text-lg font-clash font-bold text-white">{part.title}</h3></div>{unlocked ? <CheckCircle2 className="h-5 w-5" style={{ color: part.color }} /> : <Lock className="h-5 w-5 text-white/30" />}</div><p className="mt-3 text-sm leading-relaxed text-white/55">{part.description}</p><p className="mt-4 text-xs font-semibold text-white/35">Unlocks at Level {part.unlock}</p></article>; })}
      </section>

      <section className="mt-7 rounded-3xl border border-rose-300/30 bg-[radial-gradient(circle_at_80%_0%,rgba(244,63,94,0.14),transparent_38%),rgba(255,255,255,0.03)] p-6">
        <div className="flex items-start gap-3"><Brain className="mt-1 h-5 w-5 text-rose-300" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-200/70">Final workshop · Level 200</p><h2 className="mt-2 text-2xl font-clash font-bold text-white">Model Lab</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">After completing the full curriculum, configure your own small language model and run a prompt through its tokenizer, context, and generation pipeline.</p></div></div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr_auto]">
          <input value={modelName} onChange={(event) => setModelName(event.target.value)} disabled={level < 200} placeholder="Model name" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-rose-300/60 disabled:cursor-not-allowed disabled:opacity-50" />
          <input value={modelPrompt} onChange={(event) => setModelPrompt(event.target.value)} disabled={level < 200} placeholder="Ask your model something" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-rose-300/60 disabled:cursor-not-allowed disabled:opacity-50" />
          <button type="button" disabled={level < 200 || !modelPrompt.trim()} onClick={() => setModelOutput(`Generated by ${modelName || "your model"}: I connected the prompt to my learned context and predicted the next useful idea.`)} className="rounded-xl bg-rose-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Run my LLM</button>
        </div>
        {level < 200 && <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/35">Complete all 200 practical levels to unlock your model.</p>}
        {modelOutput && <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-300/5 p-4 text-sm leading-relaxed text-rose-100">{modelOutput}</div>}
      </section>
    </div>
  );
}
