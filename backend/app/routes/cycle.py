from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import get_db
from schemas.cycle import (
    CycleCreate,
    CycleUpdate,
    CycleDueDateUpdate,
    CyclePlanningBind,
    CycleResponse,
)
from services import cycle_service

router = APIRouter(prefix="/cycle", tags=["Cycle"])

@router.post("/", response_model=CycleResponse, status_code=status.HTTP_201_CREATED)
def create_cycle(payload: CycleCreate, db: Session = Depends(get_db)):
    return cycle_service.create_cycle(db, payload)

@router.get("/", response_model=List[CycleResponse])
def list_cycles(db: Session = Depends(get_db)):
    return cycle_service.list_cycles(db)

@router.get("/{cycle_id}", response_model=CycleResponse)
def get_cycle(cycle_id: int, db: Session = Depends(get_db)):
    return cycle_service.get_cycle(db, cycle_id)

@router.put("/{cycle_id}", response_model=CycleResponse)
def update_cycle(cycle_id: int, payload: CycleUpdate, db: Session = Depends(get_db)):
    return cycle_service.update_cycle(db, cycle_id, payload)

@router.patch("/{cycle_id}/due-date", response_model=CycleResponse)
def update_cycle_due_date(
    cycle_id: int, payload: CycleDueDateUpdate, db: Session = Depends(get_db)
):
    return cycle_service.update_cycle_due_date(db, cycle_id, payload)

@router.post("/{cycle_id}/bind", response_model=CycleResponse)
def bind_planning(
    cycle_id: int, payload: CyclePlanningBind, db: Session = Depends(get_db)
):
    return cycle_service.bind_planning_to_cycle(db, cycle_id, payload)

@router.delete("/{cycle_id}/unbind/{planning_id}", response_model=CycleResponse)
def unbind_planning(cycle_id: int, planning_id: int, db: Session = Depends(get_db)):
    return cycle_service.unbind_planning_from_cycle(db, cycle_id, planning_id)

@router.delete("/{cycle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cycle(cycle_id: int, db: Session = Depends(get_db)):
    cycle_service.delete_cycle(db, cycle_id)