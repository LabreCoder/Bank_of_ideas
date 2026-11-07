from typing import List
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from models.planning import Planning, PlanningChecklistItem
from models.idea import Idea
from schemas.planning import PlanningResponse
from services.planning_service import _get_or_404, _serialize
from schemas.checklist import ChecklistItemUpdate
from datetime import date

def _ordered_items(planning: Planning) -> List[PlanningChecklistItem]:
    return sorted(planning.checklist_items, key=lambda i: (i.position, i.id or 0))


def _renumber(items: List[PlanningChecklistItem]) -> None:
    # Posições sempre sequenciais (0..n-1): evita duplicidade depois de exclusões.
    for index, item in enumerate(items):
        item.position = index


def add_checklist_item(
    db: Session,
    planning_id: int,
    description: str,
    due_date: Optional[date] = None,
    position: Optional[int] = None,
) -> PlanningResponse:
    """
    Sem `position`: o item vai para o fim. Com `position`: é inserido nesse
    índice (limitado a 0..n) e os demais são deslocados.
    """
    planning = _get_or_404(db, planning_id)
    items = _ordered_items(planning)
    index = len(items) if position is None else max(0, min(position, len(items)))

    item = PlanningChecklistItem(description=description, due_date=due_date)
    items.insert(index, item)
    _renumber(items)
    planning.checklist_items.append(item)

    db.commit()
    db.refresh(planning)
    return _serialize(planning)


def toggle_checklist_item(
    db: Session, planning_id: int, item_id: int
) -> PlanningResponse:
    item = (
        db.query(PlanningChecklistItem)
        .filter(
            PlanningChecklistItem.id == item_id,
            PlanningChecklistItem.planning_id == planning_id,
        )
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    item.is_done = not item.is_done
    db.commit()
    planning = _get_or_404(db, planning_id)
    return _serialize(planning)


def update_checklist_item(
    db: Session, planning_id: int, item_id: int, payload: ChecklistItemUpdate
) -> PlanningResponse:
    planning = _get_or_404(db, planning_id)
    item = (
        db.query(PlanningChecklistItem)
        .filter(
            PlanningChecklistItem.id == item_id,
            PlanningChecklistItem.planning_id == planning_id,
        )
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Checklist item not found")

    if payload.description is not None:
        item.description = payload.description

    if "due_date" in payload.model_fields_set:
        item.due_date = payload.due_date
    if payload.is_done is not None:
        item.is_done = payload.is_done

    if payload.position is not None:
        item.position = payload.position

    db.commit()
    return _serialize(planning)


def delete_checklist_item(db: Session, planning_id: int, item_id: int) -> PlanningResponse:
    item = (
        db.query(PlanningChecklistItem)
        .filter(
            PlanningChecklistItem.id == item_id,
            PlanningChecklistItem.planning_id == planning_id,
        )
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    planning = _get_or_404(db, planning_id)
    remaining = [i for i in _ordered_items(planning) if i.id != item.id]
    planning.checklist_items.remove(item)  # delete-orphan apaga a linha
    _renumber(remaining)
    db.commit()
    planning = _get_or_404(db, planning_id)
    return _serialize(planning)