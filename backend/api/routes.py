from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.services import auth
from backend.utils.security import get_password_hash, get_current_user
from backend.db import models
from backend.db.models import User, Case
from datetime import datetime
from backend.db.models import ProgressLog
from typing import List
from pydantic import BaseModel
from fastapi import Path
from backend.db.models import ProgressLogHistory  # 👈 add this import


from backend.schemas import (
    RegisterData,
    LoginData,
    UserOut,
    CaseData,
    CaseOut,
    ProgressLogData,
    ProgressLogOut,
    EditProgressLogData,
    ProgressLogHistoryOut,
    CaseSummaryOut
)

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
    
    summary = db.query(models.CaseSummary).filter(models.CaseSummary.case_id == data.case_id).first()
    if summary:
        summary.total_logs += 1
        summary.total_time_spent += data.time_spent

    else:
        summary = models.CaseSummary(
            case_id=data.case_id,
            summary_text="",
            total_logs=1,
            total_time_spent=data.time_spent
        )
    db.add(summary)
    db.commit()

    return {"msg": "Progress logged", "log_id": log.id}


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

    # ✅ Insert this block *before* modifying the log
    history = ProgressLogHistory(
        log_id=log.id,
        old_description=log.description,
        old_time_spent=log.time_spent,
        edited_at=datetime.utcnow().isoformat(),
        edited_by=current_user.id
    )
    db.add(history)

    # ✅ Now update the original log
    log.description = data.description
    log.time_spent = data.time_spent
    log.is_edited = True

    db.commit()
    db.refresh(log)

    # ✅ Adjust case summary after log edit
    summary = db.query(models.CaseSummary).filter(models.CaseSummary.case_id == log.case_id).first()
    if summary:
        time_diff = data.time_spent - history.old_time_spent
        summary.total_time_spent += time_diff
        db.commit()

    return {"msg": "Log updated", "log_id": log.id}

@router.get("/log_history/{log_id}", response_model=List[ProgressLogHistoryOut])
def get_log_history(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Confirm log exists and user is involved in the case
    log = db.query(ProgressLog).filter(ProgressLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    case = db.query(Case).filter(Case.id == log.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.role == "lawyer" and case.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized: not your log")

    if current_user.role == "client" and case.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized: not your log")

    # Return the history
    history = db.query(ProgressLogHistory).filter(ProgressLogHistory.log_id == log_id).all()
    return history

@router.get("/case_summary/{case_id}", response_model=CaseSummaryOut)
def get_case_summary(
    case_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.role == "lawyer" and case.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized: not your case")
    if current_user.role == "client" and case.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized: not your case")

    summary = db.query(models.CaseSummary).filter(models.CaseSummary.case_id == case_id).first()

    if not summary:
        return {"msg": "No summary found yet", "case_id": case_id}

    return summary

