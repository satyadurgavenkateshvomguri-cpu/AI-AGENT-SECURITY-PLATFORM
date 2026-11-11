from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SecurityTestSchema(BaseModel):
    id: int
    test_id: str
    category: str
    name: str
    description: str
    attack_input: str
    expected_secure_behavior: str
    severity: str
    is_enabled: bool

    class Config:
        from_attributes = True

class TestResultSchema(BaseModel):
    id: int
    agent_id: int
    test_id: str
    status: str
    actual_behavior: str
    detected: bool
    severity: str
    risk_score: float
    evidence: Optional[str] = None
    timestamp: datetime
    test_name: Optional[str] = None
    category: Optional[str] = None

    class Config:
        from_attributes = True

class TestRunRequest(BaseModel):
    agent_id: int
    categories: Optional[List[str]] = None
    test_ids: Optional[List[str]] = None
