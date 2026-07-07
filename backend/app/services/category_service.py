from typing import List
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.category import Category
from schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse


def list_categories(db: Session) -> List[CategoryResponse]:
    categories = db.query(Category).order_by(Category.id).all()
    return [CategoryResponse.model_validate(c) for c in categories]


def get_category(db: Session, category_id: int) -> CategoryResponse:
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    return CategoryResponse.model_validate(category)


def create_category(db: Session, payload: CategoryCreate) -> CategoryResponse:
    category = Category(name=payload.name, description=payload.description)
    db.add(category)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create category",
        ) from e
    db.refresh(category)
    return CategoryResponse.model_validate(category)


def update_category(
    db: Session, category_id: int, payload: CategoryUpdate
) -> CategoryResponse:
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )

    # exclude_unset=True: only fields the client actually sent get overwritten,
    # same pattern used in idea_services.update_idea.
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return CategoryResponse.model_validate(category)


def delete_category(db: Session, category_id: int) -> None:
    category = db.query(Category).filter(Category.id == category_id).first()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    try:
        db.delete(category)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        # Happens if some idea still points at this category via FK.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete category: it is still linked to one or more ideas",
        ) from e