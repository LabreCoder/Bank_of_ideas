# SQLAlchemy ORM models for Planning.
# NOTE: only the model is being introduced in this step, so `Idea.planning`
# resolves correctly. The services/routes for Planning itself come in the
# next step of our plan.
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, ForeignKey, text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base


class PlanningChecklistItem(Base):
    __tablename__ = "checklist"

    id = Column(Integer, primary_key=True)
    # X02: ON DELETE CASCADE como no schema.sql (o ORM também apaga via delete-orphan).
    planning_id = Column(Integer, ForeignKey("planning.id", ondelete="CASCADE"), nullable=False)
    description = Column(String, nullable=False)
    due_date = Column(Date, nullable=True)
    is_done = Column(Boolean, nullable=False, default=False, server_default=text("false"))
    position = Column(Integer, nullable=False, default=0, server_default=text("0"))

    planning = relationship("Planning", back_populates="checklist_items")
