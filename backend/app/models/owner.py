# SQLAlchemy ORM model — maps directly to the "owner" table.
from sqlalchemy import Column, Integer, String
from database.connection import Base


class Owner(Base):
    __tablename__ = "owner"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
