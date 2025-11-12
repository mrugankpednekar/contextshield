"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import type { AuditEvent } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_BASE;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EventsPage() {
  const endpoint = API ? `${API}/v1/audit/events` : "/api/events";
  const { data } = useSWR<{ events: AuditEvent[] }>(endpoint, fetcher, { refreshInterval: 5000 });
  const events = data?.events || [];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/30 px-6 py-8">
        <SectionHeading
          eyebrow="Events"
          title="Live feed of passes, redactions, and policy blocks."
          description="Every proxy call is logged with detector hits, byte deltas, and latency for instant incident response."
        />
      </section>
      <Card className="bg-black/40 p-0">
        <table className="w-full text-sm">
          <thead className="text-white/60">
            <tr>
              <th className="p-4 text-left">Action</th>
              <th className="p-4 text-left">Hits</th>
              <th className="p-4 text-left">Bytes</th>
              <th className="p-4 text-left">Latency</th>
              <th className="p-4 text-left">When</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event: AuditEvent, idx: number) => {
              const badgeClass =
                event.action === "block"
                  ? "bg-red-500/20 text-red-200 border-red-500/40"
                  : event.action === "redact"
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                    : "bg-slate-500/20 text-slate-200 border-slate-500/40";
              return (
                <tr key={idx} className="border-t border-white/5">
                  <td className="p-4">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                      {event.action}
                    </span>
                  </td>
                  <td className="p-4 text-white/70">
                    {event.hits?.map((h) => h.type).join(", ") || "—"}
                  </td>
                  <td className="p-4 text-white/50">
                    {event.bytes_in || 0} → {event.bytes_out || 0}
                  </td>
                  <td className="p-4 text-white/50">{event.latency_ms ? `${event.latency_ms} ms` : "—"}</td>
                  <td className="p-4 text-white/50">
                    {event.ts ? new Date(event.ts).toLocaleTimeString() : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!events.length && (
          <div className="p-6 text-center text-white/40">No events yet — run a demo prompt!</div>
        )}
      </Card>
    </div>
  );
}
