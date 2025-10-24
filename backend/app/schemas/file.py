from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Any, Optional


class FileUploadResponse(BaseModel):
    id: int
    filename: str
    row_count: int
    columns: List[str]
    message: str


class FileResponse(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    row_count: int
    columns_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class FileListResponse(BaseModel):
    total: int
    files: List[FileResponse]
