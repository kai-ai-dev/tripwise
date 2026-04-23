# -*- coding: utf-8 -*-
import os
os.environ.pop("http_proxy", None)
os.environ.pop("https_proxy", None)
os.environ.pop("ALL_PROXY", None)

from openai import OpenAI
import json

client = OpenAI(
    api_key="你的deepseek_key",
    base_url="https://api.deepseek.com",
)

SYSTEM_PROMPT = """你是一个专业的旅游规划师。用户提供旅行信息，你生成结构化旅行计划。
必须直接返回合法JSON，不包含任何额外文字和markdown代码块。
JSON结构：
{"total_budget":3500,"days":[{"day_index":1,"date":"2026-05-01","title":"第一天标题","summary":"当天概述","day_budget":875,"items":[{"start_time":"08:00","end_time":"11:00","place_name":"地点","category":"交通","notes":"备注","estimated_cost":600}]}]}"""

async def generate_itinerary(origin, destination, start_date, end_date, budget, preferences, pace):
    user_prompt = f"请规划：出发地{origin}，目的地{destination}，{start_date}至{end_date}，预算{budget}元，偏好{preferences}，节奏{pace}。只返回JSON。"
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role":"system","content":SYSTEM_PROMPT},{"role":"user","content":user_prompt}],
        max_tokens=4096,
    )
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"): raw = raw[4:]
    return json.loads(raw.strip())
