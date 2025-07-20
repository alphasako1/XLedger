from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.db.database import Base
from sqlalchemy import DateTime
from datetime import datetime, timezone

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    is_verified = Column(Boolean, default=False)


    # Relationships
    cases_as_lawyer = relationship("Case", back_populates="lawyer", foreign_keys='Case.lawyer_id')
    cases_as_client = relationship("Case", back_populates="client", foreign_keys='Case.client_id')


class Case(Base):
    __tablename__ = 'cases'

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))  # 👈 Add this line

    lawyer_id = Column(Integer, ForeignKey("users.id"))
    client_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    lawyer = relationship("User", back_populates="cases_as_lawyer", foreign_keys=[lawyer_id])
    client = relationship("User", back_populates="cases_as_client", foreign_keys=[client_id])
    
    logs = relationship("ProgressLog", back_populates="case")

class CaseContract(Base):
    __tablename__ = "case_contracts"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"), unique=True)
    content = Column(String)  # Markdown or plain text
    lawyer_signed = Column(Boolean, default=False)
    client_signed = Column(Boolean, default=False)
    lawyer_signature = Column(String, nullable=True)
    client_signature = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=datetime.now)

    case = relationship("Case", backref="contract")



class ProgressLog(Base):
    __tablename__ = 'progress_logs'

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"))
    lawyer_id = Column(Integer, ForeignKey("users.id"))
    description = Column(String)
    time_spent = Column(Integer)  # minutes
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_edited = Column(Boolean, default=False)

    case = relationship("Case", back_populates="logs")
    lawyer = relationship("User")


class ProgressLogHistory(Base):
    __tablename__ = 'progress_log_history'

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(String, ForeignKey("progress_logs.id"))
    old_description = Column(String)
    old_time_spent = Column(Integer)
    edited_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    edited_by = Column(Integer, ForeignKey("users.id"))

    log = relationship("ProgressLog")
    editor = relationship("User")

class CaseSummary(Base):
    __tablename__ = 'case_summaries'

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"), unique=True)
    summary_text = Column(String)
    total_logs = Column(Integer, default=0)
    total_time_spent = Column(Integer, default=0)

    case = relationship("Case", backref="summary")

class CaseStatusChange(Base):
    __tablename__ = "case_status_changes"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"))
    old_status = Column(String)
    new_status = Column(String)
    changed_by = Column(Integer, ForeignKey("users.id"))
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reason = Column(String, nullable=True)

    case = relationship("Case", backref="status_changes")
    user = relationship("User")
