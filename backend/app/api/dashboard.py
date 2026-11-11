from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Agent, TestResult, SecurityEvent, ToolCallLog, SecurityTest
from app.schemas.dashboard import DashboardSummary, CategoryRisk
from app.schemas.log import SecurityEventSchema, ToolCallLogSchema
from app.scoring.risk_calculator import RiskCalculator

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(agent_id: Optional[int] = None, db: Session = Depends(get_db)):
    total_agents = db.query(Agent).count()

    query_res = db.query(TestResult)
    if agent_id:
        query_res = query_res.filter(TestResult.agent_id == agent_id)
    results = query_res.all()

    results_data = []
    for r in results:
        t = db.query(SecurityTest).filter(SecurityTest.test_id == r.test_id).first()
        results_data.append({
            "status": r.status,
            "severity": r.severity,
            "category": t.category if t else "General"
        })

    risk_analysis = RiskCalculator.calculate_assessment_risk(results_data)

    # Recent Security Events
    ev_query = db.query(SecurityEvent)
    if agent_id:
        ev_query = ev_query.filter(SecurityEvent.agent_id == agent_id)
    recent_events_db = ev_query.order_by(SecurityEvent.timestamp.desc()).limit(10).all()

    recent_events = []
    for e in recent_events_db:
        agent = db.query(Agent).filter(Agent.id == e.agent_id).first()
        ev_schema = SecurityEventSchema.model_validate(e)
        if agent:
            ev_schema.agent_name = agent.name
        recent_events.append(ev_schema)

    # Recent Tool Calls
    tc_query = db.query(ToolCallLog)
    if agent_id:
        tc_query = tc_query.filter(ToolCallLog.agent_id == agent_id)
    recent_calls_db = tc_query.order_by(ToolCallLog.timestamp.desc()).limit(10).all()

    recent_calls = []
    for c in recent_calls_db:
        agent = db.query(Agent).filter(Agent.id == c.agent_id).first()
        tc_schema = ToolCallLogSchema.model_validate(c)
        if agent:
            tc_schema.agent_name = agent.name
        recent_calls.append(tc_schema)

    category_breakdown = [CategoryRisk(**c) for c in risk_analysis["category_breakdown"]]

    return DashboardSummary(
        total_agents=total_agents,
        total_tests=risk_analysis["total_tests"],
        tests_passed=risk_analysis["passed_tests"],
        tests_failed=risk_analysis["failed_tests"],
        critical_issues=risk_analysis["severity_counts"]["CRITICAL"],
        high_issues=risk_analysis["severity_counts"]["HIGH"],
        medium_issues=risk_analysis["severity_counts"]["MEDIUM"],
        low_issues=risk_analysis["severity_counts"]["LOW"],
        overall_risk_score=risk_analysis["overall_risk_score"],
        overall_risk_percentage=risk_analysis["overall_risk_percentage"],
        overall_risk_level=risk_analysis["overall_risk_level"],
        category_breakdown=category_breakdown,
        recent_events=recent_events,
        recent_tool_calls=recent_calls
    )
