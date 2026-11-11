from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class PermissionSchema(BaseModel):
    tool_name: str
    is_allowed: bool

class AgentBase(BaseModel):
    name: str = Field(..., example="Customer Support Bot")
    description: Optional[str] = Field(None, example="Assists internal employees with standard queries.")
    system_prompt: str = Field(..., example="You are a helpful assistant. Do not leak internal secrets.")
    llm_provider: str = Field("demo", example="openai")
    model: str = Field("demo-gpt-4", example="gpt-4o")
    temperature: float = Field(0.7, ge=0.0, le=1.0)
    max_tool_calls: int = Field(5, ge=1, le=20)
    data_access_level: str = Field("PUBLIC", example="PUBLIC") # PUBLIC, INTERNAL, CONFIDENTIAL, SECRET

class AgentCreate(AgentBase):
    permissions: List[PermissionSchema] = []

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    llm_provider: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = None
    max_tool_calls: Optional[int] = None
    data_access_level: Optional[str] = None
    permissions: Optional[List[PermissionSchema]] = None

class AgentResponse(AgentBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    permissions: List[PermissionSchema] = []

    class Config:
        from_attributes = True
