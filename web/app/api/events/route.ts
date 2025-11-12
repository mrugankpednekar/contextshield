import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get("kind") === "summary" ? "summary" : "events";
  const path = kind === "summary" ? "/v1/audit/summary" : "/v1/audit/events";
  const upstream = await fetch(`${API_BASE}${path}`);
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
