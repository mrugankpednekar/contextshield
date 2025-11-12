import type { DetectorHit } from "@/lib/api";

export function RedactionTable({ hits }: { hits: DetectorHit[] }) {
  if (!hits?.length) return null;
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Detections</p>
          <p className="text-sm text-white/60">Everything we scrubbed before forwarding upstream.</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
          {hits.length} hits
        </span>
      </div>
      <div className="mt-4 grid gap-3">
          {hits.map((hit, idx) => (
            <div
              key={`${hit.type}-${idx}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                  {hit.type}
                </p>
                <p className="text-sm text-white/70">
                  {hit.value?.slice(0, 80) || "value not captured (dropped)"}
                </p>
              </div>
              <div className="text-xs text-white/50">
                span {hit.start ?? "?"} - {hit.end ?? "?"}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
