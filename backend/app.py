from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import audit, demo, health, policy, proxy

settings = get_settings()

app = FastAPI(title="ContextShield", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.allow_origins.split(",") if o.strip()] or ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(proxy.router)
app.include_router(demo.router)
app.include_router(audit.router)
app.include_router(policy.router)


@app.get("/")
def root():
    return {"service": "ContextShield", "status": "ok"}
