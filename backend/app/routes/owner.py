# Cria os caminhos de URL (endpoints) que o frontend vai acessar para listar e adicionar owners.
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import get_db
from schemas.owner import OwnerCreate, OwnerResponse
from services import owner_service

router = APIRouter(prefix="/owner", tags=["Owner"])


@router.get("/owners", response_model=List[OwnerResponse])
def list_owner(db: Session = Depends(get_db)):
    return owner_service.list_owners(db)


@router.get("/{owner_id}", response_model=OwnerResponse)
def get_owner_info(owner_id: int, db: Session = Depends(get_db)):
    return owner_service.get_owner(db, owner_id)


@router.post("/", response_model=OwnerResponse, status_code=status.HTTP_201_CREATED)
def create_owner(payload: OwnerCreate, db: Session = Depends(get_db)):
    return owner_service.create_owner(db, payload)