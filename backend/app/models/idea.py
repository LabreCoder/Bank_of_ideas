# SQLAlchemy ORM model — maps directly to the "idea" table.
#
# NOTE: this replaces the old plain-Python `Idea` class. Field validation
# (like the old VALID_STATUS check) now belongs in the Pydantic schemas
# (see schemas/idea.py), since that's what FastAPI actually uses to
# validate incoming requests. This class's only job is persistence.
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base


class Idea(Base):
    __tablename__ = "idea"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String(200), nullable=True)
    category_id = Column(Integer, ForeignKey("category.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("owner.id"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Simplified for now: there's no authentication system yet, so this
    # just mirrors owner_id at creation time. Once auth exists, point
    # this at a real "logged in user" instead.
    created_by = Column(Integer, ForeignKey("owner.id"), nullable=True)

    # relationships give convenient Python-side access, e.g. idea.category.name
    category = relationship("Category")
    owner = relationship("Owner", foreign_keys=[owner_id])

    # uselist=False => at most one Planning row per idea (see schema.sql UNIQUE
    # constraint). This is what lets us derive "Free" vs "In Planning"
    # without storing that status anywhere.
    planning = relationship("Planning", uselist=False, back_populates="idea")
