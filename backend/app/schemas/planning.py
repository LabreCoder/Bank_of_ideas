from typing import List, Optional
from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel
from schemas.checklist import ChecklistItemResponse, ChecklistItemUpdate


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
    checklist_items: List[str] = []  # descrições iniciais, opcional


class PlanningUpdate(BaseModel):
    details: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[PlanningStatus] = None
    checklist_items: Optional[List[ChecklistItemUpdate]] = None


class PlanningIdeaSummary(BaseModel):
    id: int
    name: str

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