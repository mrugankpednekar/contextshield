import type { Metadata } from "next";
import "../styles/globals.css";
import { ReactNode } from "react";
import { Nav } from "@/components/nav";
import { AuroraBackground } from "@/components/aurora";

export const metadata: Metadata = {
  title: "ContextShield",
  description: "Redact PII before prompts ever reach your LLMs",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <div className="relative min-h-screen overflow-hidden bg-slate-950">
          <AuroraBackground />
          <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8 lg:py-10">
            <aside className="hidden w-60 flex-shrink-0 rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur xl:block">
              <div className="text-lg font-semibold tracking-tight">ContextShield 🔐</div>
              <p className="mt-1 text-sm text-white/60">LLM prompt hygiene, enforced.</p>
              <div className="mt-8">
                <Nav orientation="vertical" />
              </div>
            </aside>
            <div className="flex-1 pb-10">
              <div className="mb-4 block xl:hidden">
                <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold">ContextShield 🔐</div>
                      <p className="text-xs text-white/60">LLM prompt hygiene, enforced.</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Nav orientation="horizontal" />
                  </div>
                </div>
              </div>
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
