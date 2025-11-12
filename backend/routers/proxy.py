from __future__ import annotations

import json
import time
from typing import Any

import httpx
from fastapi import APIRouter, Header, HTTPException, Request
from starlette.responses import JSONResponse, StreamingResponse

from ..config import get_settings
from ..pii.detectors import entropy_candidates, regex_scan
from ..pii.policy import load_policy_for_tenant
from ..pii.redactor import apply_redactions
from ..store.events import add_event

router = APIRouter()

settings = get_settings()
OPENAI_BASE = "https://api.openai.com/v1"


def _scan_payload(raw: str, policy: dict[str, Any]):
    hits = regex_scan(raw, policy["detection"].get("presets", []))
    entropy_cfg = policy["detection"].get("entropy", {})
    if entropy_cfg.get("enabled"):
        hits += entropy_candidates(
            raw,
            entropy_cfg.get("min_len", 20),
            entropy_cfg.get("threshold", 4.0),
        )
    return hits


@router.post("/v1/chat/completions")
async def chat_completions(
    req: Request,
    x_cs_tenant: str = Header(default="demo"),
    authorization: str | None = Header(default=None),
):
    tenant = x_cs_tenant or "demo"
    policy = load_policy_for_tenant(tenant)
    payload = await req.json()
    raw = json.dumps(payload)
    max_scan = settings.max_scan_bytes
    scan_slice = raw[:max_scan]
    hits = _scan_payload(scan_slice, policy)
    block_kinds = set(policy["responses"].get("block_if_detected", []))
    should_block = policy.get("mode", "observe") == "enforce" and any(
        h["type"] in block_kinds for h in hits
    )

    if should_block:
        add_event(
            {
                "tenant": tenant,
                "direction": "request",
                "action": "block",
                "hits": hits,
                "bytes_in": len(raw.encode()),
                "bytes_out": 0,
            }
        )
        raise HTTPException(status_code=422, detail={"error": "blocked_by_policy", "hits": hits})

    redacted_text = apply_redactions(scan_slice, hits, policy.get("redaction", {}))
    if len(raw) > len(scan_slice):
        redacted_text += raw[len(scan_slice) :]
    redacted_payload = json.loads(redacted_text)

    is_stream = bool(redacted_payload.get("stream"))
    auth_header = authorization or f"Bearer {settings.openai_api_key}" if settings.openai_api_key else None
    if not auth_header:
        raise HTTPException(status_code=400, detail="Missing Authorization header or OPENAI_API_KEY")

    url = f"{OPENAI_BASE}/chat/completions"
    headers = {"Authorization": auth_header}
    t0 = time.time()

    async with httpx.AsyncClient(timeout=60.0) as client:
        if is_stream:
            stream = client.stream("POST", url, json=redacted_payload, headers=headers)

            async def iter_stream():
                async with stream as upstream:
                    if upstream.status_code >= 400:
                        text = await upstream.aread()
                        raise HTTPException(status_code=upstream.status_code, detail=text.decode())
                    async for chunk in upstream.aiter_raw():
                        yield chunk

            response = StreamingResponse(iter_stream(), media_type="text/event-stream")
        else:
            upstream = await client.post(url, json=redacted_payload, headers=headers)
            if upstream.status_code >= 400:
                raise HTTPException(status_code=upstream.status_code, detail=upstream.text)
            data = upstream.json()
            if policy["responses"].get("redact_model_output"):
                blob = json.dumps(data)
                resp_hits = _scan_payload(blob, policy)
                if resp_hits:
                    blob = apply_redactions(blob, resp_hits, policy.get("redaction", {}))
                    data = json.loads(blob)
            response = JSONResponse(content=data, status_code=upstream.status_code)

    latency = int((time.time() - t0) * 1000)
    add_event(
        {
            "tenant": tenant,
            "direction": "request",
            "action": "redact" if hits else "pass",
            "hits": hits,
            "bytes_in": len(raw.encode()),
            "bytes_out": 0,
            "latency_ms": latency,
        }
    )
    return response
