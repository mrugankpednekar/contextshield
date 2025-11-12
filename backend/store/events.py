"""Temporary in-memory event store for the demo."""
from __future__ import annotations

from collections import deque
from datetime import datetime
from typing import Any

MAX_EVENTS = 5000
_EVENTS = deque(maxlen=MAX_EVENTS)


def add_event(event: dict[str, Any]) -> None:
    event.setdefault("ts", datetime.utcnow())
    _EVENTS.append(event)


def get_events() -> list[dict[str, Any]]:
    return list(_EVENTS)
