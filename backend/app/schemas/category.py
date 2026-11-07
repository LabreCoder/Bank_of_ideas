from typing import Optional
from pydantic import BaseModel, Field, field_validator

from schemas._common import INPUT_CONFIG, ORM_CONFIG, reject_null


# Used when the user creates a new category on the fly from the Ideas screen.
class CategoryCreate(BaseModel):
    model_config = INPUT_CONFIG

    name: str = Field(min_length=1)
    description: Optional[str] = None


# Fields the client can send when editing an existing category.
# Everything optional, same pattern as IdeaUpdate — lets a PUT/PATCH
# update just one field without needing to resend the whole object.
class CategoryUpdate(BaseModel):
    model_config = INPUT_CONFIG

    name: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None

    _not_null = field_validator("name")(reject_null)


class CategoryResponse(BaseModel):
    model_config = ORM_CONFIG

    name: str
    description: Optional[str] = None
    id: int
