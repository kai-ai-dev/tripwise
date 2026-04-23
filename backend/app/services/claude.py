import anthropic
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """你是一个专业的旅游规划师。
用户会提供出发地、目的地、天数、预算和偏好，你需要生成一份结构化的旅行计划。

输出要求：
1. 必须返回合法的 JSON，不能包含任何额外文字
2. 预算必须包含总预算和每日预算
3. 每天至少包含 3 个行程项目
4. 每个项目必须包含时间、地点、分类、预估费用和注意事项

JSON 结构如下：
{
  "total_budget": 3500,
  "days": [
    {
      "day_index": 1,
      "date": "2026-05-01",
      "title": "第一天：抵达成都",
      "summary": "从上海飞抵成都，入住酒店，晚上体验宽窄巷子",
      "day_budget": 875,
      "items": [
        {
          "start_time": "08:00",
          "end_time": "11:00",
          "place_name": "上海浦东国际机场",
          "category": "交通",
          "notes": "提前2小时到达机场办理登机",
          "estimated_cost": 600
        }
      ]
    }
  ]
}"""

async def generate_itinerary(
    origin: str,
    destination: str,
    start_date: str,
    end_date: str,
    budget: float,
    preferences: list,
    pace: str,
) -> dict:
    """调用 Claude API 生成结构化行程，返回解析后的 JSON"""

    user_prompt = f"""
请为我规划一次旅行：
- 出发地：{origin}
- 目的地：{destination}
- 出发日期：{start_date}
- 返回日期：{end_date}
- 总预算：{budget} 元
- 旅行偏好：{', '.join(preferences) if preferences else '无特殊偏好'}
- 节奏：{'省钱优先' if pace == 'budget' else '深度游' if pace == 'deep' else '均衡安排'}

请按照要求返回 JSON 格式的旅行计划。
"""

    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    import json
    raw = message.content[0].text.strip()
    # 去除可能的 markdown 代码块
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
