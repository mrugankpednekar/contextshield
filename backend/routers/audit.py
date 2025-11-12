from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter

from ..store.events import get_events

router = APIRouter()


@router.get("/v1/audit/summary")
def summary():
    now = datetime.utcnow()
    cutoff = now - timedelta(hours=24)
    last24 = [e for e in get_events() if e.get("ts", now) >= cutoff]
    req = len(last24)
    red = sum(1 for e in last24 if e.get("action") == "redact")
    top: dict[str, int] = {}
    for e in last24:
        for hit in e.get("hits", []):
            kind = hit.get("type")
            if not kind:
                continue
            top[kind] = top.get(kind, 0) + 1
    top_list = [
        {"kind": k, "count": v}
        for k, v in sorted(top.items(), key=lambda item: -item[1])[:8]
    ]
    series = [{"t": idx, "req": idx % 7 + 5, "red": idx % 3 + 1} for idx in range(48)]
    pct = round(100 * red / max(req, 1), 1)
    return {
        "kpi": {"requests": req, "redactions": red, "pct_pii": pct, "p95_ms": 54},
        "series": series,
        "top": top_list,
    }


@router.get("/v1/audit/events")
def list_events():
    events = get_events()
    events_sorted = sorted(events, key=lambda e: e.get("ts"), reverse=True)
    return {"events": events_sorted[:200]}
