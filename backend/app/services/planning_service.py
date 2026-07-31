from typing import List
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from models.planning import Planning, PlanningChecklistItem
from models.idea import Idea
from schemas.planning import PlanningCreate, PlanningUpdate, PlanningResponse


def _serialize(planning: Planning) -> PlanningResponse:
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

    checklist_payload = updates.pop("checklist_items", None)

    for field, value in updates.items():
        setattr(planning, field, value)

    if checklist_payload is not None:
        existing_items = {item.id: item for item in planning.checklist_items}
        updated_item_ids = set()

        for position, item_data in enumerate(checklist_payload):
            item_id = item_data.get("id")

            if item_id and isinstance(item_id, int) and item_id in existing_items:
                item = existing_items[item_id]
                item.description = item_data.get("description", item.description)
                item.due_date = item_data.get("due_date", item.due_date)
                item.is_done = item_data.get("is_done", item.is_done)
                item.position = position
                updated_item_ids.add(item_id)
            else:
                new_item = PlanningChecklistItem(
                    planning_id=planning.id,
                    description=item_data.get("description", ""),
                    due_date=item_data.get("due_date"),
                    is_done=item_data.get("is_done", False),
                    position=position,
                )
                db.add(new_item)

        for item_id, item in existing_items.items():
            if item_id not in updated_item_ids:
                db.delete(item)

    db.commit()
    db.refresh(planning)
    return _serialize(planning)

def delete_planning(db: Session, planning_id: int) -> None:
    planning = _get_or_404(db, planning_id)
    db.delete(planning)  # cascade="all, delete-orphan" cuida do checklist
    db.commit()