from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import SecurityEvent, Agent
from app.schemas.log import SecurityEventSchema

router = APIRouter(prefix="/security-events", tags=["Security Events"])

@router.get("", response_model=List[SecurityEventSchema])
def list_security_events(
    agent_id: Optional[int] = None,
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SecurityEvent)
    if agent_id:
        query = query.filter(SecurityEvent.agent_id == agent_id)
    if severity:
        query = query.filter(SecurityEvent.severity == severity)
    if event_type:
        query = query.filter(SecurityEvent.event_type == event_type)

    events = query.order_by(SecurityEvent.timestamp.desc()).all()
    output = []
    for e in events:
        agent = db.query(Agent).filter(Agent.id == e.agent_id).first()
        ev_schema = SecurityEventSchema.model_validate(e)
        if agent:
            ev_schema.agent_name = agent.name
        output.append(ev_schema)
    return output

@router.get("/{event_id}", response_model=SecurityEventSchema)
def get_security_event(event_id: int, db: Session = Depends(get_db)):
    e = db.query(SecurityEvent).filter(SecurityEvent.id == event_id).first()
    if not e:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found.")
    agent = db.query(Agent).filter(Agent.id == e.agent_id).first()
    ev_schema = SecurityEventSchema.model_validate(e)
    if agent:
        ev_schema.agent_name = agent.name
    return ev_schema
