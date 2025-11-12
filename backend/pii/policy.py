"""Policy loading helpers."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

from ..config import get_settings

DEFAULT_POLICY: dict[str, Any] = {
    "tenant_id": "demo",
    "mode": "observe",
    "detection": {
        "presets": ["email", "phone", "credit_card", "ssn", "jwt", "aws_access_key", "password"],
        "entropy": {"enabled": True, "min_len": 20, "threshold": 4.0},
        "ner": {"enabled": False, "entities": ["PERSON", "ORG", "LOCATION"]},
    },
    "redaction": {
        "email": "mask",
        "phone": "mask",
        "credit_card": "tokenize",
        "ssn": "tokenize",
        "jwt": "drop",
        "aws_access_key": "drop",
        "password": "drop",
    },
    "responses": {
        "redact_model_output": True,
        "block_if_detected": ["credit_card", "ssn", "jwt", "aws_access_key"],
    },
    "logging": {
        "store_raw": False,
        "pii_snapshots": True,
        "retention_days": 90,
    },
}


def _policy_path(tenant: str) -> Path:
    settings = get_settings()
    base = Path(settings.policy_dir)
    return base / f"{tenant}.yaml"


@lru_cache(maxsize=32)
def load_policy_for_tenant(tenant: str) -> dict[str, Any]:
    path = _policy_path(tenant)
    if not path.exists():
        if tenant != "demo":
            return DEFAULT_POLICY
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(yaml.safe_dump(DEFAULT_POLICY))
    return _validate_policy(yaml.safe_load(path.read_text()))


def _validate_policy(data: dict[str, Any]) -> dict[str, Any]:
    data.setdefault("mode", "observe")
    data.setdefault("detection", {})
    data["detection"].setdefault("presets", [])
    data["detection"].setdefault("entropy", {"enabled": False, "min_len": 20, "threshold": 4.0})
    data["detection"].setdefault("ner", {"enabled": False, "entities": []})
    data.setdefault("redaction", {})
    data.setdefault("responses", {"redact_model_output": False, "block_if_detected": []})
    data.setdefault("logging", {})
    return data


def refresh_policy_cache(tenant: str) -> dict[str, Any]:
    load_policy_for_tenant.cache_clear()
    return load_policy_for_tenant(tenant)


def get_policy_yaml(tenant: str) -> str:
    path = _policy_path(tenant)
    if path.exists():
        return path.read_text()
    return yaml.safe_dump(DEFAULT_POLICY)


def write_policy_yaml(tenant: str, content: str) -> None:
    path = _policy_path(tenant)
    path.parent.mkdir(parents=True, exist_ok=True)
    yaml.safe_load(content)  # raise if invalid
    path.write_text(content)
    refresh_policy_cache(tenant)


def parse_policy_yaml(content: str) -> dict[str, Any]:
    data = yaml.safe_load(content) or {}
    if not isinstance(data, dict):
        raise ValueError("policy must be a mapping")
    return _validate_policy(data)
