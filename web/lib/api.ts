const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export interface DetectorHit {
  type: string;
  value?: string;
  start?: number;
  end?: number;
}

export interface DemoResponse {
  original: string;
  redacted: string;
  hits: DetectorHit[];
}

export interface AuditSeriesPoint {
  t: number;
  req: number;
  red: number;
}

export interface AuditTopItem {
  kind: string;
  count: number;
}

export interface AuditKpi {
  requests: number;
  redactions: number;
  pct_pii: number;
  p95_ms: number;
}

export interface AuditEvent {
  action: string;
  hits?: DetectorHit[];
  bytes_in?: number;
  bytes_out?: number;
  latency_ms?: number;
  ts?: string;
}

export interface AuditSummaryResponse {
  kpi: AuditKpi;
  series: AuditSeriesPoint[];
  top: AuditTopItem[];
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
}

export const api = {
  demo(text: string, tenant = "demo") {
    return request<DemoResponse>("/demo/submit", {
      method: "POST",
      body: JSON.stringify({ text, tenant }),
    });
  },
  auditSummary() {
    return request<AuditSummaryResponse>("/v1/audit/summary");
  },
  auditEvents() {
    return request<{ events: AuditEvent[] }>("/v1/audit/events");
  },
  policy(tenant = "demo") {
    return request<{ tenant: string; yaml: string }>(`/v1/policy/${tenant}`);
  },
  validatePolicy(tenant: string, yaml: string) {
    return request(`/v1/policy/${tenant}/validate`, {
      method: "POST",
      body: JSON.stringify({ yaml }),
    });
  },
  activatePolicy(tenant: string, yaml: string) {
    return request(`/v1/policy/${tenant}/activate`, {
      method: "POST",
      body: JSON.stringify({ yaml }),
    });
  },
};

export type AuditSummary = Awaited<ReturnType<typeof api.auditSummary>>;
