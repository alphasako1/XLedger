from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import routes
from backend.db.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

#CORS SETTINGS FOR DEV ONLY
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API routes
app.include_router(routes.router)

