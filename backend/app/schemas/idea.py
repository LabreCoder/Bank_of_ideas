from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from schemas.category import CategoryResponse
from schemas.owner import OwnerResponse


# Fields the client sends when registering a new idea.
class IdeaCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    owner_id: int


# Fields the client can send when editing an existing idea.
# Everything is optional here: a PUT can update just one field
# without needing to resend the whole object.
class IdeaUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    owner_id: Optional[int] = None


# What the API returns for an idea. Includes fields the user never
# sends directly — they're either DB defaults (created_at, is_active)
# or computed on the fly (execution_status).
class IdeaResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: Optional[CategoryResponse] = None
    owner: OwnerResponse
    is_active: bool
    created_at: datetime
    execution_status: str  # "Free" or "In Planning" — never stored, always derived

    class Config:
        from_attributes = True
