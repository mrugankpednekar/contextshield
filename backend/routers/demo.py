from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..config import get_settings
from ..pii.detectors import entropy_candidates, regex_scan
from ..pii.policy import load_policy_for_tenant
from ..pii.redactor import apply_redactions
from ..store.events import add_event

router = APIRouter()
settings = get_settings()


class DemoIn(BaseModel):
    text: str = Field(..., max_length=10_000)
    tenant: str = "demo"


class DemoCompleteIn(DemoIn):
    model: str = "mixtral-8x7b-32768"
    api_key: str | None = None


@router.post("/demo/submit")
def demo_submit(payload: DemoIn):
    policy = load_policy_for_tenant(payload.tenant)
    hits = regex_scan(payload.text, policy["detection"]["presets"])
    entropy_cfg = policy["detection"].get("entropy", {})
    if entropy_cfg.get("enabled"):
        hits += entropy_candidates(
            payload.text,
            entropy_cfg.get("min_len", 20),
            entropy_cfg.get("threshold", 4.0),
        )
    redacted = apply_redactions(payload.text, hits, policy.get("redaction", {}))
    add_event(
        {
            "tenant": payload.tenant,
            "direction": "request",
            "action": "redact" if hits else "pass",
            "hits": hits,
            "bytes_in": len(payload.text.encode()),
            "bytes_out": len(redacted.encode()),
            "raw": payload.text if policy["logging"].get("store_raw") else None,
        }
    )
    return {"original": payload.text, "redacted": redacted, "hits": hits}


@router.post("/demo/complete")
async def demo_complete(payload: DemoCompleteIn):
    policy = load_policy_for_tenant(payload.tenant)
    hits = regex_scan(payload.text, policy["detection"]["presets"])
    entropy_cfg = policy["detection"].get("entropy", {})
    if entropy_cfg.get("enabled"):
        hits += entropy_candidates(
            payload.text,
            entropy_cfg.get("min_len", 20),
            entropy_cfg.get("threshold", 4.0),
        )
    redacted = apply_redactions(payload.text, hits, policy.get("redaction", {}))

    api_key = payload.api_key or settings.groq_api_key
    if not api_key:
        raise HTTPException(status_code=400, detail="Missing GROQ_API_KEY")

    request_body = {
        "model": payload.model,
        "messages": [
            {"role": "system", "content": "You redact sensitive info before prompting."},
            {"role": "user", "content": redacted},
        ],
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        upstream = await client.post(
            f"{settings.groq_base_url}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json=request_body,
        )
        if upstream.status_code >= 400:
            raise HTTPException(status_code=upstream.status_code, detail=upstream.text)
        data = upstream.json()

    completion = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )

    add_event(
        {
            "tenant": payload.tenant,
            "direction": "request",
            "action": "redact" if hits else "pass",
            "hits": hits,
            "bytes_in": len(payload.text.encode()),
            "bytes_out": len(redacted.encode()),
        }
    )
    return {
        "original": payload.text,
        "redacted": redacted,
        "hits": hits,
        "completion": completion,
        "model": payload.model,
    }
