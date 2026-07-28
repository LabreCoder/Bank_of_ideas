# Cria os caminhos de URL (endpoints) que o frontend vai acessar para gerenciar plannings e checklists.
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import get_db
from schemas.planning import PlanningResponse
from schemas.checklist import ChecklistItemCreate, ChecklistItemUpdate
from services import checklist_service

router = APIRouter(prefix="/planning", tags=["Planning"])


@router.post("/{planning_id}/checklist", response_model=PlanningResponse, status_code=status.HTTP_201_CREATED)
def add_checklist_item(
    planning_id: int, payload: ChecklistItemCreate, db: Session = Depends(get_db)
):
    return checklist_service.add_checklist_item(db, planning_id, description=payload.description, due_date=payload.due_date)

@router.put("/{planning_id}/checklist/{item_id}", response_model=PlanningResponse)
def update_checklist_item(
    planning_id: int, item_id: int, payload: ChecklistItemUpdate, db: Session = Depends(get_db)
):
    return checklist_service.update_checklist_item(db, planning_id, item_id, payload)

@router.patch("/{planning_id}/checklist/{item_id}/toggle", response_model=PlanningResponse)
def toggle_checklist_item(planning_id: int, item_id: int, db: Session = Depends(get_db)):
    return checklist_service.toggle_checklist_item(db, planning_id, item_id)


@router.delete("/{planning_id}/checklist/{item_id}", response_model=PlanningResponse)
def delete_checklist_item(planning_id: int, item_id: int, db: Session = Depends(get_db)):
    return checklist_service.delete_checklist_item(db, planning_id, item_id)