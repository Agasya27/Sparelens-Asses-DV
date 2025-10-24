import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app import models  # Ensure models are imported so metadata has tables

# Use a temporary SQLite database file for tests to ensure tables persist across connections
TEST_DATABASE_URL = "sqlite:///./test_auth.db"

# Create the test engine and session
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    try:
        yield
    finally:
        # Drop tables and remove db file for isolation
        Base.metadata.drop_all(bind=engine)
        # Ensure all connections are closed before removing file on Windows
        try:
            engine.dispose()
        except Exception:
            pass
        try:
            os.remove("test_auth.db")
        except FileNotFoundError:
            pass


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the dependency for database session
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_signup_success():
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "supersecurepassword",
    }

    resp = client.post("/api/v1/auth/signup", json=payload)
    assert resp.status_code == 201, resp.text

    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["email"] == payload["email"]
    assert data["user"]["username"] == payload["username"]
    assert data["user"]["role"] == "Member"


def test_signup_duplicate_email():
    payload = {
        "username": "testuser",
        "email": "dup@example.com",
        "password": "supersecurepassword",
    }

    resp1 = client.post("/api/v1/auth/signup", json=payload)
    assert resp1.status_code == 201

    # Duplicate by email
    resp2 = client.post(
        "/api/v1/auth/signup",
        json={"username": "otheruser", "email": payload["email"], "password": "supersecurepassword"},
    )
    assert resp2.status_code == 409
    assert "already registered" in resp2.json()["detail"].lower()

    # Duplicate by username
    resp3 = client.post(
        "/api/v1/auth/signup",
        json={"username": payload["username"], "email": "new@example.com", "password": "supersecurepassword"},
    )
    assert resp3.status_code == 409


def test_signup_password_too_short():
    payload = {
        "username": "shortpass",
        "email": "short@example.com",
        "password": "short",
    }

    resp = client.post("/api/v1/auth/signup", json=payload)
    # Pydantic validation error
    assert resp.status_code == 422
