from typing import Dict, Any, List, TypedDict
from langgraph.graph import StateGraph, END
from app.models.agent import Agent
from app.agents.mock_llm import MockLLM
from app.security.policy_engine import PolicyEngine
from app.tools.registry import get_tool

class AgentState(TypedDict):
    agent: Agent
    user_input: str
    current_response: str
    tool_call_request: Dict[str, Any]
    tool_outputs: List[Dict[str, Any]]
    tool_call_count: int
    tool_call_logs: List[Dict[str, Any]]
    blocked_events: List[Dict[str, Any]]
    is_finished: bool

def agent_node(state: AgentState) -> AgentState:
    res = MockLLM.generate_response(
        agent=state["agent"],
        user_input=state["user_input"],
        tool_outputs=state["tool_outputs"]
    )
    state["current_response"] = res.get("text", "")
    tool_call = res.get("tool_call")
    if tool_call:
        state["tool_call_request"] = tool_call
    else:
        state["is_finished"] = True
    return state

def policy_check_node(state: AgentState) -> AgentState:
    req = state.get("tool_call_request")
    if not req:
        state["is_finished"] = True
        return state

    tool_name = req.get("name")
    tool_args = req.get("args", {})
    
    allowed, reason, flag, event_details = PolicyEngine.validate_tool_call(
        agent=state["agent"],
        tool_name=tool_name,
        tool_args=tool_args,
        current_tool_calls_count=state["tool_call_count"]
    )

    if not allowed:
        state["blocked_events"].append(event_details)
        state["tool_call_logs"].append({
            "tool_name": tool_name,
            "tool_args": str(tool_args),
            "allowed": False,
            "result_summary": f"BLOCKED by Policy Engine: {reason}",
            "security_flag": flag
        })
        state["tool_outputs"].append({
            "tool": tool_name,
            "status": "blocked",
            "reason": reason
        })
        state["tool_call_request"] = None
        state["is_finished"] = True
    return state

def tool_execution_node(state: AgentState) -> AgentState:
    req = state.get("tool_call_request")
    if not req:
        state["is_finished"] = True
        return state

    tool_name = req.get("name")
    tool_args = req.get("args", {})
    
    try:
        func = get_tool(tool_name)
        result = func(**tool_args)
    except Exception as e:
        result = {"status": "error", "message": str(e)}

    state["tool_call_count"] += 1
    state["tool_call_logs"].append({
        "tool_name": tool_name,
        "tool_args": str(tool_args),
        "allowed": True,
        "result_summary": str(result)[:300],
        "security_flag": None
    })
    state["tool_outputs"].append({
        "tool": tool_name,
        "status": "executed",
        "result": result
    })
    state["tool_call_request"] = None
    return state

def should_continue(state: AgentState) -> str:
    if state.get("is_finished"):
        return "end"
    if state.get("tool_call_request"):
        return "policy_check"
    return "end"

def check_after_policy(state: AgentState) -> str:
    if state.get("is_finished") or not state.get("tool_call_request"):
        return "agent"
    return "tool_execution"

# Build Graph
builder = StateGraph(AgentState)
builder.add_node("agent", agent_node)
builder.add_node("policy_check", policy_check_node)
builder.add_node("tool_execution", tool_execution_node)

builder.set_entry_point("agent")

builder.add_conditional_edges("agent", should_continue, {
    "policy_check": "policy_check",
    "end": END
})

builder.add_conditional_edges("policy_check", check_after_policy, {
    "agent": "agent",
    "tool_execution": "tool_execution"
})

builder.add_edge("tool_execution", "agent")

compiled_agent_graph = builder.compile()

class LangGraphAgentRunner:
    """
    Executes an AI Agent through the LangGraph State Graph workflow.
    """

    @staticmethod
    def run_agent(agent: Agent, user_input: str) -> Dict[str, Any]:
        initial_state: AgentState = {
            "agent": agent,
            "user_input": user_input,
            "current_response": "",
            "tool_call_request": None,
            "tool_outputs": [],
            "tool_call_count": 0,
            "tool_call_logs": [],
            "blocked_events": [],
            "is_finished": False
        }

        final_state = compiled_agent_graph.invoke(initial_state)

        return {
            "final_response": final_state.get("current_response", ""),
            "tool_calls": final_state.get("tool_call_logs", []),
            "blocked_events": final_state.get("blocked_events", []),
            "total_tool_calls": final_state.get("tool_call_count", 0)
        }
