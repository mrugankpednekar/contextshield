from __future__ import annotations

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime)


class ApiKey(Base):
    __tablename__ = "api_keys"
    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    tenant = relationship("Tenant", backref="api_keys")
    prefix = Column(String, nullable=False)
    hashed_key = Column(String, nullable=False)
    created_at = Column(DateTime)
    last_used_at = Column(DateTime)


class Policy(Base):
    __tablename__ = "policies"
    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    tenant = relationship("Tenant", backref="policies")
    version = Column(Integer, nullable=False)
    yaml = Column(Text, nullable=False)
    active = Column(Boolean, default=False)
    created_at = Column(DateTime)


class Event(Base):
    __tablename__ = "events"
    id = Column(UUID(as_uuid=True), primary_key=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    ts = Column(DateTime)
    direction = Column(String)
    action = Column(String)
    detector_hits = Column(JSONB)
    bytes_in = Column(Integer)
    bytes_out = Column(Integer)
    latency_ms = Column(Integer)
    trace_id = Column(String)


class Redaction(Base):
    __tablename__ = "redactions"
    id = Column(UUID(as_uuid=True), primary_key=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"))
    kind = Column(String)
    start = Column(Integer)
    end = Column(Integer)
    replacement = Column(String)
