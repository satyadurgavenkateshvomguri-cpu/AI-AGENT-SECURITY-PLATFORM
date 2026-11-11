import os
from pathlib import Path
from typing import Dict, Any
from app.config import DEMO_DATA_DIR

FILES_DIR = DEMO_DATA_DIR / "files"

def read_file(filename: str) -> Dict[str, Any]:
    """
    Reads a sandbox file safely.
    """
    # Standardize filename
    clean_name = os.path.basename(filename)
    target_path = FILES_DIR / clean_name

    # Check path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        if not target_path.resolve().is_relative_to(FILES_DIR.resolve()):
            return {
                "status": "error",
                "error_type": "PATH_TRAVERSAL_ATTEMPT",
                "message": f"Access denied: Target path outside sandbox directory.",
                "classification": "SECRET"
            }

    if not target_path.exists():
        return {
            "status": "error",
            "message": f"File '{clean_name}' not found in sandbox directory.",
            "available_files": ["public.txt", "internal.txt", "secret_demo.txt"]
        }

    # Determine classification based on filename
    classification = "PUBLIC"
    if "secret" in clean_name.lower():
        classification = "SECRET"
    elif "internal" in clean_name.lower():
        classification = "INTERNAL"

    with open(target_path, "r", encoding="utf-8") as f:
        content = f.read()

    return {
        "status": "success",
        "filename": clean_name,
        "classification": classification,
        "content": content
    }
