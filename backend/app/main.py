from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .core.database import engine, Base, SessionLocal
from .api.v1 import api_router
from .models import User, File, Row
from .models.user import User as UserModel, UserRole
from .core.security import get_password_hash
from .core.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Data Visualization Dashboard API",
    description="RESTful API for data visualization dashboard with file upload and analytics",
    version="1.0.0"
)

# CORS configuration
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Allow additional origins via env (comma-separated), e.g., network IPs from Vite output
extra = [o.strip() for o in settings.CORS_EXTRA_ORIGINS.split(",") if o.strip()] if settings.CORS_EXTRA_ORIGINS else []
origins = default_origins + extra

if settings.DEV_CORS:
    # Dev-only: allow all origins to avoid CORS issues when using network URLs
    allow_origins = ["*"]
else:
    allow_origins = origins

# If allowing all origins in dev, avoid sending allow_credentials to prevent
# browsers rejecting "*" with credentials per CORS spec.
allow_credentials = False if settings.DEV_CORS and allow_origins == ["*"] else True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
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


@app.on_event("startup")
def bootstrap_admin():
    """Optionally create or promote an admin user on startup.
    If ADMIN_EMAIL and ADMIN_PASSWORD are set and no Admin exists, either
    promote an existing user with that email/username or create a new Admin.
    """
    try:
        if not (settings.ADMIN_EMAIL and settings.ADMIN_PASSWORD):
            return

        db = SessionLocal()
        try:
            existing_admin = db.query(UserModel).filter(UserModel.role == UserRole.ADMIN).first()
            if existing_admin:
                return

            # Try to find existing user by email or username
            user = db.query(UserModel).filter(
                (UserModel.email == settings.ADMIN_EMAIL) | (UserModel.username == settings.ADMIN_USERNAME)
            ).first()

            if user:
                user.role = UserRole.ADMIN
                if settings.ADMIN_OVERWRITE and settings.ADMIN_PASSWORD:
                    user.password_hash = get_password_hash(settings.ADMIN_PASSWORD)
                db.commit()
            else:
                user = UserModel(
                    username=settings.ADMIN_USERNAME,
                    email=settings.ADMIN_EMAIL,
                    password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                    role=UserRole.ADMIN,
                )
                db.add(user)
                db.commit()
        finally:
            db.close()
    except Exception:
        # Startup should not crash the app; log in real deployments
        pass
