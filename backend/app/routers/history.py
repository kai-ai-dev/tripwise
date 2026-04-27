from fastapi import APIRouter, Request
from app.core.supabase import supabase

router = APIRouter()

@router.get("/history")
async def get_history(request: Request):
    """获取当前用户的历史计划列表"""
    user_id = None
    auth = request.headers.get("authorization", "")
    if auth.startswith("Bearer "):
        token = auth[7:]
        try:
            user = supabase.auth.get_user(token)
            user_id = user.user.id
        except:
            pass

    query = supabase.table("trip_plans") \
        .select("id, destination, origin, start_date, end_date, budget, status, created_at") \
        .order("created_at", desc=True)

    if user_id:
        query = query.eq("user_id", user_id)

    result = query.execute()
    return result.data
