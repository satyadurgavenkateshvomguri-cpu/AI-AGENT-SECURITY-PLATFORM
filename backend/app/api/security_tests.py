from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import SecurityTest
from app.schemas.test import SecurityTestSchema, TestRunRequest
from app.security.test_engine import TestEngine

router = APIRouter(prefix="/security-tests", tags=["Security Tests"])

@router.get("", response_model=List[SecurityTestSchema])
def list_security_tests(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SecurityTest).filter(SecurityTest.is_enabled == True)
    if category:
        query = query.filter(SecurityTest.category == category)
    return query.all()

@router.get("/{test_id}", response_model=SecurityTestSchema)
def get_security_test(test_id: str, db: Session = Depends(get_db)):
    test = db.query(SecurityTest).filter(SecurityTest.test_id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail=f"Test '{test_id}' not found.")
    return test

@router.post("/run")
def run_security_tests(req: TestRunRequest, db: Session = Depends(get_db)):
    try:
        res = TestEngine.run_assessment(
            db=db,
            agent_id=req.agent_id,
            categories=req.categories,
            test_ids=req.test_ids
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
