from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError

from models.idea import Idea
from schemas.idea import IdeaCreate, IdeaUpdate, IdeaResponse


def _serialize_idea(idea: Idea) -> IdeaResponse:
    """
    Turns an Idea ORM object into an IdeaResponse, computing
    `execution_status` on the fly.

    "In Planning" whenever a `planning` row points at this idea,
    "Free" otherwise. This is set as a plain Python attribute here
    (not persisted to the DB) purely so Pydantic can read it via
    from_attributes when building the response.
    """
    idea.execution_status = "In Planning" if idea.planning else "Free"
    return IdeaResponse.model_validate(idea)


def list_ideas(db: Session, active: Optional[bool] = None) -> List[IdeaResponse]:
    query = db.query(Idea).options(
        joinedload(Idea.category),
        joinedload(Idea.owner),
        joinedload(Idea.planning),
    )
    if active is not None:
        query = query.filter(Idea.is_active.is_(active))
    ideas = query.order_by(Idea.created_at.desc()).all()
    return [_serialize_idea(idea) for idea in ideas]


def get_idea(db: Session, idea_id: int) -> IdeaResponse:
    idea = (
        db.query(Idea)
        .options(
            joinedload(Idea.category),
            joinedload(Idea.owner),
            joinedload(Idea.planning),
        )
        .filter(Idea.id == idea_id)
        .first()
    )
    if idea is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found")
    return _serialize_idea(idea)


def create_idea(db: Session, payload: IdeaCreate) -> IdeaResponse:
    idea = Idea(
        name=payload.name,
        description=payload.description,
        category_id=payload.category_id,
        owner_id=payload.owner_id,
        # Simplified: no auth yet, so "created_by" mirrors the chosen owner.
        created_by=payload.owner_id,
    )
    db.add(idea)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid category_id or owner_id")
    db.refresh(idea)
    return _serialize_idea(idea)


def update_idea(db: Session, idea_id: int, payload: IdeaUpdate) -> IdeaResponse:
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if idea is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found")

    # exclude_unset=True: only fields the client actually sent get overwritten,
    # so a partial edit can't accidentally wipe out untouched fields.
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(idea, field, value)

    db.commit()
    db.refresh(idea)
    return _serialize_idea(idea)


def toggle_active(db: Session, idea_id: int) -> IdeaResponse:
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if idea is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Idea not found")

    idea.is_active = not idea.is_active
    db.commit()
    db.refresh(idea)
    return _serialize_idea(idea)
