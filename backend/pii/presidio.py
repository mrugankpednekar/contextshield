"""Optional Presidio detector integration."""
from __future__ import annotations

from typing import Any

try:
    from presidio_analyzer import AnalyzerEngine
except Exception:  # presidio optional
    AnalyzerEngine = None  # type: ignore


_engine: AnalyzerEngine | None = None


def get_engine() -> AnalyzerEngine | None:
    global _engine
    if AnalyzerEngine is None:
        return None
    if _engine is None:
        _engine = AnalyzerEngine()
    return _engine


def analyze_text(text: str, entities: list[str] | None = None) -> list[dict[str, Any]]:
    engine = get_engine()
    if engine is None:
        return []
    results = engine.analyze(text=text, entities=entities or None, language="en")
    hits: list[dict[str, Any]] = []
    for res in results:
        hits.append({
            "type": res.entity_type.lower(),
            "start": res.start,
            "end": res.end,
            "value": text[res.start : res.end],
        })
    return hits
