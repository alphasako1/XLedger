from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.db.database import get_db
from backend.services import auth
from backend.utils.security import get_password_hash
from backend.db import models
from backend.utils.security import get_current_user
from backend.db.models import User

router = APIRouter()

# --------------------
# Pydantic Schemas
# --------------------

class RegisterData(BaseModel):
    email: str
    password: str
    role: str  # e.g., "lawyer" or "client"

class LoginData(BaseModel):
    email: str
    password: str

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

