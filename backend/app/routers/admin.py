from fastapi import APIRouter
from app.core.supabase import supabase

router = APIRouter()

@router.get("/planner-runs")
async def get_runs(status: str = None, limit: int = 50):
    """获取生成日志，支持按状态筛选"""
    query = supabase.table("planner_runs").select("*").order("created_at", desc=True).limit(limit)
    if status:
        query = query.eq("status", status)
    return query.execute().data

@router.get("/stats")
async def get_stats():
    """后台首页统计：总任务数、成功率、热门目的地"""
    runs = supabase.table("planner_runs").select("status").execute().data
    total = len(runs)
    success = sum(1 for r in runs if r["status"] == "success")
    return {
        "total_runs": total,
        "success_rate": round(success / total * 100, 1) if total else 0,
    }
