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

def add_checklist_item(
    db: Session, planning_id: int, description: str, due_date: Optional[date] = None
) -> PlanningResponse:
    planning = _get_or_404(db, planning_id)
    next_position = len(planning.checklist_items)
    item = PlanningChecklistItem(
        planning_id=planning_id, 
        description=description, 
        due_date=due_date, 
        position=next_position
    )
    db.add(item)
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
    db.delete(item)
    db.commit()
    planning = _get_or_404(db, planning_id)
    return _serialize(planning)