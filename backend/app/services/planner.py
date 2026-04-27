# -*- coding: utf-8 -*-
import uuid
import asyncio
import os
import json
import threading
import httpx
from datetime import datetime
from fastapi import BackgroundTasks
from app.core.supabase import supabase

DEEPSEEK_KEY = os.environ.get("DEEPSEEK_API_KEY", "")

def _run_generation_sync(trip_id, run_id, origin, destination, start_date, end_date, budget, preferences, pace):
    os.environ.pop("http_proxy", None)
    os.environ.pop("https_proxy", None)
    os.environ.pop("ALL_PROXY", None)

    start_time = datetime.utcnow()

    try:
        supabase.table("planner_runs").update({"status": "generating"}).eq("id", run_id).execute()
        supabase.table("trip_plans").update({"status": "generating"}).eq("id", trip_id).execute()

        system_msg = "You are a travel planner. Return ONLY valid JSON, no other text, no markdown."
        user_msg = (
            f"Plan a trip: from {origin} to {destination}, "
            f"dates {start_date} to {end_date}, budget {budget} CNY, pace {pace}. "
            f"Return JSON: {{\"total_budget\": number, \"days\": [{{\"day_index\": 1, "
            f"\"date\": \"YYYY-MM-DD\", \"title\": \"string\", \"summary\": \"string\", "
            f"\"day_budget\": number, \"items\": [{{\"start_time\": \"HH:MM\", "
            f"\"end_time\": \"HH:MM\", \"place_name\": \"string\", \"category\": \"string\", "
            f"\"notes\": \"string\", \"estimated_cost\": number}}]}}]}}"
        )

        with httpx.Client(timeout=120.0) as client:
            response = client.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_msg},
                    ],
                    "max_tokens": 4096,
                    "response_format": {"type": "json_object"},
                },
            )
            response.raise_for_status()
            data = response.json()

        raw = data["choices"][0]["message"]["content"].strip()
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())

        for day in result.get("days", []):
            day_id = str(uuid.uuid4())
            supabase.table("itinerary_days").insert({
                "id": day_id,
                "trip_plan_id": trip_id,
                "day_index": int(day["day_index"]),
                "date": str(day["date"]),
                "title": str(day["title"]),
                "summary": str(day["summary"]),
                "day_budget": float(day["day_budget"]),
            }).execute()

            for item in day.get("items", []):
                supabase.table("itinerary_items").insert({
                    "id": str(uuid.uuid4()),
                    "itinerary_day_id": day_id,
                    "start_time": str(item["start_time"]),
                    "end_time": str(item["end_time"]),
                    "place_name": str(item["place_name"]),
                    "category": str(item["category"]),
                    "notes": str(item.get("notes", "")),
                    "estimated_cost": float(item["estimated_cost"]),
                }).execute()

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
        err = repr(e)[:500]
        supabase.table("trip_plans").update({"status": "failed"}).eq("id", trip_id).execute()
        supabase.table("planner_runs").update({
            "status": "failed",
            "error_message": err,
            "latency_ms": latency,
        }).eq("id", run_id).execute()


async def create_plan(body, background_tasks: BackgroundTasks, user_id: str = None) -> str:
    trip_id = str(uuid.uuid4())
    run_id = str(uuid.uuid4())

    supabase.table("trip_plans").insert({
        "id": trip_id,
        "user_id": user_id,
        "origin": body.origin,
        "destination": body.destination,
        "start_date": str(body.start_date),
        "end_date": str(body.end_date),
        "budget": body.budget,
        "preferences": body.preferences,
        "pace": body.pace,
        "status": "pending",
    }).execute()

    supabase.table("planner_runs").insert({
        "id": run_id,
        "trip_plan_id": trip_id,
        "provider": "deepseek",
        "status": "pending",
    }).execute()

    t = threading.Thread(
        target=_run_generation_sync,
        args=(trip_id, run_id, body.origin, body.destination,
              str(body.start_date), str(body.end_date),
              body.budget, body.preferences, body.pace)
    )
    t.daemon = True
    t.start()

    return trip_id


async def regenerate_plan(trip_id, body, background_tasks):
    result = supabase.table("trip_plans").select("*").eq("id", trip_id).single().execute()
    original = result.data
    from app.schemas.trip import PlanRequest
    plan = PlanRequest(
        origin=original["origin"],
        destination=original["destination"],
        start_date=original["start_date"],
        end_date=original["end_date"],
        budget=original["budget"],
        preferences=original["preferences"] or [],
        pace=original["pace"],
    )
    return await create_plan(plan, background_tasks)
