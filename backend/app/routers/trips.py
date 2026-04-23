from fastapi import APIRouter, BackgroundTasks, Depends
from app.schemas.trip import PlanRequest, RegenerateRequest, TripPlanOut, StatusOut
from app.services.planner import create_plan, regenerate_plan
from app.core.deps import verify_token

router = APIRouter()

@router.post("/plan")
async def plan_trip(
    body: PlanRequest,
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_token),
):
    """创建新的规划任务，立即返回 trip_id，后台异步生成"""
    trip_id = await create_plan(body, background_tasks)
    return {"trip_id": trip_id, "status": "pending"}

@router.get("/{trip_id}", response_model=TripPlanOut)
async def get_trip(trip_id: str, token: str = Depends(verify_token)):
    """获取计划详情（含每日行程和预算拆分）"""
    # TODO: 从 Supabase 查询并返回
    pass

@router.get("/{trip_id}/status", response_model=StatusOut)
async def get_status(trip_id: str):
    """轮询任务生成状态，供前端进度条使用"""
    # TODO: 从 planner_runs 表查询最新状态
    pass

@router.post("/{trip_id}/regenerate")
async def regenerate(
    trip_id: str,
    body: RegenerateRequest,
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_token),
):
    """按原条件重新生成行程"""
    await regenerate_plan(trip_id, body, background_tasks)
    return {"trip_id": trip_id, "status": "pending"}

@router.patch("/{trip_id}/preferences")
async def update_preferences(trip_id: str, token: str = Depends(verify_token)):
    """更新偏好后重新生成"""
    # TODO
    pass
