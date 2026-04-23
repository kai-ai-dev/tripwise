from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

# ── 请求 Schema ──────────────────────────────────────

class PlanRequest(BaseModel):
    origin: str = Field(..., example="上海")
    destination: str = Field(..., example="成都")
    start_date: date = Field(..., example="2026-05-01")
    end_date: date = Field(..., example="2026-05-04")
    budget: float = Field(..., gt=0, example=3500)
    preferences: List[str] = Field(default=[], example=["美食", "历史文化"])
    pace: str = Field(default="standard", example="standard")  # budget | standard | deep

class RegenerateRequest(BaseModel):
    reason: Optional[str] = None  # 可选：说明重生成原因

# ── 响应 Schema ──────────────────────────────────────

class ItineraryItemOut(BaseModel):
    start_time: str
    end_time: str
    place_name: str
    category: str
    notes: Optional[str]
    estimated_cost: float

class DayOut(BaseModel):
    day_index: int
    date: date
    title: str
    summary: str
    day_budget: float
    items: List[ItineraryItemOut] = []

class TripPlanOut(BaseModel):
    id: str
    destination: str
    origin: str
    start_date: date
    end_date: date
    budget: float
    pace: str
    status: str
    days: List[DayOut] = []
    created_at: str

class StatusOut(BaseModel):
    id: str
    status: str  # pending | generating | success | failed
    progress_hint: Optional[str] = None
    latency_ms: Optional[int] = None
    error_message: Optional[str] = None
