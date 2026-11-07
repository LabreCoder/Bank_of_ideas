from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from schemas._common import INPUT_CONFIG, ORM_CONFIG, reject_null
from schemas.category import CategoryResponse
from schemas.owner import OwnerResponse


# Fields the client sends when registering a new idea.
# description is VARCHAR(200) in the DB, so validate here (422) instead of
# letting the insert blow up with a 500.
class IdeaCreate(BaseModel):
    model_config = INPUT_CONFIG

    name: str = Field(min_length=1, max_length=200)  # VARCHAR(200) (X03)
    description: Optional[str] = Field(default=None, max_length=200)
    category_id: Optional[int] = None
    owner_id: int


# Fields the client can send when editing an existing idea.
# Everything is optional here: a PUT can update just one field
# without needing to resend the whole object. name/owner_id are NOT NULL in
# the DB, so an explicit null is rejected (422); category_id/description
# accept null (clears the value).
class IdeaUpdate(BaseModel):
    model_config = INPUT_CONFIG

    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=200)
    category_id: Optional[int] = None
    owner_id: Optional[int] = None

    _not_null = field_validator("name", "owner_id")(reject_null)


# What the API returns for an idea. Includes fields the user never
# sends directly — they're either DB defaults (created_at, is_active)
# or computed on the fly (execution_status).
class IdeaResponse(BaseModel):
    model_config = ORM_CONFIG

    id: int
    name: str
    description: Optional[str] = None
    category: Optional[CategoryResponse] = None
    owner: OwnerResponse
    is_active: bool
    created_at: datetime
    execution_status: str  # "Free" or "In Planning" — never stored, always derived
