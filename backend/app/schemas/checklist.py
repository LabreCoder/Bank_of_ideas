from typing import List, Optional
from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel, field_validator


def _empty_date_to_none(value):
    # <input type="date"> vazio chega como "" — tratamos como "sem data".
    if isinstance(value, str) and not value.strip():
        return None
    return value


class ChecklistItemCreate(BaseModel):
    description: str
    due_date: Optional[date] = None
    position: Optional[int] = None  # se None, o service calcula o próximo

    normalize_due_date = field_validator("due_date", mode="before")(_empty_date_to_none)


class ChecklistItemResponse(BaseModel):
    id: int
    description: str
    due_date: Optional[date] = None
    is_done: bool
    position: int

    class Config:
        from_attributes = True
    
    
class ChecklistItemUpdate(BaseModel):
    id: Optional[int] = None  
    description: Optional[str] = None
    due_date: Optional[date] = None
    is_done: Optional[bool] = None
    position: Optional[int] = None

    normalize_due_date = field_validator("due_date", mode="before")(_empty_date_to_none)