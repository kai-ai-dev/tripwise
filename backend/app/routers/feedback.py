from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.core.supabase import supabase
import uuid

router = APIRouter()

class FeedbackRequest(BaseModel):
    score: int
    comment: str = ""

@router.post("/{trip_id}/feedback")
async def submit_feedback(trip_id: str, body: FeedbackRequest, request: Request):
    """提交用户反馈"""
    user_id = None
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
        try:
            user = supabase.auth.get_user(token)
            user_id = user.user.id
        except:
            pass

    supabase.table("trip_feedback").insert({
        "id": str(uuid.uuid4()),
        "trip_plan_id": trip_id,
        "user_id": user_id,
        "score": body.score,
        "comment": body.comment,
    }).execute()
    return {"ok": True}
