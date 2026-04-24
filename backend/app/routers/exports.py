from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from urllib.parse import quote
from app.core.supabase import supabase
from app.services.exporter import build_markdown

router = APIRouter()

@router.post("/{trip_id}/export")
async def export_trip(trip_id: str):
    """导出行程为 Markdown 文本"""
    trip = supabase.table("trip_plans").select("*").eq("id", trip_id).single().execute().data
    days = supabase.table("itinerary_days") \
        .select("*, itinerary_items(*)") \
        .eq("trip_plan_id", trip_id) \
        .order("day_index") \
        .execute().data
    md = build_markdown(trip, days)
    filename = f"行程_{trip['destination']}_{trip['start_date']}.md"
    encoded = quote(filename)
    return PlainTextResponse(
        content=md,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded}"},
    )
