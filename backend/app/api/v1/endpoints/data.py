from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import json
from ....core.database import get_db
from ....core.deps import get_current_user
from ....models.user import User, UserRole
from ....models.file import File
from ....schemas.data import RowsResponse, AggregateRequest, AggregateResponse, ColumnInfo
from ....services.data_service import DataService

router = APIRouter()


@router.get("/{file_id}/rows", response_model=RowsResponse)
def get_rows(
    file_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
    sort_by: Optional[str] = None,
    sort_dir: str = Query("asc", regex="^(asc|desc)$"),
    search: Optional[str] = None,
    filters: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if current_user.role != UserRole.ADMIN and db_file.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
    
    filters_dict = None
    if filters:
        try:
            filters_dict = json.loads(filters)
        except:
            pass
    
    result = DataService.get_rows(
        file_id=file_id,
        db=db,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        search=search,
        filters=filters_dict
    )
    
    return RowsResponse(**result)


@router.post("/{file_id}/aggregate", response_model=AggregateResponse)
def aggregate_data(
    file_id: int,
    request: AggregateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if current_user.role != UserRole.ADMIN and db_file.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
    
    metrics = [{"col": m.col, "agg": m.agg} for m in request.metrics]
    
    result = DataService.aggregate_data(
        file_id=file_id,
        group_by=request.group_by or [],
        metrics=metrics,
        filters=request.filters,
        search=request.search,
        db=db
    )
    
    return AggregateResponse(data=result)


@router.get("/{file_id}/columns", response_model=List[ColumnInfo])
def get_columns(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if current_user.role != UserRole.ADMIN and db_file.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
    
    columns = DataService.get_columns(file_id, db)
    
    return [ColumnInfo(**col) for col in columns]


@router.get("/{file_id}/export")
def export_csv(
    file_id: int,
    search: Optional[str] = None,
    filters: Optional[str] = None,
    columns: Optional[str] = Query(None, description="Comma-separated columns to include"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    if current_user.role != UserRole.ADMIN and db_file.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")

    filters_dict = None
    if filters:
        try:
            filters_dict = json.loads(filters)
        except:
            pass

    columns_list = None
    if columns:
        columns_list = [c.strip() for c in columns.split(',') if c.strip()]

    csv_text = DataService.export_csv(
        file_id=file_id,
        db=db,
        search=search,
        filters=filters_dict,
        columns=columns_list
    )

    return StreamingResponse(
        iter([csv_text]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=export_{file_id}.csv"
        }
    )
