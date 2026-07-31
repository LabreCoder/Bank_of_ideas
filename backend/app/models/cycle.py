from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base

# Association Table for Many-to-Many relationship between Cycle and Planning
cycle_planning = Table(
    "cycle_planning",
    Base.metadata,
    Column("cycle_id", Integer, ForeignKey("cycle.id", ondelete="CASCADE"), primary_key=True),
    Column("planning_id", Integer, ForeignKey("planning.id", ondelete="CASCADE"), primary_key=True),
)

class Cycle(Base):
    __tablename__ = "cycle"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)  # Optional due_date
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    plannings = relationship("Planning", secondary=cycle_planning, backref="cycles")