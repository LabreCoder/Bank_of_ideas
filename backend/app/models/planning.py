# SQLAlchemy ORM models for Planning.
# NOTE: only the model is being introduced in this step, so `Idea.planning`
# resolves correctly. The services/routes for Planning itself come in the
# next step of our plan.
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base


class Planning(Base):
    __tablename__ = "planning"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("idea.id"), nullable=False, unique=True)
    details = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True)
    status = Column(String, nullable=False, default="Não Iniciado")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    idea = relationship("Idea", back_populates="planning")
    checklist_items = relationship(
        "PlanningChecklistItem",
        back_populates="planning",
        cascade="all, delete-orphan",
    )


class PlanningChecklistItem(Base):
    __tablename__ = "planning_checklist_item"

    id = Column(Integer, primary_key=True, index=True)
    planning_id = Column(Integer, ForeignKey("planning.id"), nullable=False)
    description = Column(String, nullable=False)
    is_done = Column(Boolean, nullable=False, default=False)
    position = Column(Integer, nullable=False, default=0)

    planning = relationship("Planning", back_populates="checklist_items")
