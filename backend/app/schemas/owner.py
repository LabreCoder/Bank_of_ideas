from typing import Optional
from pydantic import BaseModel, Field, field_validator

from schemas._common import INPUT_CONFIG, ORM_CONFIG, reject_null


class OwnerCreate(BaseModel):
    model_config = INPUT_CONFIG

    name: str = Field(min_length=1)


class OwnerResponse(BaseModel):
    # Allows building this schema directly from an ORM object
    # (idea.owner) instead of requiring a dict.
    model_config = ORM_CONFIG

    id: int
    name: str


class OwnerUpdate(BaseModel):
    model_config = INPUT_CONFIG

    name: Optional[str] = Field(default=None, min_length=1)

    _not_null = field_validator("name")(reject_null)
