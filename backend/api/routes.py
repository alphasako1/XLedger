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
from web3 import Web3
import hashlib

from backend.utils.blockchain import (
    create_case_on_chain,
    add_log_to_case,
    finalize_case_on_chain,
    ensure_blockchain,
    update_case_status_on_chain,
    factory_contract,
    get_case_contract,
    add_log_version_to_case,
    generate_log_string,
    generate_log_hash
)

from backend.db.models import (
    User,
    Case,
    ProgressLog,
    ProgressLogHistory,
    CaseStatusChange,
    CaseAuditAccess
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
    user = models.User(email=data.email, password=hashed_password, role=data.role.value)
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
    ensure_blockchain()  # Ensure blockchain is available
    if current_user.role != "lawyer":
        raise HTTPException(status_code=403, detail="Only lawyers can create cases")

    case_id = generate_case_id(db, current_user.id, data.client_id)

    # Create DB entry only
    case = Case(
        id=case_id,
        title=data.title,
        lawyer_id=current_user.id,
        client_id=data.client_id,
        status="pending",
        on_chain_address=None,
        on_chain_tx=None
    )
    db.add(case)
    db.flush()

    # Add contract
    contract = models.CaseContract(
        case_id=case.id,
        content=data.contract_content,
        lawyer_signed=True,
        lawyer_signature=data.lawyer_signature
    )
    db.add(contract)
    db.commit()
    db.refresh(case)

    return {"msg": "Case created (pending client signature)", "case_id": case.id}



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

@router.get("/contract/{case_id}", response_model=ContractOut)
def get_contract(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find the case
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Ensure user is either the lawyer or client on the case
    if current_user.role == "lawyer" and case.lawyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized: not your case")
    if current_user.role == "client" and case.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized: not your case")

    # Get the contract for this case
    contract = db.query(models.CaseContract).filter(models.CaseContract.case_id == case_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return contract



@router.post("/contract/{case_id}/sign", response_model=ContractOut)
def sign_contract(case_id: str, data: ClientSignContract, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ensure_blockchain()
    if current_user.role != "client":
        raise HTTPException(status_code=403, detail="Only clients can sign contracts")

    case = db.query(Case).filter(Case.id == case_id, Case.client_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized")

    contract = db.query(models.CaseContract).filter(models.CaseContract.case_id == case_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Client signs
    contract.client_signed = True
    contract.client_signature = data.client_signature
    db.commit()

    # Deploy only when both have signed
    if contract.lawyer_signed and contract.client_signed:
        try:
            tx_hash, tx_receipt = create_case_on_chain(case.id, case.lawyer.email, case.client.email)
            case.on_chain_address = factory_contract.functions.getCaseAddress(case.id).call()
            case.on_chain_tx = tx_hash
            case.status = "active"
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Blockchain transaction failed: {str(e)}")

    db.refresh(contract)
    return contract

@router.put("/update_case_status/{case_id}")
def update_case_status(
    case_id: str,
    data: UpdateCaseStatusData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ensure_blockchain()
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

    # --- Blockchain update ---
    from web3 import Web3
    from datetime import datetime, timezone
    status_hash = Web3.keccak(text=f"{new_status}|{current_user.email}|{datetime.now(timezone.utc).isoformat()}")

    if new_status != "closed":
        try:
            update_case_status_on_chain(case.on_chain_address, status_hash)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Blockchain status update failed: {str(e)}")
    else:
        # If closing, finalize with full logs (your existing behavior)
        logs = db.query(ProgressLog).filter(
            ProgressLog.case_id == case.id
        ).order_by(ProgressLog.timestamp).all()

        concatenated_hashes = ''.join([
            hashlib.sha256(
                f"{l.case_id}|{l.id}|{l.description}|{l.time_spent}|{l.timestamp.isoformat()}".encode()
            ).hexdigest()
            for l in logs
        ])
        final_hash = Web3.keccak(text=concatenated_hashes)
        finalize_case_on_chain(case.on_chain_address, final_hash)

    # --- Log status change in DB ---
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


def generate_status_hash(status, changed_by, timestamp):
    return Web3.keccak(text=f"{status}|{changed_by}|{timestamp}")

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
    ensure_blockchain()
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
    db.flush()
    
    
    log_hash = generate_log_hash(data.case_id, log_id, data.description, data.time_spent, log.timestamp)

    add_log_to_case(case.on_chain_address, log_hash)
    
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

    # Save old version to history (including old timestamp)
    history = ProgressLogHistory(
        log_id=log.id,
        old_description=log.description,
        old_time_spent=log.time_spent,
        old_timestamp=log.timestamp,  # <-- NEW: store original timestamp
        edited_at=datetime.now(timezone.utc),
        edited_by=current_user.id
    )
    db.add(history)

    # Update log in DB (assign new timestamp)
    new_timestamp = datetime.now(timezone.utc)
    log.description = data.description
    log.time_spent = data.time_spent
    log.timestamp = new_timestamp
    log.is_edited = True
    db.commit()
    db.refresh(log)

    # --- Blockchain: Post updated version ---
    case = db.query(Case).filter(Case.id == log.case_id).first()
    if not case or not case.on_chain_address:
        raise HTTPException(status_code=400, detail="Case not on blockchain")

    # Compute new log hash using the new timestamp
    new_log_hash = generate_log_hash(log.case_id, log.id, log.description, log.time_spent, log.timestamp)

    parent_index = int(log.id.split('-')[-1]) - 1

    try:
        add_log_version_to_case(case.on_chain_address, parent_index, new_log_hash)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Blockchain log update failed: {str(e)}")

    return {"msg": "Log updated (new version posted on-chain)", "log_id": log.id}


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
    
from datetime import timedelta

@router.post("/audit/grant_access/{case_id}")
def grant_audit_access(
    case_id: str,
    auditor_email: str,
    expiry_hours: int = 24,  # default 1 day access
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Only a lawyer or client on the case can grant access
    if current_user.id not in [case.lawyer_id, case.client_id]:
        raise HTTPException(status_code=403, detail="Unauthorized to grant access")

    access = CaseAuditAccess(
        case_id=case_id,
        auditor_email=auditor_email,
        granted_by=current_user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=expiry_hours)
    )
    db.add(access)
    db.commit()
    return {"msg": f"Audit access granted to {auditor_email} for {expiry_hours} hours"}

def check_audit_access(case_id: str, current_user: User, db: Session):
    access = db.query(CaseAuditAccess).filter(
        CaseAuditAccess.case_id == case_id,
        CaseAuditAccess.auditor_email == current_user.email,
        CaseAuditAccess.expires_at > datetime.now(timezone.utc)
    ).first()
    if not access:
        raise HTTPException(status_code=403, detail="No active audit access for this case")


@router.get("/audit/verify_log/{case_id}/{log_id}")
def verify_log(
    case_id: str,
    log_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "auditor":
        raise HTTPException(status_code=403, detail="Only auditors can access this endpoint")
    check_audit_access(case_id, current_user, db)
    """
    Verify a single log by recomputing its hash and comparing with the on-chain stored hash.
    """
    # Fetch log from DB
    log = db.query(ProgressLog).filter(ProgressLog.id == log_id, ProgressLog.case_id == case_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    
    
    # Recompute hash using the same logic used during logging
    recomputed_hash = generate_log_hash(log.case_id, log.id, log.description, log.time_spent, log.timestamp)

    # Fetch on-chain hash
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case or not case.on_chain_address:
        raise HTTPException(status_code=404, detail="Case not found or not on-chain")

    case_contract = get_case_contract(case.on_chain_address)
    try:
        # logs are stored in order, log index = sequence - 1
        log_index = int(log.id.split('-')[-1]) - 1
        log_hash_on_chain, _, version, parent_index = case_contract.functions.getLog(log_index).call()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch log from blockchain: {str(e)}")

    response_data = {
    "log_id": log.id,
    "verified": recomputed_hash == log_hash_on_chain,
    "on_chain_hash": log_hash_on_chain.hex(),
    "recomputed_hash": recomputed_hash.hex(),
    "version": version
    }
    
    if version > 1:
        response_data["parent_log_index"] = parent_index

    return response_data

@router.get("/audit/verify_case/{case_id}")
def verify_case_logs(
    case_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "auditor":
        raise HTTPException(status_code=403, detail="Only auditors can access this endpoint")
    check_audit_access(case_id, current_user, db)

    case = db.query(Case).filter(Case.id == case_id).first()
    if not case or not case.on_chain_address:
        raise HTTPException(status_code=404, detail="Case not found or not on-chain")

    logs = db.query(ProgressLog).filter(ProgressLog.case_id == case_id).order_by(ProgressLog.timestamp).all()
    case_contract = get_case_contract(case.on_chain_address)

    grouped_results = {}
    index_to_log_id = {}

    for log in logs:
        log_index = int(log.id.split('-')[-1]) - 1
        index_to_log_id[log_index] = log.id  # Map blockchain index → log ID

    for log in logs:
        recomputed_hash = generate_log_hash(log.case_id, log.id, log.description, log.time_spent, log.timestamp)
        log_index = int(log.id.split('-')[-1]) - 1
        log_hash_on_chain, _, version, parent_index = case_contract.functions.getLog(log_index).call()

        log_data = {
            "log_id": log.id,
            "verified": recomputed_hash == log_hash_on_chain,
            "on_chain_hash": log_hash_on_chain.hex(),
            "recomputed_hash": recomputed_hash.hex(),
            "version": version
        }

        if version > 1:
            parent_log_id = index_to_log_id.get(parent_index)
            if parent_log_id and parent_log_id in grouped_results:
                grouped_results[parent_log_id]["edits"].append(log_data)
            else:
                grouped_results[log.id] = {
                    "original": None,
                    "edits": [log_data]
                }
        else:
            grouped_results[log.id] = {
                "original": log_data,
                "edits": []
            }

    grouped_list = list(grouped_results.values())

    return {"case_id": case.id, "logs": grouped_list}
