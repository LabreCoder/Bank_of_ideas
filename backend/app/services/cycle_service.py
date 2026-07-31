from typing import List, Optional, Tuple
from datetime import date
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from models.cycle import Cycle
from models.planning import Planning
from schemas.cycle import (
    CycleCreate,
    CycleUpdate,
    CycleDueDateUpdate,
    CyclePlanningBind,
    PlanningDateValidationResult,
    DateCandidateOrigin,
)

def _get_cycle_or_404(db: Session, cycle_id: int) -> Cycle:
    cycle = (
        db.query(Cycle)
        .options(
            joinedload(Cycle.plannings)
            .joinedload(Planning.idea),
            joinedload(Cycle.plannings)
            .joinedload(Planning.checklist_items),
        )
        .filter(Cycle.id == cycle_id)
        .first()
    )
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    return cycle

def _get_planning_or_404(db: Session, planning_id: int) -> Planning:
    planning = (
        db.query(Planning)
        .options(joinedload(Planning.idea), joinedload(Planning.checklist_items))
        .filter(Planning.id == planning_id)
        .first()
    )
    if not planning:
        raise HTTPException(status_code=404, detail="Planning not found")
    return planning

def calculate_planning_candidate_due_date(
    planning: Planning, cycle_due_date: Optional[date]
) -> Tuple[Optional[date], Optional[str]]:
    """
    Fallback algorithm:
    1. Planning has due_date -> returns planning.due_date
    2. Checklist has due_date -> returns highest checklist due_date
    3. Neither -> returns cycle_due_date
    """
    if planning.due_date:
        return planning.due_date, DateCandidateOrigin.PLANNING

    checklist_dates = [item.due_date for item in planning.checklist_items if item.due_date]
    if checklist_dates:
        return max(checklist_dates), DateCandidateOrigin.CHECKLIST

    if cycle_due_date:
        return cycle_due_date, DateCandidateOrigin.CYCLE

    return None, None

def create_cycle(db: Session, payload: CycleCreate) -> Cycle:
    if payload.due_date and payload.due_date < payload.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cycle due_date cannot be earlier than start_date.",
        )
    cycle = Cycle(
        name=payload.name,
        description=payload.description,
        start_date=payload.start_date,
        due_date=payload.due_date,
    )
    db.add(cycle)
    db.commit()
    db.refresh(cycle)
    return cycle

def list_cycles(db: Session) -> List[Cycle]:
    return (
        db.query(Cycle)
        .options(
            joinedload(Cycle.plannings).joinedload(Planning.idea),
            joinedload(Cycle.plannings).joinedload(Planning.checklist_items),
        )
        .order_by(Cycle.created_at.desc())
        .all()
    )

def get_cycle(db: Session, cycle_id: int) -> Cycle:
    return _get_cycle_or_404(db, cycle_id)

def bind_planning_to_cycle(
    db: Session, cycle_id: int, payload: CyclePlanningBind
) -> Cycle:
    cycle = _get_cycle_or_404(db, cycle_id)
    planning = _get_planning_or_404(db, planning_id=payload.planning_id)

    if planning in cycle.plannings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Planning is already bound to this cycle.",
        )

    # If Cycle has no due_date yet, bind freely
    if not cycle.due_date:
        cycle.plannings.append(planning)
        db.commit()
        db.refresh(cycle)
        return cycle

    # If Cycle has due_date, execute fallback algorithm
    candidate_date, origin = calculate_planning_candidate_due_date(
        planning, cycle.due_date
    )

    if candidate_date:
        # Check bounds
        if candidate_date < cycle.start_date or candidate_date > cycle.due_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Calculated due_date ({candidate_date}) from origin '{origin}' falls outside the cycle range ({cycle.start_date} to {cycle.due_date}).",
            )

        # If planning had no due_date and candidate comes from checklist/cycle, require confirmation
        if not planning.due_date and not payload.confirm_candidate_due_date:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": f"Planning does not have a due_date. Proposed date is {candidate_date} (from {origin}). Confirmation required.",
                    "candidate_due_date": str(candidate_date),
                    "origin": origin,
                    "requires_confirmation": True,
                },
            )

        # Apply candidate date to planning if confirmed and was missing
        if not planning.due_date and payload.confirm_candidate_due_date:
            planning.due_date = candidate_date

    cycle.plannings.append(planning)
    db.commit()
    db.refresh(cycle)
    return cycle

def unbind_planning_from_cycle(db: Session, cycle_id: int, planning_id: int) -> Cycle:
    cycle = _get_cycle_or_404(db, cycle_id)
    planning = _get_planning_or_404(db, planning_id)

    if planning not in cycle.plannings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planning is not bound to this cycle.",
        )

    cycle.plannings.remove(planning)
    db.commit()
    db.refresh(cycle)
    return cycle

def update_cycle_due_date(
    db: Session, cycle_id: int, payload: CycleDueDateUpdate
) -> Cycle:
    cycle = _get_cycle_or_404(db, cycle_id)
    new_due_date = payload.due_date

    if new_due_date and new_due_date < cycle.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cycle due_date cannot be earlier than start_date.",
        )

    # If setting a due_date when plannings are already bound, validate all bound plannings
    if new_due_date:
        conflicts = []
        for planning in cycle.plannings:
            candidate_date, origin = calculate_planning_candidate_due_date(
                planning, new_due_date
            )

            if candidate_date and (
                candidate_date < cycle.start_date or candidate_date > new_due_date
            ):
                conflicts.append(
                    PlanningDateValidationResult(
                        planning_id=planning.id,
                        idea_name=planning.idea.name,
                        candidate_due_date=candidate_date,
                        origin=origin,
                        is_valid=False,
                        requires_confirmation=False,
                        message=f"Planning due_date ({candidate_date}) falls outside the new cycle period ({cycle.start_date} to {new_due_date}).",
                    )
                )

        if conflicts and not payload.force:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "message": "Updating cycle due_date creates conflicts with bound plannings.",
                    "conflicts": [c.model_dump() for c in conflicts],
                },
            )

    cycle.due_date = new_due_date
    db.commit()
    db.refresh(cycle)
    return cycle

def update_cycle(db: Session, cycle_id: int, payload: CycleUpdate) -> Cycle:
    cycle = _get_cycle_or_404(db, cycle_id)
    updates = payload.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(cycle, field, value)

    db.commit()
    db.refresh(cycle)
    return cycle

def delete_cycle(db: Session, cycle_id: int) -> None:
    cycle = _get_cycle_or_404(db, cycle_id)
    db.delete(cycle)
    db.commit()