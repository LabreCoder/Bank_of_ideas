from typing import List
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.owner import Owner
from schemas.owner import OwnerCreate, OwnerUpdate, OwnerResponse


def list_owners(db: Session) -> List[OwnerResponse]:
    owners = db.query(Owner).order_by(Owner.name).all()
    return [OwnerResponse.model_validate(o) for o in owners]


def create_owner(db: Session, payload: OwnerCreate) -> OwnerResponse:
    owner = Owner(name=payload.name)
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return OwnerResponse.model_validate(owner)


def get_owner(db: Session, owner_id: int) -> OwnerResponse:
    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if owner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Owner not found"
        )
    return OwnerResponse.model_validate(owner)

def update_owner(
    db: Session, owner_id: int, payload: OwnerUpdate
) -> OwnerResponse:
    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if owner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Owner not found"
        )

    # exclude_unset=True: only fields the client actually sent get overwritten,
    # same pattern used in idea_services.update_idea.
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(owner, field, value)

    db.commit()
    db.refresh(owner)
    return OwnerResponse.model_validate(owner)


def delete_owner(db: Session, owner_id: int) -> None:
    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if owner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Owner not found"
        )
    
    try:
        db.delete(owner)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete owner: it is still linked to one or more ideas",
        ) from e