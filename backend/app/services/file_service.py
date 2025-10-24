import pandas as pd
import os
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from ..models.file import File
from ..models.row import Row
from ..core.config import settings


class FileService:
    @staticmethod
    def parse_file(file_path: str, filename: str) -> pd.DataFrame:
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(file_path)
            elif filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file_path)
            else:
                raise ValueError("Unsupported file format")
            
            df.columns = df.columns.str.strip().str.replace(' ', '_').str.lower()
            
            return df
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")

    @staticmethod
    def infer_column_types(df: pd.DataFrame) -> Dict[str, str]:
        column_types = {}
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                column_types[col] = "number"
            elif pd.api.types.is_datetime64_any_dtype(df[col]):
                column_types[col] = "date"
            else:
                try:
                    pd.to_datetime(df[col], errors='raise')
                    column_types[col] = "date"
                except:
                    column_types[col] = "string"
        return column_types

    @staticmethod
    async def save_uploaded_file(upload_file: UploadFile, user_id: int, db: Session) -> File:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        file_path = os.path.join(settings.UPLOAD_DIR, f"{user_id}_{upload_file.filename}")
        
        with open(file_path, "wb") as f:
            content = await upload_file.read()
            f.write(content)
        
        df = FileService.parse_file(file_path, upload_file.filename)
        
        column_types = FileService.infer_column_types(df)
        columns_json = {
            "columns": list(df.columns),
            "types": column_types
        }
        
        db_file = File(
            user_id=user_id,
            filename=upload_file.filename,
            storage_path=file_path,
            row_count=len(df),
            columns_json=columns_json
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        for _, row in df.iterrows():
            db_row = Row(
                file_id=db_file.id,
                raw_json=row.to_dict()
            )
            db.add(db_row)
        
        db.commit()
        
        return db_file

    @staticmethod
    def delete_file(file_id: int, user_id: int, is_admin: bool, db: Session) -> bool:
        db_file = db.query(File).filter(File.id == file_id).first()
        
        if not db_file:
            raise HTTPException(status_code=404, detail="File not found")
        
        if not is_admin and db_file.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this file")
        
        if os.path.exists(db_file.storage_path):
            os.remove(db_file.storage_path)
        
        db.delete(db_file)
        db.commit()
        
        return True
