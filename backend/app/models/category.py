# SQLAlchemy ORM model — maps directly to the "category" table.
from sqlalchemy import Column, Integer, String
from database.connection import Base


class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String(200), nullable=True)