from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.db.database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)

class Case(Base):
    __tablename__ = 'cases'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    lawyer_id = Column(Integer, ForeignKey("users.id"))
    client_id = Column(Integer)
    status = Column(String, default="pending")
