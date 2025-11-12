import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-emerald-400 text-slate-900 shadow-[0_12px_30px_rgba(16,185,129,0.35)] hover:bg-emerald-300",
        secondary: "border border-white/15 bg-transparent text-white hover:border-white/40",
        ghost: "text-white/70 hover:text-white",
      },
      size: {
        default: "px-5 py-2",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-7 py-3 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";
