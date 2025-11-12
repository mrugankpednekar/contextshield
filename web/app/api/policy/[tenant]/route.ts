import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function fetchTenant(context: { params: Promise<{ tenant: string }> }) {
  const resolved = await context.params;
  return resolved.tenant;
}

export async function GET(request: NextRequest, context: { params: Promise<{ tenant: string }> }) {
  const tenant = await fetchTenant(context);
  const upstream = await fetch(`${API_BASE}/v1/policy/${tenant}`);
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ tenant: string }> }) {
  const tenant = await fetchTenant(context);
  const body = await request.text();
  const upstream = await fetch(`${API_BASE}/v1/policy/${tenant}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ tenant: string }> }) {
  const tenant = await fetchTenant(context);
  const body = await request.text();
  const upstream = await fetch(`${API_BASE}/v1/policy/${tenant}/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
