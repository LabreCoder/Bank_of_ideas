# Cria os caminhos de URL (endpoints) que o frontend vai acessar para enviar ou pedir dados.
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import get_db
from schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from services import category_service

router = APIRouter(prefix="/category", tags=["Category"])


@router.get("/", response_model=List[CategoryResponse])
def list_category(db: Session = Depends(get_db)):
    return category_service.list_categories(db)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category_info(category_id: int, db: Session = Depends(get_db)):
    return category_service.get_category(db, category_id)


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    return category_service.create_category(db, payload)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category_info(
    category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)
):
    return category_service.update_category(db, category_id, payload)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(category_id: int, db: Session = Depends(get_db)):
    category_service.delete_category(db, category_id)