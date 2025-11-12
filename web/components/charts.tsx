"use client";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  YAxis,
} from "recharts";
import type { AuditSeriesPoint, AuditTopItem } from "@/lib/api";

export function RequestsChart({ data }: { data: AuditSeriesPoint[] }) {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="t" hide />
          <YAxis hide />
          <Tooltip contentStyle={{ background: "#0b1016", border: "1px solid #1f2937" }} />
          <Line type="monotone" dataKey="req" stroke="#7dd3fc" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="red" stroke="#34d399" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopEntitiesChart({ data }: { data: AuditTopItem[] }) {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="kind" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: "#0b1016", border: "1px solid #1f2937" }} />
          <Bar dataKey="count" fill="#34d399" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
