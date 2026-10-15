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
    for i, item in enumerate(payload.checklist_items):
        planning.checklist_items.append(
            PlanningChecklistItem(
                description=item.description,
                due_date=item.due_date,
                position=item.position if item.position is not None else i,
            )
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
        kept_item_ids = set()
        position = 0

        for item_data in checklist_payload:
            description = (item_data.get("description") or "").strip()
            item_id = item_data.get("id")
            existing = existing_items.get(item_id) if isinstance(item_id, int) else None

            if existing is not None:
                if description:
                    existing.description = description
                if "due_date" in item_data:
                    existing.due_date = item_data["due_date"]
                if item_data.get("is_done") is not None:
                    existing.is_done = item_data["is_done"]
                existing.position = position
                kept_item_ids.add(existing.id)
                position += 1
            elif description:
                # id ausente ou temporário (criado no cliente): item novo.
                planning.checklist_items.append(
                    PlanningChecklistItem(
                        description=description,
                        due_date=item_data.get("due_date"),
                        is_done=bool(item_data.get("is_done", False)),
                        position=position,
                    )
                )
                position += 1

        for item_id, item in existing_items.items():
            if item_id not in kept_item_ids:
                planning.checklist_items.remove(item)  # delete-orphan apaga a linha

    db.commit()
    db.refresh(planning)
    return _serialize(planning)

def delete_planning(db: Session, planning_id: int) -> None:
    planning = _get_or_404(db, planning_id)
    db.delete(planning)  # cascade="all, delete-orphan" cuida do checklist
    db.commit()