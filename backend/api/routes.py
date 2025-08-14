from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.services import auth
from backend.utils.security import get_password_hash, get_current_user
from backend.utils.id_generator import generate_case_id, generate_log_id
from backend.db import models
from datetime import datetime, timezone
from typing import List
from fastapi import Path
from sqlalchemy import func



from backend.db.models import (
    User,
    Case,
    ProgressLog,
    ProgressLogHistory,
    CaseStatusChange,
) 


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
    CaseSummaryOut,
    CaseStatusChangeOut,
    UpdateCaseStatusData,
    ContractCreate,
    ContractOut,
    ClientSignContract
)

router = APIRouter()

# --------------------
# API Routes
# --------------------

@router.post("/register")
def register_user(data: RegisterData, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

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

    case_id = generate_case_id(db, current_user.id, data.client_id)

    # Create the case with pending status
    case = Case(
        id=case_id,
        title=data.title,
        lawyer_id=current_user.id,
        client_id=data.client_id,
        status="pending"
    )
    db.add(case)
    db.flush()  # get case.id before commit

    # Create the contract automatically
    contract = models.CaseContract(
        case_id=case.id,
        content=data.contract_content,
        lawyer_signed=True,
        lawyer_signature=data.lawyer_signature
    )
    db.add(contract)

    db.commit()
    db.refresh(case)
    return {"msg": "Case and contract created", "case_id": case.id}


@router.get("/my_cases", response_model=list[CaseOut])
def get_my_cases(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "lawyer":
        cases = db.query(Case).filter(Case.lawyer_id == current_user.id).all()
    else:
        cases = db.query(Case).filter(Case.client_id == current_user.id).all()
    return cases

@router.post("/contract", response_model=ContractOut)
def create_contract(data: ContractCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can create contracts")

    case = db.query(Case).filter(Case.id == data.case_id, Case.lawyer_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized")

    contract = models.CaseContract(
        case_id=data.case_id,
        content=data.content,
        lawyer_signed=True,
        lawyer_signature=data.lawyer_signature
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return contract


@router.post("/contract/{case_id}/sign", response_model=ContractOut)
def sign_contract(case_id: str, data: ClientSignContract, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can sign contracts")

    case = db.query(Case).filter(Case.id == case_id, Case.client_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized")

    contract = db.query(models.CaseContract).filter(models.CaseContract.case_id == case_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    contract.client_signed = True
    contract.client_signature = data.client_signature
    db.commit()

    # Check if both parties have signed
    if contract.lawyer_signed and contract.client_signed:
        case.status = "active"
        db.commit()

    db.refresh(contract)
    return contract


@router.get("/contract/{case_id}", response_model=ContractOut)
def get_contract_by_case(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    contract = db.query(models.CaseContract).filter(models.CaseContract.case_id == case_id).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    case = db.query(models.Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.id not in [case.lawyer_id, case.client_id]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    return contract





@router.put("/update_case_status/{case_id}")
def update_case_status(
    case_id: str,
    data: UpdateCaseStatusData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.role != "lawyer" or case.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Determine new status
    if data.status == "other":
        if not data.custom_status:
            raise HTTPException(status_code=400, detail="Custom status required for 'other'")
        new_status = data.custom_status.lower().replace(" ", "_")
    else:
        new_status = data.status

    # Log status change
    change = CaseStatusChange(
        case_id=case.id,
        old_status=case.status,
        new_status=new_status,
        changed_by=current_user.id,
        reason=data.reason.strip() if data.reason and data.reason.strip() != "string" else "Updated by lawyer"

    )
    db.add(change)

    # Update case
    case.status = new_status
    db.commit()

    return {"msg": f"Case status updated to '{case.status}'"}



@router.get("/case_status_history/{case_id}", response_model=List[CaseStatusChangeOut])
def get_case_status_history(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.role not in ["lawyer", "client"] or \
       (current_user.role == "lawyer" and case.lawyer_id != current_user.id) or \
       (current_user.role == "client" and case.client_id != current_user.id):
        raise HTTPException(status_code=403, detail="Unauthorized")

    changes = db.query(CaseStatusChange).filter(CaseStatusChange.case_id == case_id).order_by(CaseStatusChange.changed_at.desc()).all()
    return changes


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

    log_id = generate_log_id(db, data.case_id)
    log = ProgressLog(
        id=log_id,
        case_id=data.case_id,
        lawyer_id=current_user.id,
        description=data.description,
        time_spent=data.time_spent,
        timestamp=datetime.now(timezone.utc)
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
def get_case_logs(case_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Ensure user is involved in the case
    case = db.query(Case).filter(Case.id == case_id).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.role == "lawyer" and case.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized: not your case")

    if current_user.role == "client" and case.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized: not your case")

    logs = db.query(ProgressLog).filter(ProgressLog.case_id == case_id).all()
    return [ProgressLogOut.model_validate(log) for log in logs]


@router.put("/edit_log/{log_id}")
def edit_progress_log(
    data: EditProgressLogData,
    log_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(ProgressLog).filter(ProgressLog.id == log_id).first()

    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    if current_user.role != "lawyer" or log.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to edit this log")

    # Insert this block *before* modifying the log
    history = ProgressLogHistory(
        log_id=log.id,
        old_description=log.description,
        old_time_spent=log.time_spent,
        edited_at=datetime.now(timezone.utc),
        edited_by=current_user.id
    )
    db.add(history)

    # Now update the original log
    log.description = data.description
    log.time_spent = data.time_spent
    log.is_edited = True

    db.commit()
    db.refresh(log)

    # Adjust case summary after log edit
    summary = db.query(models.CaseSummary).filter(models.CaseSummary.case_id == log.case_id).first()
    if summary:
        time_diff = data.time_spent - history.old_time_spent
        summary.total_time_spent += time_diff
        db.commit()

    return {"msg": "Log updated", "log_id": log.id}

@router.get("/log_history/{log_id}", response_model=List[ProgressLogHistoryOut])
def get_log_history(
    log_id: str,
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
    case_id: str,
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

    total_logs = db.query(ProgressLog).filter(ProgressLog.case_id == case_id).count()
    total_time_spent = db.query(func.sum(ProgressLog.time_spent)).filter(ProgressLog.case_id == case_id).scalar() or 0
    return CaseSummaryOut(
        case_id=case.id,
        title=case.title,
        status=case.status,
        created_at=case.created_at.isoformat(),
        lawyer_email=case.lawyer.email,
        client_email=case.client.email,
        total_logs=total_logs,
        total_time_spent=total_time_spent
    )
