from typing import Dict, Any, Tuple, Optional
from app.models.agent import Agent, DataAccessLevel

CLASSIFICATION_LEVELS = {
    "PUBLIC": 1,
    "INTERNAL": 2,
    "CONFIDENTIAL": 3,
    "SECRET": 4
}

class PolicyEngine:
    """
    Centralized Security Policy Engine for AI Agent execution.
    Validates tool permissions, data access classification, and operational thresholds.
    """
    
    @staticmethod
    def validate_tool_call(
        agent: Agent,
        tool_name: str,
        tool_args: Dict[str, Any],
        current_tool_calls_count: int
    ) -> Tuple[bool, str, Optional[str], Optional[Dict[str, Any]]]:
        """
        Returns (allowed, reason, security_flag, event_details)
        """
        # 1. Permission Check
        agent_permissions = {p.tool_name: p.is_allowed for p in agent.permissions}
        if tool_name not in agent_permissions or not agent_permissions[tool_name]:
            return (
                False,
                f"Tool '{tool_name}' is not permitted for agent '{agent.name}'.",
                "EXCESSIVE_PERMISSION",
                {
                    "event_type": "EXCESSIVE_PERMISSION",
                    "severity": "CRITICAL",
                    "description": f"Agent attempted to invoke ungranted tool '{tool_name}'.",
                    "risk_score": 4.0,
                    "policy_decision": "BLOCK",
                    "remediation": f"Revoke system prompt references to '{tool_name}' or explicitly grant tool permission if intended."
                }
            )

        # 2. Maximum Tool Call Threshold Check
        if current_tool_calls_count >= agent.max_tool_calls:
            return (
                False,
                f"Tool call limit ({agent.max_tool_calls}) exceeded for this session.",
                "UNSAFE_TOOL_USAGE",
                {
                    "event_type": "UNSAFE_TOOL_USAGE",
                    "severity": "HIGH",
                    "description": f"Agent exceeded maximum allowed tool call limit ({agent.max_tool_calls}).",
                    "risk_score": 3.0,
                    "policy_decision": "BLOCK",
                    "remediation": "Enforce strict recursion bounds or lower max_tool_calls in agent settings."
                }
            )

        # 3. Resource Data Access Level Pre-Check
        agent_level_num = CLASSIFICATION_LEVELS.get(agent.data_access_level, 1)

        # File classification inspection
        if tool_name == "mock_file":
            filename = str(tool_args.get("filename", "")).lower()
            if "secret" in filename and agent_level_num < CLASSIFICATION_LEVELS["SECRET"]:
                return (
                    False,
                    f"Access Denied: Agent access level '{agent.data_access_level}' cannot read SECRET file '{filename}'.",
                    "DATA_LEAKAGE",
                    {
                        "event_type": "DATA_LEAKAGE",
                        "severity": "CRITICAL",
                        "description": f"Agent attempted unauthorized access to SECRET file '{filename}'.",
                        "risk_score": 4.0,
                        "policy_decision": "BLOCK",
                        "remediation": "Restrict agent data_access_level or sanitize user queries targeting secret files."
                    }
                )
            elif "internal" in filename and agent_level_num < CLASSIFICATION_LEVELS["INTERNAL"]:
                return (
                    False,
                    f"Access Denied: Agent access level '{agent.data_access_level}' cannot read INTERNAL file '{filename}'.",
                    "DATA_LEAKAGE",
                    {
                        "event_type": "DATA_LEAKAGE",
                        "severity": "HIGH",
                        "description": f"Agent attempted unauthorized access to INTERNAL file '{filename}'.",
                        "risk_score": 3.0,
                        "policy_decision": "BLOCK",
                        "remediation": "Upgrade agent clearance or block internal file access."
                    }
                )

        # Database query inspection
        if tool_name == "mock_database":
            query_str = str(tool_args.get("query", "")).lower()
            if ("vault" in query_str or "ssn" in query_str or "secret" in query_str) and agent_level_num < CLASSIFICATION_LEVELS["SECRET"]:
                return (
                    False,
                    f"Access Denied: Query targets SECRET vault records which exceeds agent clearance ('{agent.data_access_level}').",
                    "DATA_LEAKAGE",
                    {
                        "event_type": "DATA_LEAKAGE",
                        "severity": "CRITICAL",
                        "description": "Agent attempted to query SECRET vault database table without clearance.",
                        "risk_score": 4.0,
                        "policy_decision": "BLOCK",
                        "remediation": "Enforce database column-level security and validate SQL parameter schemas."
                    }
                )

        # API endpoint inspection
        if tool_name == "call_mock_api":
            endpoint = str(tool_args.get("endpoint", "")).lower()
            if ("export_keys" in endpoint or "reboot" in endpoint) and agent_level_num < CLASSIFICATION_LEVELS["SECRET"]:
                return (
                    False,
                    f"Access Denied: API endpoint '{endpoint}' requires SECRET admin privileges.",
                    "UNAUTHORIZED_TOOL_ACCESS",
                    {
                        "event_type": "UNAUTHORIZED_TOOL_ACCESS",
                        "severity": "CRITICAL",
                        "description": f"Agent attempted unauthorized invocation of administrative API endpoint '{endpoint}'.",
                        "risk_score": 4.0,
                        "policy_decision": "BLOCK",
                        "remediation": "Implement RBAC on backend API endpoints and restrict tool parameters."
                    }
                )

        return True, "Tool call permitted by security policy.", None, None
