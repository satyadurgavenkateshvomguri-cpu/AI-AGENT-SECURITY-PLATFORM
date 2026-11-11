import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    test_id = Column(String(50), ForeignKey("security_tests.test_id"), nullable=True)
    event_type = Column(String(50), nullable=False) # e.g. PROMPT_INJECTION, DATA_LEAKAGE, EXCESSIVE_PERMISSION
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Float, default=0.0)
    attack_input = Column(Text, nullable=True)
    tool_requested = Column(String(100), nullable=True)
    policy_decision = Column(String(20), nullable=True) # ALLOW, BLOCK, ALERT
    evidence = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    agent = relationship("Agent", back_populates="security_events")
    security_test = relationship("SecurityTest", back_populates="security_events")

class ToolCallLog(Base):
    __tablename__ = "tool_calls"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    test_id = Column(String(50), nullable=True)
    tool_name = Column(String(100), nullable=False)
    tool_args = Column(Text, nullable=True)
    allowed = Column(Boolean, default=True)
    result_summary = Column(Text, nullable=True)
    security_flag = Column(String(50), nullable=True) # e.g. BLOCKED_EXCESSIVE_PERM, DATA_LEAK_RISK
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    agent = relationship("Agent", back_populates="tool_calls")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(String(20), default="ANALYST")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
