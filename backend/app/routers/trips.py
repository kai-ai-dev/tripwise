from fastapi import APIRouter, BackgroundTasks
from app.schemas.trip import PlanRequest, StatusOut
from app.services.planner import create_plan, regenerate_plan
from app.core.supabase import supabase

router = APIRouter()

@router.post("/plan")
async def plan_trip(body: PlanRequest, background_tasks: BackgroundTasks):
    trip_id = await create_plan(body, background_tasks)
    return {"trip_id": trip_id, "status": "pending"}

@router.get("/{trip_id}")
async def get_trip(trip_id: str):
    trip = supabase.table("trip_plans").select("*").eq("id", trip_id).single().execute().data
    if not trip:
        return None
    days = supabase.table("itinerary_days").select("*, itinerary_items(*)").eq("trip_plan_id", trip_id).order("day_index").execute().data
    trip["days"] = days
    return trip

@router.get("/{trip_id}/status", response_model=StatusOut)
async def get_status(trip_id: str):
    run = supabase.table("planner_runs").select("*").eq("trip_plan_id", trip_id).order("created_at", desc=True).limit(1).execute()
    if not run.data:
        return StatusOut(id=trip_id, status="pending")
    r = run.data[0]
    return StatusOut(
        id=trip_id,
        status=r["status"],
        progress_hint="AI 正在规划中..." if r["status"] == "generating" else None,
        latency_ms=r.get("latency_ms"),
        error_message=r.get("error_message"),
    )

@router.post("/{trip_id}/regenerate")
async def regenerate(trip_id: str, background_tasks: BackgroundTasks):
    await regenerate_plan(trip_id, None, background_tasks)
    return {"trip_id": trip_id, "status": "pending"}

@router.patch("/{trip_id}/preferences")
async def update_preferences(trip_id: str):
    return {"ok": True}
