from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ....core.database import get_db
from ....core.deps import get_current_user, get_current_admin_user
from ....models.user import User
from ....schemas.user import UserResponse

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.get("", response_model=List[UserResponse])
def get_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return [UserResponse.model_validate(user) for user in users]
