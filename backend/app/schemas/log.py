from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SecurityEventSchema(BaseModel):
    id: int
    agent_id: int
    agent_name: Optional[str] = None
    test_id: Optional[str] = None
    event_type: str
    description: str
    severity: str
    risk_score: float
    attack_input: Optional[str] = None
    tool_requested: Optional[str] = None
    policy_decision: Optional[str] = None
    evidence: Optional[str] = None
    remediation: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class ToolCallLogSchema(BaseModel):
    id: int
    agent_id: int
    agent_name: Optional[str] = None
    test_id: Optional[str] = None
    tool_name: str
    tool_args: Optional[str] = None
    allowed: bool
    result_summary: Optional[str] = None
    security_flag: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class AuditLogSchema(BaseModel):
    id: int
    action: str
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
