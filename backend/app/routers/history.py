from fastapi import APIRouter
from app.core.supabase import supabase

router = APIRouter()

@router.get("/history")
async def get_history():
    """获取历史计划列表"""
    result = supabase.table("trip_plans") \
        .select("id, destination, origin, start_date, end_date, budget, status, created_at") \
        .order("created_at", desc=True) \
        .execute()
    return result.data
