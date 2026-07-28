from typing import List, Optional
from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel


class ChecklistItemCreate(BaseModel):
    description: str
    due_date: Optional[date] = None
    position: Optional[int] = None  # se None, o service calcula o próximo


class ChecklistItemResponse(BaseModel):
    id: int
    description: str
    due_date: Optional[date] = None
    is_done: bool
    position: int

    class Config:
        from_attributes = True
    
    
class ChecklistItemUpdate(BaseModel):
    description: Optional[str] = None
    due_date: Optional[date] = None
    is_done: Optional[bool] = None
    position: Optional[int] = None