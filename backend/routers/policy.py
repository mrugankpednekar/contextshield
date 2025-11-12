from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..pii.policy import (
    get_policy_yaml,
    parse_policy_yaml,
    refresh_policy_cache,
    write_policy_yaml,
)

router = APIRouter()


class PolicyPayload(BaseModel):
    yaml: str


@router.get("/v1/policy/{tenant}")
def fetch_policy(tenant: str):
    return {"tenant": tenant, "yaml": get_policy_yaml(tenant)}


@router.post("/v1/policy/{tenant}/validate")
def validate_policy(tenant: str, payload: PolicyPayload):
    try:
        policy = parse_policy_yaml(payload.yaml)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"tenant": tenant, "policy": policy}


@router.post("/v1/policy/{tenant}/activate")
def activate_policy(tenant: str, payload: PolicyPayload):
    try:
        parse_policy_yaml(payload.yaml)
        write_policy_yaml(tenant, payload.yaml)
        refresh_policy_cache(tenant)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"tenant": tenant, "status": "activated"}
