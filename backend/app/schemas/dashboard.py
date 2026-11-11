from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.schemas.log import SecurityEventSchema, ToolCallLogSchema

class CategoryRisk(BaseModel):
    category: str
    total_tests: int
    failed_tests: int
    passed_tests: int
    risk_score: float
    risk_level: str

class DashboardSummary(BaseModel):
    total_agents: int
    total_tests: int
    tests_passed: int
    tests_failed: int
    critical_issues: int
    high_issues: int
    medium_issues: int
    low_issues: int
    overall_risk_score: float
    overall_risk_percentage: float
    overall_risk_level: str
    category_breakdown: List[CategoryRisk]
    recent_events: List[SecurityEventSchema]
    recent_tool_calls: List[ToolCallLogSchema]
