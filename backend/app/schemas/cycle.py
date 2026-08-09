from typing import List, Optional
from datetime import date, datetime
from enum import Enum
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
    # NOTE: "force" was removed on purpose — conflicts between the new
    # due_date and a bound planning's own due_date must be resolved
    # manually (edit the planning's date, or pick a different cycle
    # due_date), never overridden silently.


class CyclePlanningBind(BaseModel):
    planning_id: int
    confirm_candidate_due_date: bool = False  # True once the user accepts the proposed fallback date


# Was a plain `class DateCandidateOrigin(str)` before — that's just a
# namespace of string constants, not an actual type Pydantic can validate
# against. A real Enum (same pattern as PlanningStatus) gets validation
# for free and matches the rest of the codebase's style.
class DateCandidateOrigin(str, Enum):
    planning = "planning"
    checklist = "checklist"
    cycle = "cycle"


class PlanningDateValidationResult(BaseModel):
    planning_id: int
    idea_name: str
    candidate_due_date: Optional[date]
    origin: Optional[DateCandidateOrigin]
    is_valid: bool
    requires_confirmation: bool
    message: str


class CycleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    start_date: date
    due_date: Optional[date] = None
    # Derived, never stored — same philosophy as Idea.execution_status.
    # One of: "Waiting Start", "In Progress", "Finished".
    status: str
    created_at: datetime
    plannings: List[PlanningResponse] = []

    class Config:
        from_attributes = True