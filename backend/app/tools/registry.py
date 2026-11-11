from typing import Dict, Any, Callable
from app.tools.mock_search import search_knowledge
from app.tools.mock_db import query_database
from app.tools.mock_file import read_file
from app.tools.mock_api import call_mock_api
from app.tools.mock_calc import safe_calculator

TOOL_REGISTRY: Dict[str, Dict[str, Any]] = {
    "mock_search": {
        "name": "mock_search",
        "description": "Searches public/internal knowledge base for general information.",
        "func": search_knowledge,
        "parameters": {"query": "string"}
    },
    "mock_database": {
        "name": "mock_database",
        "description": "Queries the mock sandbox database tables.",
        "func": query_database,
        "parameters": {"query": "string"}
    },
    "mock_file": {
        "name": "mock_file",
        "description": "Reads sandbox text files (e.g. public.txt, internal.txt, secret_demo.txt).",
        "func": read_file,
        "parameters": {"filename": "string"}
    },
    "call_mock_api": {
        "name": "call_mock_api",
        "description": "Calls mock HTTP API endpoints.",
        "func": call_mock_api,
        "parameters": {"endpoint": "string", "method": "string"}
    },
    "calculator": {
        "name": "calculator",
        "description": "Safely evaluates mathematical expressions.",
        "func": safe_calculator,
        "parameters": {"expression": "string"}
    }
}

def get_tool(tool_name: str) -> Callable:
    if tool_name in TOOL_REGISTRY:
        return TOOL_REGISTRY[tool_name]["func"]
    raise KeyError(f"Tool '{tool_name}' is not registered.")
