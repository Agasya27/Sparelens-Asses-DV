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
                # Try multiple common encodings for CSVs. Many real-world files
                # are saved as Windows-1252/Latin-1 instead of UTF-8.
                encodings_to_try = [None, 'utf-8', 'utf-8-sig', 'latin1', 'cp1252']
                last_err = None
                for enc in encodings_to_try:
                    try:
                        if enc is None:
                            df = pd.read_csv(file_path)
                        else:
                            df = pd.read_csv(file_path, encoding=enc)
                        break
                    except UnicodeDecodeError as e:
                        last_err = e
                        df = None
                if df is None:
                    raise UnicodeDecodeError(
                        last_err.encoding if hasattr(last_err, 'encoding') else 'unknown',
                        last_err.object if hasattr(last_err, 'object') else b'',
                        getattr(last_err, 'start', 0),
                        getattr(last_err, 'end', 0),
                        f"Could not decode CSV using encodings {encodings_to_try[1:]}."
                    )
            elif filename.endswith(('.xlsx', '.xls')):
                try:
                    if filename.endswith('.xlsx'):
                        df = pd.read_excel(file_path, engine='openpyxl')
                    else:  # .xls
                        df = pd.read_excel(file_path, engine='xlrd')
                except ImportError as e:
                    # Provide a clearer error for missing Excel engines
                    missing = 'openpyxl' if filename.endswith('.xlsx') else 'xlrd'
                    raise HTTPException(
                        status_code=400,
                        detail=f"Missing optional dependency '{missing}'. Please install it on the server to enable Excel parsing."
                    )
            else:
                raise ValueError("Unsupported file format")
            
            df.columns = df.columns.str.strip().str.replace(' ', '_').str.lower()
            
            return df
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")

    @staticmethod
    def infer_column_types(df: pd.DataFrame) -> Dict[str, str]:
        """Infer types with robust heuristics for messy real-world CSVs.
        Rules:
        - If dtype is already numeric/datetime, respect it.
        - Otherwise, try to coerce numeric after cleaning symbols (commas, currency, %).
        - Try to parse dates with to_datetime.
        - Use a threshold (>= 0.7 non-null after coercion) to decide.
        """
        column_types: Dict[str, str] = {}

        def clean_numeric_series(s: pd.Series) -> pd.Series:
            # Work on strings; remove common noise: commas, spaces, currency, percents
            s_str = s.astype(str).str.strip()
            s_str = s_str.str.replace(r"[\s,]", "", regex=True)
            s_str = s_str.str.replace(r"[\$€£]", "", regex=True)
            s_str = s_str.str.replace(r"%$", "", regex=True)
            return pd.to_numeric(s_str, errors='coerce')

        numeric_candidates = []
        for col in df.columns:
            series = df[col]
            # Fast paths for known dtypes
            if pd.api.types.is_numeric_dtype(series):
                column_types[col] = "number"
                continue
            if pd.api.types.is_datetime64_any_dtype(series):
                column_types[col] = "date"
                continue

            # Try numeric coercion on object-like columns
            num = clean_numeric_series(series)
            num_ratio = (num.notna().sum() / len(series)) if len(series) else 0.0

            # Try date coercion
            dt = pd.to_datetime(series, errors='coerce', infer_datetime_format=True)
            dt_ratio = (dt.notna().sum() / len(series)) if len(series) else 0.0

            numeric_candidates.append((col, num_ratio))

            if num_ratio >= 0.5 and num_ratio >= dt_ratio:
                column_types[col] = "number"
            elif dt_ratio >= 0.5:
                column_types[col] = "date"
            else:
                column_types[col] = "string"

        # Fallback: ensure at least one numeric column if possible
        if "number" not in column_types.values() and numeric_candidates:
            best_col, best_ratio = max(numeric_candidates, key=lambda x: x[1])
            if best_ratio >= 0.2:
                column_types[best_col] = "number"

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
