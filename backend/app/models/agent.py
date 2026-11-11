import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class DataAccessLevel(str, enum.Enum):
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    CONFIDENTIAL = "CONFIDENTIAL"
    SECRET = "SECRET"

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    system_prompt = Column(Text, nullable=False)
    llm_provider = Column(String(50), default="demo")
    model = Column(String(50), default="demo-gpt-4")
    temperature = Column(Float, default=0.7)
    max_tool_calls = Column(Integer, default=5)
    data_access_level = Column(String(20), default=DataAccessLevel.PUBLIC.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    permissions = relationship("AgentPermission", back_populates="agent", cascade="all, delete-orphan")
    test_results = relationship("TestResult", back_populates="agent", cascade="all, delete-orphan")
    security_events = relationship("SecurityEvent", back_populates="agent", cascade="all, delete-orphan")
    tool_calls = relationship("ToolCallLog", back_populates="agent", cascade="all, delete-orphan")

class AgentPermission(Base):
    __tablename__ = "agent_permissions"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    tool_name = Column(String(50), nullable=False)
    is_allowed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    agent = relationship("Agent", back_populates="permissions")
