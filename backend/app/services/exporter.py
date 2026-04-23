def build_markdown(trip: dict, days: list) -> str:
    """将行程数据拼装为 Markdown 格式文本"""
    lines = [
        f"# {trip['destination']} 旅行计划",
        f"",
        f"**出发地**：{trip['origin']}  ",
        f"**目的地**：{trip['destination']}  ",
        f"**日期**：{trip['start_date']} → {trip['end_date']}  ",
        f"**总预算**：¥{trip['budget']}  ",
        f"",
        "---",
        "",
    ]
    for day in days:
        lines.append(f"## Day {day['day_index']} · {day['date']} · {day['title']}")
        lines.append(f"> {day['summary']}")
        lines.append(f"**当日预算**：¥{day['day_budget']}")
        lines.append("")
        for item in day.get("itinerary_items", []):
            lines.append(f"- **{item['start_time']}-{item['end_time']}** [{item['category']}] {item['place_name']}")
            if item.get("notes"):
                lines.append(f"  - 备注：{item['notes']}")
            lines.append(f"  - 预估费用：¥{item['estimated_cost']}")
        lines.append("")
    lines.append("---")
    lines.append("*由 Tripwise AI 生成*")
    return "\n".join(lines)
