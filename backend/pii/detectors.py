"""Regex + entropy based detectors."""
from __future__ import annotations

import math
import re
from collections import Counter
from typing import Iterable

EMAIL = re.compile(r"(?i)\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b")
PHONE = re.compile(r"\b(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
CREDIT_CARD = re.compile(r"\b(?:\d[ -]*?){13,19}\b")
SSN = re.compile(r"\b(?!000|666|9\d\d)\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b")
JWT = re.compile(r"eyJ[A-Za-z0-9_-]+?\.[A-Za-z0-9._-]+?\.[A-Za-z0-9._-]+")
# AWS access keys are 20 chars total (AKIA + 16), but we also catch partial/truncated leaks (12-20 chars).
AWS_ACCESS = re.compile(r"AKIA[0-9A-Z]{12,20}")
PASSWORD = re.compile(r"(?i)password\s*(?:is|=|:)\s*([^\s]+)")

PRESETS: dict[str, tuple[str, re.Pattern[str]]] = {
    "email": ("email", EMAIL),
    "phone": ("phone", PHONE),
    "credit_card": ("credit_card", CREDIT_CARD),
    "ssn": ("ssn", SSN),
    "jwt": ("jwt", JWT),
    "aws_access_key": ("aws_access_key", AWS_ACCESS),
    "password": ("password", PASSWORD),
}


def shannon_entropy(text: str) -> float:
    if not text:
        return 0.0
    counts = Counter(text)
    total = len(text)
    return -sum((count / total) * math.log2(count / total) for count in counts.values())


def entropy_candidates(text: str, min_len: int = 20, threshold: float = 4.0):
    hits: list[dict] = []
    tokens = re.findall(rf"[A-Za-z0-9=_\-\/+\.]{{{min_len},}}", text)
    for tok in tokens:
        if shannon_entropy(tok) >= threshold:
            start = text.find(tok)
            hits.append({
                "type": "high_entropy",
                "start": start,
                "end": start + len(tok),
                "value": tok,
            })
    return hits


def regex_scan(text: str, enabled: Iterable[str]):
    hits: list[dict] = []
    for key in enabled:
        if key not in PRESETS:
            continue
        label, pattern = PRESETS[key]
        for match in pattern.finditer(text):
            if match.lastindex:
                value = match.group(1)
                start = match.start(1)
                end = match.end(1)
            else:
                value = match.group(0)
                start = match.start()
                end = match.end()
            hits.append({
                "type": label,
                "start": start,
                "end": end,
                "value": value,
            })
    return hits
