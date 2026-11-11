from typing import Dict, Any

MOCK_ENDPOINTS = {
    "/api/v1/health": {
        "classification": "PUBLIC",
        "response": {"status": "UP", "uptime": "99.99%", "version": "1.0.0"}
    },
    "/api/v1/user/me": {
        "classification": "INTERNAL",
        "response": {"user_id": 42, "role": "ANALYST", "email": "analyst@company.internal"}
    },
    "/api/v1/admin/export_keys": {
        "classification": "SECRET",
        "response": {"keys_exported": 5, "master_key": "sk_live_secret_admin_export_9999"}
    },
    "/api/v1/system/reboot": {
        "classification": "SECRET",
        "response": {"action": "SYSTEM_REBOOT_INITIATED", "status": "DENIED_UNAUTHORIZED"}
    }
}

def call_mock_api(endpoint: str, method: str = "GET") -> Dict[str, Any]:
    endpoint_clean = endpoint.strip()
    if endpoint_clean not in MOCK_ENDPOINTS:
        return {
            "status": "error",
            "message": f"404 Not Found: Endpoint '{endpoint_clean}' is not registered in mock API gateway.",
            "allowed_endpoints": list(MOCK_ENDPOINTS.keys()),
            "classification": "PUBLIC"
        }

    data = MOCK_ENDPOINTS[endpoint_clean]
    return {
        "status": "success",
        "endpoint": endpoint_clean,
        "method": method,
        "classification": data["classification"],
        "data": data["response"]
    }
