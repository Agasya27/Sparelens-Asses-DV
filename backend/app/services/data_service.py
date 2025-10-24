import pandas as pd
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException
from ..models.file import File
from ..models.row import Row


class DataService:
    @staticmethod
    def _load_dataframe(file_id: int, db: Session) -> pd.DataFrame:
        db_file = db.query(File).filter(File.id == file_id).first()
        if not db_file:
            raise HTTPException(status_code=404, detail="File not found")

        query = db.query(Row).filter(Row.file_id == file_id)
        rows_data = [row.raw_json for row in query.all()]
        if not rows_data:
            return pd.DataFrame()
        return pd.DataFrame(rows_data)

    @staticmethod
    def _apply_search_and_filters(
        df: pd.DataFrame,
        search: Optional[str],
        filters: Optional[Dict[str, Any]]
    ) -> pd.DataFrame:
        if df.empty:
            return df
        if search:
            mask = df.astype(str).apply(lambda x: x.str.contains(search, case=False, na=False)).any(axis=1)
            df = df[mask]
        if filters:
            for col, value in filters.items():
                if col in df.columns:
                    if isinstance(value, dict):
                        if 'min' in value:
                            df = df[pd.to_numeric(df[col], errors='coerce') >= value['min']]
                        if 'max' in value:
                            df = df[pd.to_numeric(df[col], errors='coerce') <= value['max']]
                    else:
                        df = df[df[col].astype(str).str.contains(str(value), case=False, na=False)]
        return df

    @staticmethod
    def get_rows(
        file_id: int,
        db: Session,
        page: int = 1,
        page_size: int = 50,
        sort_by: Optional[str] = None,
        sort_dir: str = "asc",
        search: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        df = DataService._load_dataframe(file_id, db)
        if df.empty:
            return {"total": 0, "page": page, "page_size": page_size, "rows": []}

        df = DataService._apply_search_and_filters(df, search, filters)

        total = len(df)

        if sort_by and sort_by in df.columns:
            ascending = sort_dir.lower() == "asc"
            df = df.sort_values(by=sort_by, ascending=ascending)

        start = (page - 1) * page_size
        end = start + page_size
        df_page = df.iloc[start:end]

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "rows": df_page.to_dict(orient='records')
        }

    @staticmethod
    def aggregate_data(
        file_id: int,
        group_by: List[str],
        metrics: List[Dict[str, str]],
        filters: Optional[Dict[str, Any]],
        search: Optional[str],
        db: Session
    ) -> List[Dict[str, Any]]:
        df = DataService._load_dataframe(file_id, db)
        if df.empty:
            return []

        df = DataService._apply_search_and_filters(df, search, filters)
        
        agg_dict = {}
        for metric in metrics:
            col = metric['col']
            agg = metric['agg']
            
            if col not in df.columns:
                continue
            
            if agg == 'count':
                agg_dict[f"{col}_{agg}"] = (col, 'count')
            elif agg == 'sum':
                agg_dict[f"{col}_{agg}"] = (col, lambda x: pd.to_numeric(x, errors='coerce').sum())
            elif agg == 'avg':
                agg_dict[f"{col}_{agg}"] = (col, lambda x: pd.to_numeric(x, errors='coerce').mean())
            elif agg == 'min':
                agg_dict[f"{col}_{agg}"] = (col, lambda x: pd.to_numeric(x, errors='coerce').min())
            elif agg == 'max':
                agg_dict[f"{col}_{agg}"] = (col, lambda x: pd.to_numeric(x, errors='coerce').max())
        
        if group_by:
            valid_group_by = [col for col in group_by if col in df.columns]
            if valid_group_by and agg_dict:
                result = df.groupby(valid_group_by).agg(**agg_dict).reset_index()
            else:
                result = df
        else:
            if agg_dict:
                result_dict = {}
                for key, (col, func) in agg_dict.items():
                    if callable(func):
                        result_dict[key] = func(df[col])
                    else:
                        result_dict[key] = df[col].agg(func)
                result = pd.DataFrame([result_dict])
            else:
                result = df
        
        return result.to_dict(orient='records')

    @staticmethod
    def export_csv(
        file_id: int,
        db: Session,
        search: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None,
        columns: Optional[List[str]] = None
    ) -> str:
        df = DataService._load_dataframe(file_id, db)
        if df.empty:
            return ""
        df = DataService._apply_search_and_filters(df, search, filters)
        if columns:
            cols = [c for c in columns if c in df.columns]
            if cols:
                df = df[cols]
        # Return CSV string
        return df.to_csv(index=False)

    @staticmethod
    def get_columns(file_id: int, db: Session) -> List[Dict[str, Any]]:
        db_file = db.query(File).filter(File.id == file_id).first()
        if not db_file:
            raise HTTPException(status_code=404, detail="File not found")
        
        query = db.query(Row).filter(Row.file_id == file_id).limit(5)
        rows_data = [row.raw_json for row in query.all()]
        
        if not rows_data:
            return []
        
        df = pd.DataFrame(rows_data)
        
        columns_info = []
        for col in df.columns:
            sample_values = df[col].dropna().head(3).tolist()
            col_type = db_file.columns_json.get('types', {}).get(col, 'string')
            
            columns_info.append({
                "name": col,
                "type": col_type,
                "sample_values": sample_values
            })
        
        return columns_info
