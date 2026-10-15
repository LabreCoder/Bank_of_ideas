from typing import List, Optional
from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel, field_validator
from schemas.category import CategoryResponse
from schemas.owner import OwnerResponse
from schemas.checklist import (
    ChecklistItemCreate,
    ChecklistItemResponse,
    ChecklistItemUpdate,
    _empty_date_to_none,
)

class PlanningStatus(str, Enum):
    not_started = "Not Started"
    under_review = "Under Review"
    started = "Started"
    in_development = "In Development"
    completed = "Completed"
    cancelled = "Cancelled"

TERMINAL_PLANNING_STATUSES = {PlanningStatus.completed, PlanningStatus.cancelled}

class PlanningCreate(BaseModel):
    idea_id: int
    details: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    status: PlanningStatus = PlanningStatus.not_started
    checklist_items: List[ChecklistItemCreate] = []

    normalize_dates = field_validator("start_date", "due_date", mode="before")(_empty_date_to_none)


class PlanningUpdate(BaseModel):
    details: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[PlanningStatus] = None
    checklist_items: Optional[List[ChecklistItemUpdate]] = None

    normalize_dates = field_validator("start_date", "due_date", mode="before")(_empty_date_to_none)


class PlanningIdeaSummary(BaseModel):
    id: int
    name: str
    category: Optional[CategoryResponse] = None
    owner: Optional[OwnerResponse] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class PlanningResponse(BaseModel):
    id: int
    idea: PlanningIdeaSummary
    details: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    status: str
    created_at: datetime
    checklist_items: List[ChecklistItemResponse] = []

    class Config:
        from_attributes = True