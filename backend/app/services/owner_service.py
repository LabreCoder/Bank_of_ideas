from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.owner import Owner
from schemas.owner import OwnerCreate, OwnerResponse


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