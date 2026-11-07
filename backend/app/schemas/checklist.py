from typing import Optional
from datetime import date
from pydantic import BaseModel, Field, field_validator

from schemas._common import INPUT_CONFIG, ORM_CONFIG


def _empty_date_to_none(value):
    # <input type="date"> vazio chega como "" — tratamos como "sem data".
    if isinstance(value, str) and not value.strip():
        return None
    return value


class ChecklistItemCreate(BaseModel):
    model_config = INPUT_CONFIG

    description: str = Field(min_length=1)
    due_date: Optional[date] = None
    position: Optional[int] = None  # se None, o service calcula o próximo

    normalize_due_date = field_validator("due_date", mode="before")(_empty_date_to_none)


class ChecklistItemResponse(BaseModel):
    model_config = ORM_CONFIG

    id: int
    description: str
    due_date: Optional[date] = None
    is_done: bool
    position: int


class ChecklistItemUpdate(BaseModel):
    model_config = INPUT_CONFIG

    id: Optional[int] = None
    # None/omitido = mantém a descrição atual; string vazia ou só espaços = 422.
    description: Optional[str] = Field(default=None, min_length=1)
    due_date: Optional[date] = None
    is_done: Optional[bool] = None
    position: Optional[int] = None

    normalize_due_date = field_validator("due_date", mode="before")(_empty_date_to_none)
