from typing import List, Optional
from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel, field_validator, model_validator
from schemas._common import ORM_CONFIG, reject_null
from schemas.category import CategoryResponse
from schemas.owner import OwnerResponse
from schemas.checklist import (
    ChecklistItemCreate,
    ChecklistItemResponse,
    ChecklistItemUpdate,
    _empty_date_to_none,
)


def _check_date_order(model):
    # Quando as duas datas vêm no payload. No update, a comparação com o valor
    # já gravado (quando só uma vem) é feita em planning_service.update_planning.
    if model.start_date and model.due_date and model.due_date < model.start_date:
        raise ValueError("due_date cannot be earlier than start_date")
    return model


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
    _date_order = model_validator(mode="after")(_check_date_order)


class PlanningUpdate(BaseModel):
    details: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[PlanningStatus] = None
    checklist_items: Optional[List[ChecklistItemUpdate]] = None

    normalize_dates = field_validator("start_date", "due_date", mode="before")(_empty_date_to_none)
    # status é NOT NULL no banco: null explícito -> 422 (omitir mantém o atual).
    _status_not_null = field_validator("status")(reject_null)
    _date_order = model_validator(mode="after")(_check_date_order)


class PlanningIdeaSummary(BaseModel):
    id: int
    name: str
    category: Optional[CategoryResponse] = None
    owner: Optional[OwnerResponse] = None
    is_active: bool = True

    model_config = ORM_CONFIG


class PlanningResponse(BaseModel):
    id: int
    idea: PlanningIdeaSummary
    details: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    status: str
    created_at: datetime
    checklist_items: List[ChecklistItemResponse] = []

    model_config = ORM_CONFIG
