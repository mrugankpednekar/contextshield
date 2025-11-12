import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
}

export function FeatureCard({ icon: Icon, title, body }: FeatureCardProps) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-5 shadow-[0_25px_60px_rgba(2,6,23,0.65)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="mt-4 text-lg font-semibold text-white">{title}</h4>
      <p className="text-sm text-white/70">{body}</p>
    </div>
  );
}
