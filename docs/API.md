# Tripwise API 文档

Base URL: `http://localhost:8000`

## 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/trips/plan` | 创建新的规划任务 |
| `GET` | `/api/trips/:id` | 获取计划详情 |
| `GET` | `/api/trips/:id/status` | 轮询任务生成状态 |
| `POST` | `/api/trips/:id/regenerate` | 按原条件重新生成 |
| `PATCH` | `/api/trips/:id/preferences` | 更新偏好后重算 |
| `GET` | `/api/history` | 获取历史计划列表 |
| `POST` | `/api/trips/:id/export` | 导出行程 Markdown |
| `POST` | `/api/trips/:id/feedback` | 提交用户反馈 |
| `GET` | `/api/admin/planner-runs` | 获取生成日志 |
| `GET` | `/api/admin/stats` | 获取后台统计数据 |
| `GET` | `/health` | 健康检查 |

## 详细说明

### POST /api/trips/plan

请求体：
```json
{
  "origin": "上海",
  "destination": "成都",
  "start_date": "2026-05-01",
  "end_date": "2026-05-04",
  "budget": 3500,
  "preferences": ["美食", "历史文化"],
  "pace": "standard"
}
```

响应：
```json
{ "trip_id": "uuid", "status": "pending" }
```

### GET /api/trips/:id/status

响应：
```json
{
  "id": "uuid",
  "status": "generating",
  "progress_hint": "正在规划第2天行程",
  "latency_ms": 8400,
  "error_message": null
}
```

status 枚举值：`pending` | `generating` | `success` | `failed`

前端规划页提交后每 2 秒轮询一次，`success` 时跳转详情页，`failed` 时展示重试按钮。
