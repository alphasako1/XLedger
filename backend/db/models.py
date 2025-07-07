from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.db.database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)

    # Relationships
    cases_as_lawyer = relationship("Case", back_populates="lawyer", foreign_keys='Case.lawyer_id')
    cases_as_client = relationship("Case", back_populates="client", foreign_keys='Case.client_id')


class Case(Base):
    __tablename__ = 'cases'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    status = Column(String, default="pending")

    lawyer_id = Column(Integer, ForeignKey("users.id"))
    client_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    lawyer = relationship("User", back_populates="cases_as_lawyer", foreign_keys=[lawyer_id])
    client = relationship("User", back_populates="cases_as_client", foreign_keys=[client_id])
    
    logs = relationship("ProgressLog", back_populates="case")


class ProgressLog(Base):
    __tablename__ = 'progress_logs'

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    lawyer_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    time_spent = Column(Integer)  # minutes
    timestamp = Column(String)
    is_edited = Column(Boolean, default=False)

    case = relationship("Case", back_populates="logs")
    lawyer = relationship("User")
