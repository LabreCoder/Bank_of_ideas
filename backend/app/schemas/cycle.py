from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel
from schemas.planning import PlanningResponse

class CycleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    due_date: Optional[date] = None

class CycleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None

class CycleDueDateUpdate(BaseModel):
    due_date: Optional[date] = None
    force: bool = False  # Set to True when user confirms resolution

class CyclePlanningBind(BaseModel):
    planning_id: int
    confirm_candidate_due_date: bool = False  # Set to True when confirming calculated fallback date

class DateCandidateOrigin(str):
    CHECKLIST = "checklist"
    CYCLE = "cycle"
    PLANNING = "planning"

class PlanningDateValidationResult(BaseModel):
    planning_id: int
    idea_name: str
    candidate_due_date: Optional[date]
    origin: Optional[str]
    is_valid: bool
    requires_confirmation: bool
    message: str

class CycleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    start_date: date
    due_date: Optional[date] = None
    created_at: datetime
    plannings: List[PlanningResponse] = []

    class Config:
        from_attributes = True