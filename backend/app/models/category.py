from typing import Optional
from pydantic import BaseModel


class Category(BaseModel):
    """Modelo de categoria."""
    id: Optional[int] = None
    name: str
    description: str