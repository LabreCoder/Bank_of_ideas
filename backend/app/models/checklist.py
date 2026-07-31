# SQLAlchemy ORM models for Planning.
# NOTE: only the model is being introduced in this step, so `Idea.planning`
# resolves correctly. The services/routes for Planning itself come in the
# next step of our plan.
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base


class PlanningChecklistItem(Base):
    __tablename__ = "checklist"

    id = Column(Integer, primary_key=True, index=True)
    planning_id = Column(Integer, ForeignKey("planning.id"), nullable=False)
    description = Column(String, nullable=False)
    due_date = Column(Date, nullable=True)
    is_done = Column(Boolean, nullable=False, default=False)
    position = Column(Integer, nullable=False, default=0)

    planning = relationship("Planning", back_populates="checklist_items")
