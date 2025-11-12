"use client";

import { useEffect, useState } from "react";

interface Props {
  tenant: string;
  initialYaml: string;
  onValidate: (yaml: string) => Promise<void>;
  onActivate: (yaml: string) => Promise<void>;
}

export function PolicyEditor({ tenant, initialYaml, onValidate, onActivate }: Props) {
  const [yaml, setYaml] = useState(initialYaml);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setYaml(initialYaml);
  }, [initialYaml]);

  const run = async (action: "validate" | "activate") => {
    try {
      setLoading(true);
      if (action === "validate") {
        await onValidate(yaml);
        setStatus("Policy is valid ✅");
      } else {
        await onActivate(yaml);
        setStatus("Policy activated 🚀");
      }
    } catch (err) {
      setStatus((err as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.55)]">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">YAML policy</p>
          <p className="text-sm text-white/60">Tenant: {tenant}</p>
        </div>
        <div className="text-xs text-white/40">
          {status ? status : loading ? "Running..." : "Edit → validate → activate"}
        </div>
      </div>
      <textarea
        value={yaml}
        onChange={(e) => {
          setYaml(e.target.value);
          setStatus(null);
        }}
        className="h-96 w-full rounded-2xl border border-white/5 bg-slate-950/60 p-4 font-mono text-sm text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
      />
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => run("validate")}
          disabled={loading}
          className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 transition hover:border-white/40 disabled:cursor-not-allowed"
        >
          Validate
        </button>
        <button
          onClick={() => run("activate")}
          disabled={loading}
          className="rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(16,185,129,0.45)] transition hover:bg-emerald-300 disabled:cursor-not-allowed"
        >
          Activate
        </button>
      </div>
    </div>
  );
}
