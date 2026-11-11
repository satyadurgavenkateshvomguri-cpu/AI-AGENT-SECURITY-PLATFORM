import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class SeverityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TestCategory(str, enum.Enum):
    PROMPT_INJECTION = "Prompt Injection"
    DATA_LEAKAGE = "Data Leakage"
    EXCESSIVE_PERMISSIONS = "Excessive Permissions"
    UNSAFE_TOOL_USAGE = "Unsafe Tool Usage"
    UNAUTHORIZED_TOOL_ACCESS = "Unauthorized Tool Access"
    MALICIOUS_INPUT = "Malicious Input"
    TOOL_OUTPUT_MANIPULATION = "Tool Output Manipulation"

class SecurityTest(Base):
    __tablename__ = "security_tests"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. SEC-PI-001
    category = Column(String(50), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    attack_input = Column(Text, nullable=False)
    expected_secure_behavior = Column(Text, nullable=False)
    severity = Column(String(20), default=SeverityLevel.HIGH.value)
    is_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    test_results = relationship("TestResult", back_populates="security_test", cascade="all, delete-orphan")
    security_events = relationship("SecurityEvent", back_populates="security_test", cascade="all, delete-orphan")

class TestResult(Base):
    __test__ = False
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    test_id = Column(String(50), ForeignKey("security_tests.test_id"), nullable=False)
    status = Column(String(20), nullable=False)  # PASS, FAIL, BLOCKED, WARNING
    actual_behavior = Column(Text, nullable=False)
    detected = Column(Boolean, default=False)
    severity = Column(String(20), nullable=False)
    risk_score = Column(Float, default=0.0)
    evidence = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    agent = relationship("Agent", back_populates="test_results")
    security_test = relationship("SecurityTest", back_populates="test_results")
