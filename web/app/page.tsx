"use client";

import { motion } from "framer-motion";
import { ClipboardCopy, KeyRound, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { PiiDiff } from "@/components/pii-diff";
import { RedactionTable } from "@/components/redaction-table";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { FeatureCard } from "@/components/feature-card";
import { BackgroundGrid } from "@/components/ui/background-grid";
import { Textarea } from "@/components/ui/textarea";
import type { DetectorHit } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const heroStats = [
  { label: "Secrets neutralized", value: "38,420", helper: "24h window" },
  { label: "Avg added latency", value: "54 ms", helper: "P95 overhead" },
  { label: "Block-ready tenants", value: "12", helper: "Policies enforced" },
];

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Policy-first",
    body: "Observe vs enforce per tenant, with YAML validation and versioning.",
  },
  {
    icon: Radar,
    title: "Layered detection",
    body: "Regex presets, entropy spikes, and optional NER keep secrets from leaking.",
  },
  {
    icon: KeyRound,
    title: "Outcome controls",
    body: "Mask, tokenize, drop, or hash every entity—including model outputs.",
  },
];

const MODEL_OPTIONS = [
  { label: "Mixtral 8x7B (default)", value: "mixtral-8x7b-32768" },
  { label: "Llama3 70B", value: "llama3-70b-8192" },
  { label: "Llama3 8B", value: "llama3-8b-8192" },
];

export default function Playground() {
  const [text, setText] = useState(
    "My email is jane.doe@acme.com and my ssn is 123-45-6789. AWS key AKIA1234567890ABCD12"
  );
  const [redacted, setRedacted] = useState(text);
  const [hits, setHits] = useState<DetectorHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState(MODEL_OPTIONS[0].value);
  const [apiKey, setApiKey] = useState("");
  const [llmOutput, setLlmOutput] = useState("");
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);

  const run = async () => {
    const endpoint = API_BASE ? `${API_BASE}/demo/submit` : "/api/demo";
    setLoading(true);
    setError(null);
    setHits([]);
    setRedacted(text);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as Partial<{ redacted: string; hits: DetectorHit[]; detail: string }>;
      if (!res.ok) throw new Error(data.detail || "Failed to redact");
      setRedacted(data.redacted || "");
      setHits(data.hits || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyRedacted = () => {
    if (navigator?.clipboard && redacted) {
      navigator.clipboard.writeText(redacted);
    }
  };

  const scrollToDiff = () => {
    document.getElementById("playground-diff")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const runWithModel = async () => {
    const endpoint = API_BASE ? `${API_BASE}/demo/complete` : "/api/demo";
    setLlmLoading(true);
    setLlmError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model, api_key: apiKey || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to call model");
      setRedacted(data.redacted || "");
      setHits(data.hits || []);
      setLlmOutput(data.completion || "");
    } catch (err) {
      setLlmError((err as Error).message);
    } finally {
      setLlmLoading(false);
    }
  };

  return (
    <div className="space-y-20">
      <BackgroundGrid className="p-6 sm:p-10 shadow-[0_40px_140px_rgba(5,10,25,0.7)]">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <p className="text-xs uppercase tracking-[0.6em] text-emerald-300/80">ContextShield</p>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">A calmer way to ship LLM features</h1>
          <p className="text-base text-white/70 md:text-lg">
            Drop-in proxy that redacts secrets, enforces policy, and gives you clarity on what every tenant sends. Scroll to
            try the playground, explore detections, and see how policies react.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={scrollToDiff} className="gap-2 bg-white px-5 py-2 text-sm font-semibold text-black">
              Open playground
            </Button>
            <Button variant="secondary" onClick={copyRedacted} className="gap-2 border border-white/20 px-5 py-2 text-sm">
              <ClipboardCopy className="h-3.5 w-3.5" /> Copy endpoint
            </Button>
          </div>
          <div className="flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-5 text-left text-sm text-white/70 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-[0.3em] text-white/60">Groq model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/50 p-3 text-white"
              >
                {MODEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs uppercase tracking-[0.3em] text-white/60">Groq API key (optional)</label>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/50 p-3 text-white placeholder:text-white/40"
              />
              <p className="mt-1 text-xs text-white/50">Use your own key or leave blank to fall back to the server key.</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-5xl gap-4 sm:grid-cols-3">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="flex h-full min-h-[160px] flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-b from-white/10/30 to-transparent p-5 text-left shadow-[0_12px_50px_rgba(2,6,23,0.5)]"
            >
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/60">{stat.label}</p>
              <p className="text-4xl font-semibold text-white">{stat.value}</p>
              <p className="text-xs text-white/60">{stat.helper}</p>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12 grid gap-6 lg:grid-cols-2"
        >
          <div className="rounded-3xl border border-white/15 bg-black/40 p-6 text-left">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-300" />
              <p className="text-sm font-semibold text-white">Why ContextShield?</p>
            </div>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p>Drop it in front of any provider and let it scrub sensitive bits before the model ever sees them.</p>
              <p>Observe traffic, flip to enforce per tenant, and push clean logs to dashboards or alerts.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-black/30 p-6 text-left">
            <p className="text-sm font-semibold text-white">Under the hood</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>• Regex presets + entropy detectors (with optional NER).</li>
              <li>• YAML policies define redaction, block rules, and storage.</li>
              <li>• Structured audit events for dashboards and alerting.</li>
            </ul>
          </div>
        </motion.div>
      </BackgroundGrid>

      <section id="playground-diff" className="space-y-6 scroll-mt-24">
        <SectionHeading
          eyebrow="Diff + detections"
          title="What the LLM sees vs what users send."
          description="Real-time diffing plus structured detector hits so you can debug policy behavior instantly."
        />
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 shadow-[0_35px_80px_rgba(4,7,18,0.55)]">
          <div className="flex flex-wrap gap-3">
            <Button onClick={run} disabled={loading} className="gap-2 bg-emerald-400 px-5 py-2 text-sm font-semibold text-black">
              {loading ? "Redacting…" : "Redact only"}
            </Button>
            <Button
              onClick={runWithModel}
              disabled={llmLoading}
              className="gap-2 bg-white/90 px-5 py-2 text-sm font-semibold text-black"
            >
              {llmLoading ? "Calling model…" : "Redact + call model"}
            </Button>
          </div>
          {(error || llmError) && (
            <p className="mt-2 text-sm text-red-400">{error || llmError}</p>
          )}
          <div className="mt-6">
            <PiiDiff original={text} redacted={redacted} onOriginalChange={setText} />
          </div>
          <div className="mt-6">
            <RedactionTable hits={hits} />
          </div>
          {llmOutput && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-4">
              <div className="mb-3 flex items-center justify-between text-sm text-white/70">
                <span>LLM response ({model})</span>
              </div>
              <Textarea readOnly value={llmOutput} className="min-h-[140px] bg-black/40" />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Control plane"
          title="Glassmorphism blocks for security teams."
          description="Soft gradients, glass panels, and confident typography across every surface."
          align="center"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {featureCards.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>
      </section>
    </div>
  );
}
