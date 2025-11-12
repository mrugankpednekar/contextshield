import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_25px_60px_rgba(2,6,23,0.65)]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";
