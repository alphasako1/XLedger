from sqlalchemy.orm import Session
from backend.db.models import Case, ProgressLog


def generate_case_id(db: Session, lawyer_id: int, client_id: int) -> str:
    prefix = f"C-{lawyer_id}-{client_id}"
    existing = db.query(Case).filter(
        Case.lawyer_id == lawyer_id,
        Case.client_id == client_id
    ).count()
    return f"{prefix}-{existing + 1:02d}"


def generate_log_id(db: Session, case_id: str) -> str:
    existing = db.query(ProgressLog).filter_by(case_id=case_id).count()
    return f"L-{case_id}-{existing + 1:02d}"
