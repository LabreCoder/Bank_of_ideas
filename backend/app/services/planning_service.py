from typing import List
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from models.planning import Planning, PlanningChecklistItem
from models.idea import Idea
from schemas.planning import PlanningCreate, PlanningUpdate, PlanningResponse, ChecklistItemUpdate


def _serialize(planning: Planning) -> PlanningResponse:
    # relationship não garante ordem; ordena por `position` na serialização
    # em vez de mexer no model que você já tinha definido.
    planning.checklist_items.sort(key=lambda item: item.position)
    return PlanningResponse.model_validate(planning)


def _get_or_404(db: Session, planning_id: int) -> Planning:
    planning = (
        db.query(Planning)
        .options(joinedload(Planning.idea), joinedload(Planning.checklist_items))
        .filter(Planning.id == planning_id)
        .first()
    )
    if planning is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Planning not found"
        )
    return planning


def list_plannings(db: Session) -> List[PlanningResponse]:
    plannings = (
        db.query(Planning)
        .options(joinedload(Planning.idea), joinedload(Planning.checklist_items))
        .order_by(Planning.created_at.desc())
        .all()
    )
    return [_serialize(p) for p in plannings]


def get_planning(db: Session, planning_id: int) -> PlanningResponse:
    return _serialize(_get_or_404(db, planning_id))


def create_planning(db: Session, payload: PlanningCreate) -> PlanningResponse:
    idea = db.query(Idea).filter(Idea.id == payload.idea_id).first()
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")

    planning = Planning(
        idea_id=payload.idea_id,
        details=payload.details,
        start_date=payload.start_date,
        due_date=payload.due_date,
        status=payload.status.value,
    )
    for i, description in enumerate(payload.checklist_items):
        planning.checklist_items.append(
            PlanningChecklistItem(description=description, position=i)
        )

    db.add(planning)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        # Dispara quando idea_id já tem um planning (UNIQUE constraint).
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This idea already has a planning. Only one planning per idea is allowed.",
        ) from e

    db.refresh(planning)
    return _serialize(planning)


def update_planning(
    db: Session, planning_id: int, payload: PlanningUpdate
) -> PlanningResponse:
    planning = _get_or_404(db, planning_id)
    updates = payload.model_dump(exclude_unset=True)
    if "status" in updates and updates["status"] is not None:
        updates["status"] = updates["status"].value if hasattr(updates["status"], "value") else updates["status"]
    for field, value in updates.items():
        setattr(planning, field, value)
    db.commit()
    db.refresh(planning)
    return _serialize(planning)


def delete_planning(db: Session, planning_id: int) -> None:
    planning = _get_or_404(db, planning_id)
    db.delete(planning)  # cascade="all, delete-orphan" cuida do checklist
    db.commit()


# ---------- Checklist ----------

def add_checklist_item(
    db: Session, planning_id: int, description: str
) -> PlanningResponse:
    planning = _get_or_404(db, planning_id)
    next_position = len(planning.checklist_items)
    item = PlanningChecklistItem(
        planning_id=planning_id, description=description, position=next_position
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