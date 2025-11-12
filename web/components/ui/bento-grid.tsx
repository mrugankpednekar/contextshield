import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={cn("grid w-full auto-rows-[18rem] gap-6 md:auto-rows-[22rem] md:grid-cols-2", className)}>
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function BentoGridItem({ title, description, icon, className, children }: BentoGridItemProps) {
  return (
    <div
      className={cn(
        "group relative flex h-full min-h-[14rem] w-full flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 text-white",
        className
      )}
    >
      <div>
        <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
          {icon}
          <span>{title}</span>
        </div>
        <p className="text-sm text-white/70">{description}</p>
      </div>
      <div className="mt-6 w-full text-sm text-white/80">{children}</div>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition group-hover:opacity-100"
        style={{ background: "radial-gradient(circle at top, rgba(16,185,129,0.35), transparent 55%)" }}
      />
    </div>
  );
}
