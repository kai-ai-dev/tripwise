import uuid
from datetime import datetime
from fastapi import BackgroundTasks
from app.schemas.trip import PlanRequest, RegenerateRequest
from app.services.claude import generate_itinerary
from app.core.supabase import supabase

async def create_plan(body: PlanRequest, background_tasks: BackgroundTasks) -> str:
    """创建 trip_plans 记录并将生成任务加入后台队列"""
    trip_id = str(uuid.uuid4())

    # 1. 写入 trip_plans（状态 pending）
    supabase.table("trip_plans").insert({
        "id": trip_id,
        "origin": body.origin,
        "destination": body.destination,
        "start_date": str(body.start_date),
        "end_date": str(body.end_date),
        "budget": body.budget,
        "preferences": body.preferences,
        "pace": body.pace,
        "status": "pending",
    }).execute()

    # 2. 写入 planner_runs（记录本次任务）
    run_id = str(uuid.uuid4())
    supabase.table("planner_runs").insert({
        "id": run_id,
        "trip_plan_id": trip_id,
        "provider": "claude",
        "status": "pending",
    }).execute()

    # 3. 后台异步执行生成
    background_tasks.add_task(_run_generation, trip_id, run_id, body)
    return trip_id

async def _run_generation(trip_id: str, run_id: str, body: PlanRequest):
    """后台任务：调用 Claude 生成行程并写入数据库"""
    start_time = datetime.utcnow()
    try:
        # 更新状态为 generating
        supabase.table("planner_runs").update({"status": "generating"}).eq("id", run_id).execute()
        supabase.table("trip_plans").update({"status": "generating"}).eq("id", trip_id).execute()

        # 调用 Claude
        result = await generate_itinerary(
            origin=body.origin,
            destination=body.destination,
            start_date=str(body.start_date),
            end_date=str(body.end_date),
            budget=body.budget,
            preferences=body.preferences,
            pace=body.pace,
        )

        # 写入 itinerary_days 和 itinerary_items
        for day in result.get("days", []):
            day_id = str(uuid.uuid4())
            supabase.table("itinerary_days").insert({
                "id": day_id,
                "trip_plan_id": trip_id,
                "day_index": day["day_index"],
                "date": day["date"],
                "title": day["title"],
                "summary": day["summary"],
                "day_budget": day["day_budget"],
            }).execute()

            for item in day.get("items", []):
                supabase.table("itinerary_items").insert({
                    "id": str(uuid.uuid4()),
                    "itinerary_day_id": day_id,
                    "start_time": item["start_time"],
                    "end_time": item["end_time"],
                    "place_name": item["place_name"],
                    "category": item["category"],
                    "notes": item.get("notes", ""),
                    "estimated_cost": item["estimated_cost"],
                }).execute()

        # 更新状态为 success
        latency = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        supabase.table("trip_plans").update({
            "status": "success",
            "raw_output": result,
        }).eq("id", trip_id).execute()
        supabase.table("planner_runs").update({
            "status": "success",
            "latency_ms": latency,
        }).eq("id", run_id).execute()

    except Exception as e:
        latency = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        supabase.table("trip_plans").update({"status": "failed"}).eq("id", trip_id).execute()
        supabase.table("planner_runs").update({
            "status": "failed",
            "error_message": str(e),
            "latency_ms": latency,
        }).eq("id", run_id).execute()

async def regenerate_plan(trip_id: str, body: RegenerateRequest, background_tasks: BackgroundTasks):
    """重生成：读取原始 trip_plans 数据后重新调用生成"""
    result = supabase.table("trip_plans").select("*").eq("id", trip_id).single().execute()
    original = result.data
    plan = PlanRequest(
        origin=original["origin"],
        destination=original["destination"],
        start_date=original["start_date"],
        end_date=original["end_date"],
        budget=original["budget"],
        preferences=original["preferences"],
        pace=original["pace"],
    )
    await create_plan(plan, background_tasks)
