"""Helpers for redacting hits."""
from __future__ import annotations

from collections import defaultdict


def mask_email(value: str) -> str:
    try:
        local, domain = value.split("@", 1)
    except ValueError:
        return "***"
    if len(local) <= 2:
        return "*" * len(local) + "@" + domain
    return f"{local[0]}{'*' * (len(local) - 2)}{local[-1]}@{domain}"


def tokenize(kind: str, idx: int) -> str:
    return f"{{{{{kind.upper()}_{idx}}}}}"


def apply_redactions(text: str, hits: list[dict], redaction_map: dict[str, str]):
    ordered = sorted(hits, key=lambda h: h["start"])
    out: list[str] = []
    last = 0
    counters = defaultdict(int)
    for hit in ordered:
        out.append(text[last : hit["start"]])
        kind = hit["type"]
        action = redaction_map.get(kind, "mask")
        if action == "mask" and kind == "email":
            out.append(mask_email(hit.get("value", "")))
        elif action == "tokenize":
            counters[kind] += 1
            out.append(tokenize(kind, counters[kind]))
        elif action == "drop":
            out.append("")
        else:
            out.append("***")
        last = hit["end"]
    out.append(text[last:])
    return "".join(out)
