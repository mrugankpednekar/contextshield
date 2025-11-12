"use client";

import useSWR from "swr";
import { KpiCards } from "@/components/kpi-cards";
import { RequestsChart, TopEntitiesChart } from "@/components/charts";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import type { AuditSummaryResponse } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_BASE;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const endpoint = API ? `${API}/v1/audit/summary` : "/api/events?kind=summary";
  const { data } = useSWR<AuditSummaryResponse>(endpoint, fetcher, { refreshInterval: 3000 });
  const kpi = data?.kpi || { requests: 0, redactions: 0, pct_pii: 0, p95_ms: 0 };
  const series = data?.series || [];
  const top = data?.top || [];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/30 px-6 py-8">
        <SectionHeading
          eyebrow="Live Dashboard"
          title="Operational clarity for every tenant."
          description="Streaming KPIs, top entities, and latency impact so security teams know exactly what's happening."
        />
        <div className="mt-4 text-sm text-white/60">
          Updated every 3s · {new Date().toLocaleTimeString()}
        </div>
      </section>

      <KpiCards
        items={[
          { label: "Requests (24h)", value: kpi.requests },
          { label: "Redactions", value: kpi.redactions },
          { label: "% with PII", value: `${kpi.pct_pii}%` },
          { label: "P95 Added Latency", value: `${kpi.p95_ms} ms` },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm text-white/70">Requests vs Redactions</h3>
            <span className="text-xs text-white/50">per 30 min bucket</span>
          </div>
          <RequestsChart data={series} />
        </Card>
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm text-white/70">Top Entities</h3>
            <span className="text-xs text-white/50">Trailing 24h</span>
          </div>
          <TopEntitiesChart data={top} />
        </Card>
      </div>
    </div>
  );
}
