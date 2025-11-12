"use client";

import { motion } from "framer-motion";
import { ClipboardCopy, KeyRound, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { PiiDiff } from "@/components/pii-diff";
import { RedactionTable } from "@/components/redaction-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { FeatureCard } from "@/components/feature-card";
import type { DetectorHit } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const heroStats = [
  { label: "Secrets neutralized", value: "38,420", helper: "last 24h" },
  { label: "Avg added latency", value: "54 ms", helper: "p95" },
  { label: "Block-ready tenants", value: "12", helper: "enforce mode" },
];

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Policy-first",
    body: "Observe vs enforce per tenant, with YAML auto-validation and versioning.",
  },
  {
    icon: Radar,
    title: "Layered detection",
    body: "Regex presets, entropy spikes, and optional Presidio entities detect anything sensitive.",
  },
  {
    icon: KeyRound,
    title: "Outcome controls",
    body: "Mask, tokenize, hash, or drop for each data class, plus optional response scrubbing.",
  },
];

export default function Playground() {
  const [text, setText] = useState(
    "My email is jane.doe@acme.com and my ssn is 123-45-6789. AWS key AKIA1234567890ABCD12"
  );
  const [redacted, setRedacted] = useState(text);
  const [hits, setHits] = useState<DetectorHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-14">
      <section className="grid gap-10 rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-950/30 to-emerald-900/20 p-10 shadow-[0_40px_140px_rgba(5,10,25,0.7)] lg:grid-cols-2">
        <div className="space-y-8">
          <SectionHeading
            eyebrow="ContextShield"
            title="Redact prompts, secrets, and IDs before any LLM sees them."
            description="A Vercel v0-inspired command center for scrubbed prompts, enforcement-ready policies, and observability in one place."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-white/50">{stat.helper}</p>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-white/70">
            {"Regex presets|Entropy spikes|AWS/JWT drop|Response scrubbing".split("|").map((chip) => (
              <Badge key={chip} className="border-white/15 text-white/70">
                {chip}
              </Badge>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          <Card className="border-white/20 bg-black/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Live Playground</p>
                <p className="text-xs text-white/60">Masks emails, SSNs, PANs, JWTs, AWS keys.</p>
              </div>
              <Sparkles className="h-5 w-5 text-emerald-300" />
            </div>
            <p className="mt-6 text-sm text-white/70">Paste something sensitive and watch ContextShield clean it up.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={run} disabled={loading} className="gap-2">
                {loading ? "Redacting…" : "Redact it"}
              </Button>
              <Button
                onClick={copyRedacted}
                variant="secondary"
                size="sm"
                className="gap-2 text-xs uppercase tracking-[0.2em]"
              >
                <ClipboardCopy className="h-3.5 w-3.5" /> Copy JSON
              </Button>
            </div>
            {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
          </Card>
          <Card className="border-white/10 bg-black/30 p-6">
            <PiiDiff original={text} redacted={redacted} onOriginalChange={setText} />
          </Card>
        </motion.div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Diff + detections"
          title="What the LLM sees vs what your users send."
          description="Real-time context diffing plus structured detector hits so you can debug policy behavior instantly."
        />
        <Card className="border-white/10 bg-black/35 p-6">
          <RedactionTable hits={hits} />
        </Card>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Control plane"
          title="Vercel v0-inspired components for security teams."
          description="Every surface uses the same glassmorphism and motion language so it feels cohesive across playground, dashboards, and policies."
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
