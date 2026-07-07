from typing import Optional
from pydantic import BaseModel


# Used when the user creates a new category on the fly from the Ideas screen.
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


# NEW: fields the client can send when editing an existing category.
# Everything optional, same pattern as IdeaUpdate — lets a PUT/PATCH
# update just one field without needing to resend the whole object.
class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoryResponse(CategoryCreate):
    id: int

    class Config:
        from_attributes = True