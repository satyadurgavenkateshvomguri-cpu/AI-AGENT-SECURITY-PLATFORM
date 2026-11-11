from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Agent, SecurityTest, TestResult, SecurityEvent, ToolCallLog, AuditLog
from app.agents.langgraph_agent import LangGraphAgentRunner
from app.security.detector import SecurityDetector
from app.scoring.risk_calculator import RiskCalculator

class TestEngine:
    """
    Orchestrates execution of Security Assessment Test Suites against an AI Agent.
    Collects logs, records security events, and calculates overall risk scores.
    """

    @staticmethod
    def run_assessment(
        db: Session,
        agent_id: int,
        categories: Optional[List[str]] = None,
        test_ids: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise ValueError(f"Agent with ID {agent_id} not found.")

        # Query Security Tests
        query = db.query(SecurityTest).filter(SecurityTest.is_enabled == True)
        if test_ids:
            query = query.filter(SecurityTest.test_id.in_(test_ids))
        elif categories:
            query = query.filter(SecurityTest.category.in_(categories))

        tests = query.all()
        if not tests:
            raise ValueError("No matching enabled security tests found.")

        # Delete past results for this agent assessment run to avoid mixing stale runs
        db.query(TestResult).filter(TestResult.agent_id == agent_id).delete()
        db.commit()

        run_results_data = []

        for test in tests:
            # 1. Run agent against attack input via LangGraph workflow
            agent_execution = LangGraphAgentRunner.run_agent(
                agent=agent,
                user_input=test.attack_input
            )

            # 2. Detect violations using SecurityDetector
            analysis = SecurityDetector.analyze_interaction(
                agent=agent,
                test_category=test.category,
                attack_input=test.attack_input,
                agent_response=agent_execution["final_response"],
                tool_calls=agent_execution["tool_calls"],
                blocked_events=agent_execution["blocked_events"]
            )

            # 3. Store Tool Call Logs
            for call_log in agent_execution["tool_calls"]:
                db_tool_call = ToolCallLog(
                    agent_id=agent.id,
                    test_id=test.test_id,
                    tool_name=call_log["tool_name"],
                    tool_args=call_log.get("tool_args"),
                    allowed=call_log["allowed"],
                    result_summary=call_log.get("result_summary"),
                    security_flag=call_log.get("security_flag")
                )
                db.add(db_tool_call)

            # 4. Store Security Events if blocked or detected
            for blocked_ev in agent_execution["blocked_events"]:
                db_event = SecurityEvent(
                    agent_id=agent.id,
                    test_id=test.test_id,
                    event_type=blocked_ev.get("event_type", "SECURITY_POLICY_BLOCK"),
                    description=blocked_ev.get("description", "Policy Engine blocked request."),
                    severity=blocked_ev.get("severity", test.severity),
                    risk_score=blocked_ev.get("risk_score", 3.0),
                    attack_input=test.attack_input,
                    tool_requested=blocked_ev.get("tool_name"),
                    policy_decision=blocked_ev.get("policy_decision", "BLOCK"),
                    evidence=analysis["evidence"],
                    remediation=blocked_ev.get("remediation")
                )
                db.add(db_event)

            if analysis["detected"] and not agent_execution["blocked_events"]:
                # Vulnerability was NOT blocked by policy and succeeded!
                db_event = SecurityEvent(
                    agent_id=agent.id,
                    test_id=test.test_id,
                    event_type=analysis.get("violation_type", "SECURITY_VIOLATION"),
                    description=f"Security violation detected during {test.category} test.",
                    severity=analysis["severity"],
                    risk_score=analysis["risk_score"],
                    attack_input=test.attack_input,
                    tool_requested=None,
                    policy_decision="FAIL",
                    evidence=analysis["evidence"],
                    remediation=analysis.get("remediation")
                )
                db.add(db_event)

            # 5. Store TestResult
            db_result = TestResult(
                agent_id=agent.id,
                test_id=test.test_id,
                status=analysis["status"],
                actual_behavior=analysis["actual_behavior"],
                detected=analysis["detected"],
                severity=test.severity,
                risk_score=analysis["risk_score"],
                evidence=analysis["evidence"]
            )
            db.add(db_result)
            db.commit()

            run_results_data.append({
                "test_id": test.test_id,
                "category": test.category,
                "status": analysis["status"],
                "severity": test.severity,
                "risk_score": analysis["risk_score"]
            })

        # 6. Compute Assessment Risk Score
        risk_summary = RiskCalculator.calculate_assessment_risk(run_results_data)

        # Audit log
        db_audit = AuditLog(
            action="RUN_SECURITY_ASSESSMENT",
            details=f"Executed {len(tests)} tests for agent '{agent.name}'. Risk Score: {risk_summary['overall_risk_score']}% ({risk_summary['overall_risk_level']})"
        )
        db.add(db_audit)
        db.commit()

        return {
            "agent_id": agent.id,
            "agent_name": agent.name,
            "total_tests_executed": len(tests),
            "summary": risk_summary
        }
