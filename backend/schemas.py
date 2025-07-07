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
        orm_mode = True

class CaseOut(BaseModel):
    id: int
    title: str
    status: str
    lawyer_id: int
    client_id: int

    class Config:
        orm_mode = True

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

    class Config:
        orm_mode = True

class EditProgressLogData(BaseModel):
    description: str
    time_spent: int
