from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class ColumnInfo(BaseModel):
    name: str
    type: str
    sample_values: List[Any]


class RowsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    rows: List[Dict[str, Any]]


class MetricRequest(BaseModel):
    col: str
    agg: str


class AggregateRequest(BaseModel):
    group_by: Optional[List[str]] = []
    metrics: List[MetricRequest]
    filters: Optional[Dict[str, Any]] = {}
    search: Optional[str] = None


class AggregateResponse(BaseModel):
    data: List[Dict[str, Any]]
