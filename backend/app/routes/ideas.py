# Cria os caminhos de URL (endpoints) que o frontend vai acessar para enviar ou pedir dados.
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database.connection import get_db
from schemas.idea import IdeaCreate, IdeaUpdate, IdeaResponse
from services import idea_services

router = APIRouter(prefix="/ideas", tags=["Ideas"])

@router.get("/", response_model=List[IdeaResponse])
def list_ideas(
    active: Optional[bool] = Query(default=None, description="Filter by active status"),
    db: Session = Depends(get_db),
):
    return idea_services.list_ideas(db, active=active)


@router.get("/{idea_id}", response_model=IdeaResponse)
def get_idea(idea_id: int, db: Session = Depends(get_db)):
    return idea_services.get_idea(db, idea_id)


@router.post("/", response_model=IdeaResponse, status_code=201)
def create_idea(payload: IdeaCreate, db: Session = Depends(get_db)):
    return idea_services.create_idea(db, payload)


@router.put("/{idea_id}", response_model=IdeaResponse)
def update_idea(idea_id: int, payload: IdeaUpdate, db: Session = Depends(get_db)):
    return idea_services.update_idea(db, idea_id, payload)


@router.patch("/{idea_id}/toggle-active", response_model=IdeaResponse)
def toggle_idea_active(idea_id: int, db: Session = Depends(get_db)):
    return idea_services.toggle_active(db, idea_id)