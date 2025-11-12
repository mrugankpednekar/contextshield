import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
}

export function FeatureCard({ icon: Icon, title, body }: FeatureCardProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-200">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/70">{body}</p>
    </Card>
  );
}
