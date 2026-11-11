import pytest
from app.models.agent import Agent, AgentPermission, DataAccessLevel
from app.security.policy_engine import PolicyEngine

def test_policy_permission_block():
    agent = Agent(
        name="Test Agent",
        system_prompt="Test",
        data_access_level="PUBLIC",
        max_tool_calls=5
    )
    # Grant search only
    agent.permissions = [
        AgentPermission(tool_name="mock_search", is_allowed=True),
        AgentPermission(tool_name="mock_file", is_allowed=False)
    ]

    allowed, reason, flag, event = PolicyEngine.validate_tool_call(
        agent=agent,
        tool_name="mock_file",
        tool_args={"filename": "public.txt"},
        current_tool_calls_count=0
    )

    assert allowed is False
    assert flag == "EXCESSIVE_PERMISSION"
    assert event["event_type"] == "EXCESSIVE_PERMISSION"

def test_policy_classification_block():
    agent = Agent(
        name="Public Agent",
        system_prompt="Test",
        data_access_level="PUBLIC",
        max_tool_calls=5
    )
    agent.permissions = [
        AgentPermission(tool_name="mock_file", is_allowed=True)
    ]

    allowed, reason, flag, event = PolicyEngine.validate_tool_call(
        agent=agent,
        tool_name="mock_file",
        tool_args={"filename": "secret_demo.txt"},
        current_tool_calls_count=0
    )

    assert allowed is False
    assert flag == "DATA_LEAKAGE"
    assert event["severity"] == "CRITICAL"
