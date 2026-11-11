from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import ToolCallLog, Agent
from app.schemas.log import ToolCallLogSchema

router = APIRouter(prefix="/tool-calls", tags=["Tool Calls"])

@router.get("", response_model=List[ToolCallLogSchema])
def list_tool_calls(
    agent_id: Optional[int] = None,
    allowed: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ToolCallLog)
    if agent_id:
        query = query.filter(ToolCallLog.agent_id == agent_id)
    if allowed is not None:
        query = query.filter(ToolCallLog.allowed == allowed)

    logs = query.order_by(ToolCallLog.timestamp.desc()).all()
    output = []
    for l in logs:
        agent = db.query(Agent).filter(Agent.id == l.agent_id).first()
        log_schema = ToolCallLogSchema.model_validate(l)
        if agent:
            log_schema.agent_name = agent.name
        output.append(log_schema)
    return output
