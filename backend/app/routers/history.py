from fastapi import APIRouter, Depends
from app.core.deps import verify_token
from app.core.supabase import supabase

router = APIRouter()

@router.get("/history")
async def get_history(token: str = Depends(verify_token)):
    """获取当前用户的历史计划列表"""
    # TODO: 从 token 中解析 user_id 后查询
    result = supabase.table("trip_plans") \
        .select("id, destination, origin, start_date, end_date, budget, status, created_at") \
        .order("created_at", desc=True) \
        .execute()
    return result.data
