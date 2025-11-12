from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class DetectorHit(BaseModel):
    type: str
    start: int
    end: int
    value: str | None = None
    replacement: str | None = None


class EventRecord(BaseModel):
    id: str | None = None
    tenant_id: str | None = None
    ts: datetime
    direction: str
    action: str
    hits: list[DetectorHit] = []
    bytes_in: int | None = None
    bytes_out: int | None = None
    latency_ms: int | None = None
    trace_id: str | None = None
    metadata: dict[str, Any] | None = None
