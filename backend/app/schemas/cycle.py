from typing import List, Optional
from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel, Field, field_validator
from schemas._common import INPUT_CONFIG, ORM_CONFIG, reject_null
from schemas.planning import PlanningResponse


class CycleCreate(BaseModel):
    model_config = INPUT_CONFIG

    name: str = Field(min_length=1)
    description: Optional[str] = None
    start_date: date
    due_date: Optional[date] = None


class CycleUpdate(BaseModel):
    model_config = INPUT_CONFIG

    name: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    start_date: Optional[date] = None

    # name e start_date são NOT NULL no banco: null explícito -> 422.
    _not_null = field_validator("name", "start_date")(reject_null)


class CycleDueDateUpdate(BaseModel):
    due_date: Optional[date] = None


class CyclePlanningBind(BaseModel):
    planning_id: int
    confirm_candidate_due_date: bool = False


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
    # Também derivados. progress_percentage = completed / (total - cancelled),
    # em % (0-100). Quando o denominador é 0 (nenhum planning ainda, ou
    # todos os vinculados foram cancelados), o valor é 0.0 — esses casos
    # sempre caem em status "Waiting Start" ou continuam sem nenhum
    # planning ativo, então 0% é uma leitura correta, não um placeholder.
    completed_plannings: int
    total_plannings: int
    progress_percentage: float
    created_at: datetime
    plannings: List[PlanningResponse] = []

    model_config = ORM_CONFIG