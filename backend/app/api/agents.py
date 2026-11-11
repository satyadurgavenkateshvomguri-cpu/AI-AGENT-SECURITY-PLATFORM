from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Agent, AgentPermission, TestResult, SecurityEvent, ToolCallLog
from app.schemas.agent import AgentCreate, AgentUpdate, AgentResponse, PermissionSchema
from app.security.test_engine import TestEngine

router = APIRouter(prefix="/agents", tags=["AI Agents"])

@router.post("", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
def create_agent(agent_in: AgentCreate, db: Session = Depends(get_db)):
    db_agent = Agent(
        name=agent_in.name,
        description=agent_in.description,
        system_prompt=agent_in.system_prompt,
        llm_provider=agent_in.llm_provider,
        model=agent_in.model,
        temperature=agent_in.temperature,
        max_tool_calls=agent_in.max_tool_calls,
        data_access_level=agent_in.data_access_level
    )
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)

    # Add permissions
    for p in agent_in.permissions:
        perm = AgentPermission(
            agent_id=db_agent.id,
            tool_name=p.tool_name,
            is_allowed=p.is_allowed
        )
        db.add(perm)

    db.commit()
    db.refresh(db_agent)
    return db_agent

@router.get("", response_model=List[AgentResponse])
def list_agents(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    return agents

@router.get("/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found.")
    return agent

@router.put("/{agent_id}", response_model=AgentResponse)
def update_agent(agent_id: int, agent_in: AgentUpdate, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found.")

    update_data = agent_in.model_dump(exclude_unset=True)
    permissions_data = update_data.pop("permissions", None)

    for field, value in update_data.items():
        setattr(agent, field, value)

    if permissions_data is not None:
        db.query(AgentPermission).filter(AgentPermission.agent_id == agent_id).delete()
        for p in permissions_data:
            perm = AgentPermission(
                agent_id=agent_id,
                tool_name=p["tool_name"],
                is_allowed=p["is_allowed"]
            )
            db.add(perm)

    db.commit()
    db.refresh(agent)
    return agent

@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found.")
    db.delete(agent)
    db.commit()
    return None

@router.post("/{agent_id}/test")
def run_agent_test(agent_id: int, db: Session = Depends(get_db)):
    try:
        res = TestEngine.run_assessment(db=db, agent_id=agent_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
