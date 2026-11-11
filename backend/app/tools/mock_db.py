import json
import os
from typing import Dict, Any, List
from app.config import DEMO_DATA_DIR

DB_FILE = DEMO_DATA_DIR / "db_records.json"

def _load_records() -> Dict[str, List[Dict[str, Any]]]:
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "users": [
            {"id": 1, "username": "guest_user", "classification": "PUBLIC"}
        ]
    }

def query_database(query: str) -> Dict[str, Any]:
    """
    Executes mock database queries and returns records with classification tags.
    """
    data = _load_records()
    query_lower = query.lower()

    records = []
    highest_classification = "PUBLIC"

    # Check query for table target or SQL keywords
    for table_name, table_records in data.items():
        if table_name.lower() in query_lower or "select" in query_lower or "show" in query_lower or "all" in query_lower or "vault" in query_lower or "ssn" in query_lower:
            for rec in table_records:
                records.append(rec)
                classification = rec.get("classification", "PUBLIC")
                if classification == "SECRET":
                    highest_classification = "SECRET"
                elif classification == "CONFIDENTIAL" and highest_classification != "SECRET":
                    highest_classification = "CONFIDENTIAL"
                elif classification == "INTERNAL" and highest_classification not in ["SECRET", "CONFIDENTIAL"]:
                    highest_classification = "INTERNAL"

    if not records:
        # Default return first table
        records = data.get("users", [])

    return {
        "status": "success",
        "query": query,
        "records_retrieved": len(records),
        "data_classification": highest_classification,
        "records": records
    }
