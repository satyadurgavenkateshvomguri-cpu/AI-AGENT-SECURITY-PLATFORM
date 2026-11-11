from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models import Agent, TestResult, SecurityEvent, SecurityTest
from app.scoring.risk_calculator import RiskCalculator

class ReportGenerator:
    """
    Generates structured security assessment reports for AI Agents.
    Includes Executive Summary, Configuration Matrix, Test Findings, Risk Analysis, and Mitigation Roadmap.
    """

    @staticmethod
    def generate_report_data(db: Session, agent_id: int) -> Dict[str, Any]:
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise ValueError(f"Agent with ID {agent_id} not found.")

        results = db.query(TestResult).filter(TestResult.agent_id == agent_id).all()
        events = db.query(SecurityEvent).filter(SecurityEvent.agent_id == agent_id).all()

        results_list = []
        for r in results:
            t = db.query(SecurityTest).filter(SecurityTest.test_id == r.test_id).first()
            results_list.append({
                "test_id": r.test_id,
                "name": t.name if t else r.test_id,
                "category": t.category if t else "General",
                "status": r.status,
                "severity": r.severity,
                "risk_score": r.risk_score,
                "actual_behavior": r.actual_behavior,
                "evidence": r.evidence,
                "expected_behavior": t.expected_secure_behavior if t else ""
            })

        risk_summary = RiskCalculator.calculate_assessment_risk(results_list)

        events_list = []
        for e in events:
            events_list.append({
                "id": e.id,
                "event_type": e.event_type,
                "description": e.description,
                "severity": e.severity,
                "policy_decision": e.policy_decision,
                "evidence": e.evidence,
                "remediation": e.remediation,
                "timestamp": e.timestamp.strftime("%Y-%m-%d %H:%M:%S") if e.timestamp else ""
            })

        # Generate automated recommendations
        recommendations = []
        if risk_summary["overall_risk_level"] in ["CRITICAL", "HIGH"]:
            recommendations.append({
                "priority": "HIGH",
                "finding": "High or Critical Vulnerability Exposure detected during test execution.",
                "recommendation": "Harden system instructions using XML prompt boundary tags and restrict tool execution permissions."
            })

        if any(r["category"] == "Prompt Injection" and r["status"] == "FAIL" for r in results_list):
            recommendations.append({
                "priority": "HIGH",
                "finding": "Agent system prompt was susceptible to prompt injection override attacks.",
                "recommendation": "Implement input pre-filtering and system prompt instruction isolation."
            })

        if any(r["category"] == "Data Leakage" and r["status"] in ["FAIL", "BLOCKED"] for r in results_list):
            recommendations.append({
                "priority": "MEDIUM",
                "finding": "Agent attempted to query or leak sensitive/classified data.",
                "recommendation": "Enforce data_access_level clearance checks and column-level encryption in sandbox databases."
            })

        if any(r["category"] == "Excessive Permissions" for r in results_list):
            recommendations.append({
                "priority": "HIGH",
                "finding": "Agent attempted execution of ungranted tools.",
                "recommendation": "Enforce strict Policy Engine validation before passing tool call requests to execution handlers."
            })

        if not recommendations:
            recommendations.append({
                "priority": "LOW",
                "finding": "Agent satisfied security baseline policy checks.",
                "recommendation": "Maintain continuous security testing as new tools or system prompts are updated."
            })

        return {
            "title": f"Security Assessment Report: {agent.name}",
            "generated_at": agent.updated_at.strftime("%Y-%m-%d %H:%M:%S") if agent.updated_at else "",
            "agent_info": {
                "id": agent.id,
                "name": agent.name,
                "description": agent.description,
                "llm_provider": agent.llm_provider,
                "model": agent.model,
                "temperature": agent.temperature,
                "max_tool_calls": agent.max_tool_calls,
                "data_access_level": agent.data_access_level,
                "system_prompt": agent.system_prompt,
                "permissions": [p.tool_name for p in agent.permissions if p.is_allowed]
            },
            "risk_summary": risk_summary,
            "results": results_list,
            "events": events_list,
            "recommendations": recommendations
        }
