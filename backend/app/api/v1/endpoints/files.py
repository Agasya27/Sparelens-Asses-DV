from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from ....core.database import get_db
from ....core.deps import get_current_user
from ....models.user import User
from ....models.file import File as FileModel
from ....schemas.file import FileUploadResponse, FileResponse, FileListResponse
from ....services.file_service import FileService

router = APIRouter()


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = await FileService.save_uploaded_file(file, current_user.id, db)
    
    return FileUploadResponse(
        id=db_file.id,
        filename=db_file.filename,
        row_count=db_file.row_count,
        columns=db_file.columns_json.get('columns', []),
        message="File uploaded and parsed successfully"
    )


@router.get("", response_model=FileListResponse)
def get_files(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(FileModel)
    
    if current_user.role != "Admin":
        query = query.filter(FileModel.user_id == current_user.id)
    
    total = query.count()
    
    files = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return FileListResponse(
        total=total,
        files=[FileResponse.model_validate(f) for f in files]
    )


@router.get("/{file_id}", response_model=FileResponse)
def get_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(FileModel).filter(FileModel.id == file_id).first()
    
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if current_user.role != "Admin" and db_file.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
    
    return FileResponse.model_validate(db_file)


@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    is_admin = current_user.role == "Admin"
    FileService.delete_file(file_id, current_user.id, is_admin, db)
    
    return {"message": "File deleted successfully"}
