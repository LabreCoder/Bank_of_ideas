from typing import List, Optional, Tuple
from datetime import date
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from models.cycle import Cycle
from models.planning import Planning
from schemas.planning import PlanningStatus, TERMINAL_PLANNING_STATUSES
from schemas.cycle import (
    CycleCreate,
    CycleUpdate,
    CycleDueDateUpdate,
    CyclePlanningBind,
    PlanningDateValidationResult,
    DateCandidateOrigin,
)


def _compute_cycle_status(plannings: List[Planning]) -> str:
    """
    Derived, never stored — same pattern as Idea.execution_status.
    - "Waiting Start": no plannings bound yet, or all of them are
      still "Not Started".
    - "Finished": every bound planning reached a terminal state
      (Completed or Cancelled).
    - "In Progress": anything in between.
    """
    if not plannings:
        return "Waiting Start"

    statuses = [p.status for p in plannings]

    if all(s in TERMINAL_PLANNING_STATUSES for s in statuses):
        return "Finished"

    if all(s == PlanningStatus.not_started.value for s in statuses):
        return "Waiting Start"

    return "In Progress"


def _compute_progress(plannings: List[Planning]) -> Tuple[int, int, float]:
    """
    completed_plannings, total_plannings, progress_percentage.

    progress_percentage = completed / (total - cancelled) * 100.
    Cancelled plannings are removed from the denominator entirely (they
    neither help nor hurt progress). When the denominator is 0 — no
    plannings bound yet, or every bound planning was cancelled — progress
    is 0.0. Both cases already fall under (or keep) "Waiting Start"-like
    conditions, so 0% is an accurate reading, not a placeholder.
    """
    total = len(plannings)
    completed = sum(1 for p in plannings if p.status == PlanningStatus.completed.value)
    cancelled = sum(1 for p in plannings if p.status == PlanningStatus.cancelled.value)

    denominator = total - cancelled
    progress_percentage = round((completed / denominator) * 100, 1) if denominator > 0 else 0.0

    return completed, total, progress_percentage


def _attach_computed_fields(cycle: Cycle) -> Cycle:
    # Plain Python attributes, not DB columns — Pydantic reads them via
    # from_attributes when building the CycleResponse.
    cycle.status = _compute_cycle_status(cycle.plannings)
    completed, total, progress = _compute_progress(cycle.plannings)
    cycle.completed_plannings = completed
    cycle.total_plannings = total
    cycle.progress_percentage = progress
    return cycle


def _get_cycle_or_404(db: Session, cycle_id: int) -> Cycle:
    cycle = (
        db.query(Cycle)
        .options(
            joinedload(Cycle.plannings).joinedload(Planning.idea),
            joinedload(Cycle.plannings).joinedload(Planning.checklist_items),
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
) -> Tuple[Optional[date], Optional[DateCandidateOrigin]]:
    """
    Fallback algorithm:
    1. Planning has due_date -> returns planning.due_date
    2. Checklist has due_date -> returns highest checklist due_date
    3. Neither -> returns cycle_due_date
    """
    if planning.due_date:
        return planning.due_date, DateCandidateOrigin.planning

    checklist_dates = [item.due_date for item in planning.checklist_items if item.due_date]
    if checklist_dates:
        return max(checklist_dates), DateCandidateOrigin.checklist

    if cycle_due_date:
        return cycle_due_date, DateCandidateOrigin.cycle

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
    return _attach_computed_fields(cycle)


def list_cycles(db: Session) -> List[Cycle]:
    cycles = (
        db.query(Cycle)
        .options(
            joinedload(Cycle.plannings).joinedload(Planning.idea),
            joinedload(Cycle.plannings).joinedload(Planning.checklist_items),
        )
        .order_by(Cycle.created_at.desc())
        .all()
    )
    return [_attach_computed_fields(c) for c in cycles]


def get_cycle(db: Session, cycle_id: int) -> Cycle:
    return _attach_computed_fields(_get_cycle_or_404(db, cycle_id))


def bind_planning_to_cycle(db: Session, cycle_id: int, payload: CyclePlanningBind) -> Cycle:
    cycle = _get_cycle_or_404(db, cycle_id)
    planning = _get_planning_or_404(db, planning_id=payload.planning_id)

    if planning in cycle.plannings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Planning is already bound to this cycle.",
        )

    if not cycle.due_date:
        cycle.plannings.append(planning)
        db.commit()
        db.refresh(cycle)
        return _attach_computed_fields(cycle)

    candidate_date, origin = calculate_planning_candidate_due_date(planning, cycle.due_date)

    if candidate_date:
        if candidate_date < cycle.start_date or candidate_date > cycle.due_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Calculated due_date ({candidate_date}) from origin '{origin.value}' "
                    f"falls outside the cycle range ({cycle.start_date} to {cycle.due_date})."
                ),
            )

        if not planning.due_date and not payload.confirm_candidate_due_date:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": (
                        f"Planning does not have a due_date. Proposed date is "
                        f"{candidate_date} (from {origin.value}). Confirmation required."
                    ),
                    "candidate_due_date": str(candidate_date),
                    "origin": origin.value,
                    "requires_confirmation": True,
                },
            )

        if not planning.due_date and payload.confirm_candidate_due_date:
            planning.due_date = candidate_date

    cycle.plannings.append(planning)
    db.commit()
    db.refresh(cycle)
    return _attach_computed_fields(cycle)


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
    return _attach_computed_fields(cycle)


def update_cycle_due_date(db: Session, cycle_id: int, payload: CycleDueDateUpdate) -> Cycle:
    cycle = _get_cycle_or_404(db, cycle_id)
    new_due_date = payload.due_date

    if new_due_date and new_due_date < cycle.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cycle due_date cannot be earlier than start_date.",
        )

    if new_due_date:
        conflicts = []
        for planning in cycle.plannings:
            if not planning.due_date:
                continue
            if planning.due_date < cycle.start_date or planning.due_date > new_due_date:
                conflicts.append(
                    PlanningDateValidationResult(
                        planning_id=planning.id,
                        idea_name=planning.idea.name,
                        candidate_due_date=planning.due_date,
                        origin=DateCandidateOrigin.planning,
                        is_valid=False,
                        requires_confirmation=False,
                        message=(
                            f"Planning due_date ({planning.due_date}) falls outside the "
                            f"new cycle period ({cycle.start_date} to {new_due_date})."
                        ),
                    )
                )

        if conflicts:
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
    return _attach_computed_fields(cycle)


def update_cycle(db: Session, cycle_id: int, payload: CycleUpdate) -> Cycle:
    cycle = _get_cycle_or_404(db, cycle_id)
    updates = payload.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(cycle, field, value)

    db.commit()
    db.refresh(cycle)
    return _attach_computed_fields(cycle)


def delete_cycle(db: Session, cycle_id: int) -> None:
    cycle = _get_cycle_or_404(db, cycle_id)
    db.delete(cycle)
    db.commit()