import { Textarea } from "@/components/ui/textarea";

interface DiffProps {
  original: string;
  redacted: string;
  onOriginalChange?: (value: string) => void;
}

export function PiiDiff({ original, redacted, onOriginalChange }: DiffProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {[
        {
          label: "Original prompt",
          description: "Never leaves your infra unredacted.",
          value: original,
          editable: Boolean(onOriginalChange),
          action: onOriginalChange,
          accent: "border-white/10 bg-slate-950/70",
        },
        {
          label: "Redacted payload",
          description: "What the upstream LLM actually sees.",
          value: redacted,
          editable: false,
          action: undefined,
          accent: "border-emerald-400/30 bg-emerald-400/5",
        },
      ].map((panel) => (
        <div
          key={panel.label}
          className={`rounded-3xl border ${panel.accent} p-5 shadow-[0_25px_60px_rgba(15,23,42,0.45)]`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">{panel.label}</p>
              <p className="text-sm text-white/60">{panel.description}</p>
            </div>
            {panel.editable && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">Editable</span>
            )}
          </div>
          <Textarea
            value={panel.value}
            onChange={(e) => panel.action?.(e.target.value)}
            readOnly={!panel.editable}
            className="mt-4 h-60 w-full"
          />
        </div>
      ))}
    </div>
  );
}
