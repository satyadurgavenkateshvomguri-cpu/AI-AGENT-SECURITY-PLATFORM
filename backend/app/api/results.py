from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import TestResult, SecurityTest
from app.schemas.test import TestResultSchema

router = APIRouter(prefix="/results", tags=["Test Results"])

@router.get("", response_model=List[TestResultSchema])
def list_results(
    agent_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TestResult)
    if agent_id:
        query = query.filter(TestResult.agent_id == agent_id)
    if status_filter:
        query = query.filter(TestResult.status == status_filter)

    results = query.order_by(TestResult.timestamp.desc()).all()
    output = []
    for r in results:
        t = db.query(SecurityTest).filter(SecurityTest.test_id == r.test_id).first()
        res_dict = TestResultSchema.model_validate(r)
        if t:
            res_dict.test_name = t.name
            res_dict.category = t.category
        output.append(res_dict)
    return output

@router.get("/{result_id}", response_model=TestResultSchema)
def get_result(result_id: int, db: Session = Depends(get_db)):
    r = db.query(TestResult).filter(TestResult.id == result_id).first()
    if not r:
        raise HTTPException(status_code=404, detail=f"Result {result_id} not found.")
    t = db.query(SecurityTest).filter(SecurityTest.test_id == r.test_id).first()
    res_dict = TestResultSchema.model_validate(r)
    if t:
        res_dict.test_name = t.name
        res_dict.category = t.category
    return res_dict
