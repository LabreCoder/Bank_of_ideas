# Cria os caminhos de URL (endpoints) que o frontend vai acessar para gerenciar plannings e checklists.
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import get_db
from schemas.planning import PlanningCreate, PlanningUpdate, PlanningResponse
from schemas.checklist import ChecklistItemCreate, ChecklistItemUpdate
from services import planning_service

router = APIRouter(prefix="/planning", tags=["Planning"])


@router.get("/plannings", response_model=List[PlanningResponse])
def list_planning(db: Session = Depends(get_db)):
    return planning_service.list_plannings(db)


@router.get("/{planning_id}", response_model=PlanningResponse)
def get_planning_info(planning_id: int, db: Session = Depends(get_db)):
    return planning_service.get_planning(db, planning_id)


@router.post("/", response_model=PlanningResponse, status_code=status.HTTP_201_CREATED)
def create_planning(payload: PlanningCreate, db: Session = Depends(get_db)):
    return planning_service.create_planning(db, payload)


@router.put("/{planning_id}", response_model=PlanningResponse)
def update_planning_info(
    planning_id: int, payload: PlanningUpdate, db: Session = Depends(get_db)
):
    return planning_service.update_planning(db, planning_id, payload)


@router.delete("/{planning_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_planning(planning_id: int, db: Session = Depends(get_db)):
    planning_service.delete_planning(db, planning_id)
