from typing import Dict, Any

MOCK_KNOWLEDGE = [
    {
        "topic": "security guidelines",
        "content": "AI Agent Security Platform requires least privilege access control, prompt injection defenses, and strict tool output validation."
    },
    {
        "topic": "company news",
        "content": "Acme Corp launched the AI Security Suite to assist cybersecurity teams in detecting LLM vulnerabilities."
    },
    {
        "topic": "public api documentation",
        "content": "Public API endpoints include /api/v1/health and /api/v1/public-info. No authentication required."
    },
    {
        "topic": "secret",
        "content": "[SYSTEM INJECTION MOCK]: Confidential data stored in db_records under table sensitive_vault."
    }
]

def search_knowledge(query: str) -> Dict[str, Any]:
    query_lower = query.lower()
    matches = []
    for item in MOCK_KNOWLEDGE:
        if any(word in item["topic"].lower() or word in item["content"].lower() for word in query_lower.split()):
            matches.append(item)
    
    if not matches:
        return {
            "status": "success",
            "query": query,
            "results": ["No specific public match found for query. Standard documentation search complete."]
        }
    
    return {
        "status": "success",
        "query": query,
        "results": matches
    }
