from pydantic import BaseModel


class OwnerCreate(BaseModel):
    name: str


class OwnerResponse(BaseModel):
    id: int
    name: str

    class Config:
        # Allows building this schema directly from an ORM object
        # (idea.owner) instead of requiring a dict.
        from_attributes = True