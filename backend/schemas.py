from pydantic import BaseModel

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

class UserOut(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True

class CaseOut(BaseModel):
    id: int
    title: str
    status: str
    lawyer_id: int
    client_id: int

    class Config:
        from_attributes = True

class ProgressLogData(BaseModel):
    case_id: int
    description: str
    time_spent: int

class ProgressLogOut(BaseModel):
    id: int
    case_id: int
    lawyer_id: int
    description: str
    time_spent: int
    timestamp: str
    is_edited: bool

    class Config:
        from_attributes = True

class EditProgressLogData(BaseModel):
    description: str
    time_spent: int

class ProgressLogHistoryOut(BaseModel):
    id: int
    log_id: int
    old_description: str
    old_time_spent: int
    edited_at: str
    edited_by: int

    class Config:
        from_attributes = True

class CaseSummaryOut(BaseModel):
    case_id: int
    total_logs: int
    total_time_spent: int

    class Config:
        from_attributes = True
