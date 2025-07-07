from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.services import auth
from backend.utils.security import get_password_hash, get_current_user
from backend.db import models
from backend.db.models import User, Case
from backend.schemas import RegisterData, LoginData, UserOut, CaseData, CaseOut
from datetime import datetime
from backend.schemas import CaseOut, ProgressLogData
from backend.db.models import ProgressLog
from typing import List
from pydantic import BaseModel
from fastapi import Path

router = APIRouter()

# --------------------
# API Routes
# --------------------

@router.post("/register")
def register_user(data: RegisterData, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        return {"error": "User already exists"}

    hashed_password = get_password_hash(data.password)
    user = models.User(email=data.email, password=hashed_password, role=data.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"msg": "User created", "user_id": user.id}

@router.post("/login")
def login_user(data: LoginData, db: Session = Depends(get_db)):
    return auth.login_user(db, data.email, data.password)

@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/create_case")
def create_case(data: CaseData, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can create cases")

    case = Case(title=data.title, lawyer_id=current_user.id, client_id=data.client_id)
    db.add(case)
    db.commit()
    db.refresh(case)
    return {"msg": "Case created", "case_id": case.id}

@router.get("/my_cases", response_model=list[CaseOut])
def get_my_cases(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "lawyer":
        cases = db.query(Case).filter(Case.lawyer_id == current_user.id).all()
    else:
        cases = db.query(Case).filter(Case.client_id == current_user.id).all()
    return cases

@router.post("/log_progress")
def log_progress(
    data: ProgressLogData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can log progress")

    # Optional: Check if the lawyer is actually assigned to the case
    case = db.query(Case).filter(Case.id == data.case_id, Case.lawyer_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized")

    log = ProgressLog(
        case_id=data.case_id,
        lawyer_id=current_user.id,
        description=data.description,
        time_spent=data.time_spent,
        timestamp=datetime.utcnow().isoformat()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"msg": "Progress logged", "log_id": log.id}

class ProgressLogOut(BaseModel):
    id: int
    description: str
    time_spent: int
    timestamp: str

    class Config:
        orm_mode = True

@router.get("/case_logs/{case_id}", response_model=List[ProgressLogOut])
def get_case_logs(case_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Ensure user is involved in the case
    case = db.query(Case).filter(Case.id == case_id).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.role == "lawyer" and case.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized: not your case")

    if current_user.role == "client" and case.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized: not your case")

    logs = db.query(ProgressLog).filter(ProgressLog.case_id == case_id).all()
    return logs

@router.put("/edit_log/{log_id}")
def edit_progress_log(
    log_id: int = Path(...),
    data: EditProgressLogData = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(ProgressLog).filter(ProgressLog.id == log_id).first()

    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    if current_user.role != "lawyer" or log.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to edit this log")

    log.description = data.description
    log.time_spent = data.time_spent
    log.is_edited = True
    db.commit()
    db.refresh(log)

    return {"msg": "Log updated", "log_id": log.id}
