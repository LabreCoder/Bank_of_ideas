from typing import List, Optional
from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel


# Valores permitidos para o status do planning. Ajuste aqui se o fluxo
# de trabalho usar outros nomes — hoje o banco não tem CHECK constraint,
# então essa validação vive só na aplicação.
class PlanningStatus(str, Enum):
    not_started = "Not Started"
    in_development = "In Development"
    under_review = "Under Review"
    completed = "Completed"


# ---------- Checklist items ----------

class ChecklistItemCreate(BaseModel):
    description: str
    position: Optional[int] = None  # se None, o service calcula o próximo


class ChecklistItemResponse(BaseModel):
    id: int
    description: str
    is_done: bool
    position: int

    class Config:
        from_attributes = True


# ---------- Planning ----------

# Usado ao criar um planning a partir de uma ideia já existente.
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


# Resumo leve da ideia vinculada, só o suficiente pra exibir no card
# de planning sem precisar de outra chamada à API.
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