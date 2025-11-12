from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..pii.detectors import entropy_candidates, regex_scan
from ..pii.policy import load_policy_for_tenant
from ..pii.redactor import apply_redactions
from ..store.events import add_event

router = APIRouter()


class DemoIn(BaseModel):
    text: str = Field(..., max_length=10_000)
    tenant: str = "demo"


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
