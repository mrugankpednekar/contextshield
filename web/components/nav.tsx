"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Activity, Gauge, Layers3, ShieldCheck } from "lucide-react";

const links = [
  { href: "/", label: "Playground", icon: Layers3 },
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/events", label: "Events", icon: Activity },
  { href: "/policies", label: "Policies", icon: ShieldCheck },
];

type NavProps = {
  orientation?: "vertical" | "horizontal";
};

export function Nav({ orientation = "vertical" }: NavProps) {
  const pathname = usePathname();
  const wrapperClass =
    orientation === "vertical"
      ? "space-y-2"
      : "flex flex-wrap items-center gap-2 text-sm font-medium";

  return (
    <nav className={wrapperClass}>
      {links.map((link) => {
        const active = pathname === link.href;
        const Icon = link.icon;
        const base =
          orientation === "vertical"
            ? "block w-full rounded-xl border px-3 py-2 text-sm transition-colors"
            : "rounded-full border px-4 py-2 transition-colors";
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(base, {
              "border-emerald-300/60 bg-emerald-400/10 text-white shadow-[0_0_25px_rgba(16,185,129,0.25)]":
                active,
              "border-white/10 text-white/70 hover:text-white": !active,
            })}
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4" aria-hidden />
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
