from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.db.database import Base
from sqlalchemy import DateTime
from datetime import datetime

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

class EditHistory(Base):
    __tablename__ = 'edit_history'

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("progress_logs.id"))
    old_description = Column(String)
    old_time_spent = Column(Integer)
    edited_at = Column(DateTime, default=datetime.utcnow)

    log = relationship("ProgressLog", backref="edit_history")

class ProgressLogHistory(Base):
    __tablename__ = 'progress_log_history'

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("progress_logs.id"))
    old_description = Column(String)
    old_time_spent = Column(Integer)
    edited_at = Column(String)
    edited_by = Column(Integer, ForeignKey("users.id"))

    log = relationship("ProgressLog")
    editor = relationship("User")

class CaseSummary(Base):
    __tablename__ = 'case_summaries'

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), unique=True)
    summary_text = Column(String)
    total_logs = Column(Integer, default=0)
    total_time_spent = Column(Integer, default=0)

    case = relationship("Case", backref="summary")

