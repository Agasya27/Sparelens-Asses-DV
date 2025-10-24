from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from .api.v1 import api_router
from .models import User, File, Row

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Data Visualization Dashboard API",
    description="RESTful API for data visualization dashboard with file upload and analytics",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}


@app.get("/")
def root():
    return {"message": "Data Visualization Dashboard API", "docs": "/docs"}
