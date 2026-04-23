from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.deps import verify_token
from app.core.supabase import supabase
import uuid

router = APIRouter()

class FeedbackRequest(BaseModel):
    score: int
    comment: str = ""

@router.post("/{trip_id}/feedback")
async def submit_feedback(trip_id: str, body: FeedbackRequest, token: str = Depends(verify_token)):
    """提交用户反馈"""
    supabase.table("trip_feedback").insert({
        "id": str(uuid.uuid4()),
        "trip_plan_id": trip_id,
        "score": body.score,
        "comment": body.comment,
    }).execute()
    return {"ok": True}
