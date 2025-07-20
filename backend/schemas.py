from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RegisterData(BaseModel):
    email: str
    password: str
    role: str

class LoginData(BaseModel):
    email: str
    password: str

class CaseData(BaseModel):
    title: str
    client_id: int
    contract_content: str
    lawyer_signature: str

class UserOut(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True

class CaseOut(BaseModel):
    id: str
    title: str
    status: str
    lawyer_id: int
    client_id: int

    class Config:
        from_attributes = True

class ContractCreate(BaseModel):
    case_id: str
    content: str
    lawyer_signature: str

class ClientSignContract(BaseModel):
    client_signature: str

class ContractOut(BaseModel):
    id: int
    case_id: str
    content: str
    lawyer_signed: bool
    client_signed: bool
    lawyer_signature: Optional[str]
    client_signature: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProgressLogData(BaseModel):
    case_id: str
    description: str
    time_spent: int

class ProgressLogOut(BaseModel):
    id: str
    case_id: str
    lawyer_id: int
    description: str
    time_spent: int
    timestamp: datetime
    is_edited: bool

    class Config:
        from_attributes = True

class EditProgressLogData(BaseModel):
    description: str
    time_spent: int

class ProgressLogHistoryOut(BaseModel):
    id: int
    log_id: str
    old_description: str
    old_time_spent: int
    edited_at: datetime
    edited_by: int

    class Config:
        from_attributes = True

class CaseSummaryOut(BaseModel):
    case_id: str
    title: str
    status: str
    created_at: datetime
    lawyer_email: str
    client_email: str
    total_logs: int
    total_time_spent: int

    class Config:
        from_attributes = True

from typing import Optional
from enum import Enum

class CaseStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    on_hold = "on_hold"
    awaiting_client = "awaiting_client"
    completed = "completed"
    archived = "archived"
    cancelled = "cancelled"
    disputed = "disputed"
    other = "other"

class UpdateCaseStatusData(BaseModel):
    status: CaseStatus
    custom_status: Optional[str] = None
    reason: Optional[str] = None

class CaseStatusChangeOut(BaseModel):
    case_id: str
    old_status: str
    new_status: str
    changed_by: int
    changed_at: datetime
    reason: Optional[str] = None

    class Config:
        from_attributes = True
