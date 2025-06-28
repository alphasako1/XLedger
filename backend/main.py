from fastapi import FastAPI
from backend.api import routes
from backend.db.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include API routes
app.include_router(routes.router)
