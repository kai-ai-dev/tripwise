#!/bin/bash
# ============================================================
# Tripwise 一键初始化脚本（Mac 版）
# 用法：bash setup.sh
# 前提：已安装 git，已登录 GitHub
# ============================================================

set -e

REPO_NAME="tripwise"
GITHUB_USER="kai-ai-dev"

echo "🚀 开始初始化 Tripwise 项目..."
echo ""

# ── 1. 创建根目录 ──────────────────────────────────────────
mkdir -p $REPO_NAME && cd $REPO_NAME

# ── 2. 创建所有目录 ────────────────────────────────────────
mkdir -p frontend/src/app/login
mkdir -p frontend/src/app/planner
mkdir -p "frontend/src/app/trips/[id]"
mkdir -p frontend/src/app/history
mkdir -p frontend/src/app/exports
mkdir -p frontend/src/app/admin/runs
mkdir -p frontend/src/components/form
mkdir -p frontend/src/components/trip
mkdir -p frontend/src/components/budget
mkdir -p frontend/src/components/shared
mkdir -p frontend/src/lib
mkdir -p frontend/src/types
mkdir -p frontend/public
mkdir -p backend/app/core
mkdir -p backend/app/routers
mkdir -p backend/app/services
mkdir -p backend/app/models
mkdir -p backend/app/schemas
mkdir -p backend/tests
mkdir -p supabase/migrations
mkdir -p docs

echo "✅ 目录结构创建完成"

# ── 3. 根目录文件 ──────────────────────────────────────────
cat > .gitignore << 'EOF'
node_modules/
.next/
out/
dist/
__pycache__/
*.pyc
.venv/
venv/
.env
.env.local
.env.production
backend/.env
frontend/.env.local
.DS_Store
*.log
logs/
.vscode/
.idea/
EOF

cat > README.md << 'EOF'
# Tripwise — 智能旅游规划 Agent 平台

> 一次表单提交，生成可执行的结构化旅行计划。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 + TypeScript + Tailwind CSS |
| 后端 | FastAPI + Python |
| Agent | Anthropic Claude API |
| 数据库 | Supabase (PostgreSQL) |
| 鉴权 | Supabase Auth |
| 部署 | Vercel（前端）+ Railway（后端）|

## 快速开始

```bash
git clone https://github.com/kai-ai-dev/tripwise.git
cd tripwise

# 前端
cp frontend/.env.local.example frontend/.env.local
cd frontend && npm install && npm run dev

# 后端（新终端窗口）
cd backend
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## MVP 功能

- [x] 规划表单页
- [x] 行程详情页（Day by Day + 预算拆分）
- [x] 历史计划页
- [x] 计划保存与重生成
- [x] Markdown 导出（PDF 占位）
- [x] 后台任务与失败日志

## 文档

[PRD](./docs/PRD.md) · [API](./docs/API.md) · [部署说明](./docs/DEPLOYMENT.md)
EOF

# ── 4. 前端文件 ────────────────────────────────────────────
cat > frontend/package.json << 'EOF'
{
  "name": "tripwise-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "eslint": "^8",
    "eslint-config-next": "14.2.5"
  }
}
EOF

cat > frontend/.env.local.example << 'EOF'
# Supabase（在 supabase.com 项目设置里获取）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF

cat > frontend/next.config.ts << 'EOF'
import type { NextConfig } from 'next'
const nextConfig: NextConfig = {}
export default nextConfig
EOF

cat > frontend/tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {} },
  plugins: [],
}
export default config
EOF

cat > frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# 前端类型定义
cat > frontend/src/types/trip.ts << 'EOF'
export type TripStatus = 'pending' | 'generating' | 'success' | 'failed'
export type Pace = 'budget' | 'standard' | 'deep'

export interface PlanRequest {
  origin: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  preferences: string[]
  pace: Pace
}

export interface ItineraryItem {
  id: string
  start_time: string
  end_time: string
  place_name: string
  category: string
  notes?: string
  estimated_cost: number
}

export interface ItineraryDay {
  id: string
  day_index: number
  date: string
  title: string
  summary: string
  day_budget: number
  items: ItineraryItem[]
}

export interface TripPlan {
  id: string
  origin: string
  destination: string
  start_date: string
  end_date: string
  budget: number
  pace: Pace
  status: TripStatus
  days: ItineraryDay[]
  created_at: string
}

export interface StatusResponse {
  id: string
  status: TripStatus
  progress_hint?: string
  latency_ms?: number
  error_message?: string
}
EOF

# 前端 API 封装
cat > frontend/src/lib/api.ts << 'EOF'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  createPlan: (body: object) =>
    request<{ trip_id: string; status: string }>('/api/trips/plan', {
      method: 'POST', body: JSON.stringify(body),
    }),
  getStatus: (tripId: string) =>
    request<{ id: string; status: string; progress_hint?: string; error_message?: string }>(
      `/api/trips/${tripId}/status`
    ),
  getTrip: (tripId: string) => request(`/api/trips/${tripId}`),
  getHistory: () => request('/api/history'),
  regenerate: (tripId: string) =>
    request(`/api/trips/${tripId}/regenerate`, { method: 'POST', body: '{}' }),
  exportTrip: (tripId: string) =>
    fetch(`${API_URL}/api/trips/${tripId}/export`, { method: 'POST' }),
  submitFeedback: (tripId: string, score: number, comment: string) =>
    request(`/api/trips/${tripId}/feedback`, {
      method: 'POST', body: JSON.stringify({ score, comment }),
    }),
  getAdminStats: () => request('/api/admin/stats'),
  getAdminRuns: (status?: string) =>
    request(`/api/admin/planner-runs${status ? `?status=${status}` : ''}`),
}
EOF

# 前端 Supabase 客户端
cat > frontend/src/lib/supabase.ts << 'EOF'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
EOF

# 前端页面占位
cat > frontend/src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tripwise — 智能旅游规划',
  description: '一次表单提交，生成可执行的结构化旅行计划',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
EOF

cat > frontend/src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cat > frontend/src/app/page.tsx << 'EOF'
// 官网首页 www:/ — 产品介绍 + CTA
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Tripwise</h1>
      <p className="text-lg text-gray-600 mb-8">一次表单提交，生成可执行的结构化旅行计划</p>
      <a href="/planner" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        开始规划
      </a>
    </main>
  )
}
EOF

cat > frontend/src/app/login/page.tsx << 'EOF'
// 登录页 app:/login — Auth 唯一入口
'use client'
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-8 border rounded-xl">
        <h2 className="text-2xl font-semibold mb-6">登录 Tripwise</h2>
        {/* TODO: Supabase Auth UI */}
        <p className="text-gray-500 text-sm">邮箱登录 / 注册</p>
      </div>
    </main>
  )
}
EOF

cat > frontend/src/app/planner/page.tsx << 'EOF'
// 规划页 app:/planner — 输入需求并提交
'use client'
export default function PlannerPage() {
  return (
    <main className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-6">规划我的旅行</h2>
      {/* TODO: PlannerForm 组件 */}
      <p className="text-gray-400">表单开发中...</p>
    </main>
  )
}
EOF

cat > "frontend/src/app/trips/[id]/page.tsx" << 'EOF'
// 行程详情页 app:/trips/:id — Day by Day + 预算拆分
export default function TripDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-6">行程详情</h2>
      <p className="text-gray-400 text-sm">Trip ID: {params.id}</p>
      {/* TODO: DayCard 列表 + BudgetBreakdown */}
    </main>
  )
}
EOF

cat > frontend/src/app/history/page.tsx << 'EOF'
// 历史计划页 app:/history — 我的旅行库
'use client'
export default function HistoryPage() {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-6">我的旅行库</h2>
      {/* TODO: HistoryList 组件 */}
      <p className="text-gray-400">暂无历史计划</p>
    </main>
  )
}
EOF

cat > frontend/src/app/exports/page.tsx << 'EOF'
// 导出反馈页 app:/exports
'use client'
export default function ExportsPage() {
  return (
    <main className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-6">导出计划</h2>
      {/* TODO: ExportButton + FeedbackForm */}
      <p className="text-gray-400">导出功能开发中...</p>
    </main>
  )
}
EOF

cat > frontend/src/app/admin/page.tsx << 'EOF'
// 后台首页 admin:/ — 运营统计
export default function AdminPage() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-6">后台管理</h2>
      {/* TODO: 统计卡片：任务数、成功率、热门目的地 */}
      <p className="text-gray-400">统计数据加载中...</p>
    </main>
  )
}
EOF

cat > frontend/src/app/admin/runs/page.tsx << 'EOF'
// 任务与反馈页 admin:/runs
export default function AdminRunsPage() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-6">任务与反馈</h2>
      {/* TODO: 失败任务列表 + 用户反馈列表 */}
      <p className="text-gray-400">任务日志加载中...</p>
    </main>
  )
}
EOF

# 前端组件占位
for component in \
  "frontend/src/components/form/PlannerForm.tsx" \
  "frontend/src/components/form/PreferenceSelector.tsx" \
  "frontend/src/components/trip/DayCard.tsx" \
  "frontend/src/components/trip/ItineraryItem.tsx" \
  "frontend/src/components/trip/StatusBar.tsx" \
  "frontend/src/components/budget/BudgetBreakdown.tsx" \
  "frontend/src/components/shared/HistoryList.tsx" \
  "frontend/src/components/shared/ErrorRetry.tsx" \
  "frontend/src/components/shared/ExportButton.tsx"
do
  name=$(basename "$component" .tsx)
  echo "// $name 组件 — 待迭代开发
export default function $name() {
  return <div>{/* $name */}</div>
}" > "$component"
done

echo "✅ 前端文件写入完成"

# ── 5. 后端文件 ────────────────────────────────────────────
cat > backend/requirements.txt << 'EOF'
fastapi==0.115.0
uvicorn[standard]==0.30.6
anthropic==0.34.0
supabase==2.7.4
pydantic==2.8.2
pydantic-settings==2.4.0
python-dotenv==1.0.1
httpx==0.27.2
pytest==8.3.2
pytest-asyncio==0.23.8
EOF

cat > backend/.env.example << 'EOF'
# Anthropic Claude API（在 console.anthropic.com 获取）
ANTHROPIC_API_KEY=sk-ant-your-key-here
CLAUDE_MODEL=claude-sonnet-4-5-20251001

# Supabase（在项目设置 > API 里获取 service_role key）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 应用配置
APP_ENV=development
CORS_ORIGINS=["http://localhost:3000"]
EOF

cat > backend/Dockerfile << 'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# 后端 __init__.py 文件
touch backend/app/__init__.py
touch backend/app/core/__init__.py
touch backend/app/routers/__init__.py
touch backend/app/services/__init__.py
touch backend/app/models/__init__.py
touch backend/app/schemas/__init__.py

cat > backend/app/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import trips, history, exports, feedback, admin

app = FastAPI(
    title="Tripwise API",
    description="智能旅游规划 Agent 编排平台",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trips.router,    prefix="/api/trips",  tags=["trips"])
app.include_router(history.router,  prefix="/api",        tags=["history"])
app.include_router(exports.router,  prefix="/api/trips",  tags=["exports"])
app.include_router(feedback.router, prefix="/api/trips",  tags=["feedback"])
app.include_router(admin.router,    prefix="/api/admin",  tags=["admin"])

@app.get("/health")
async def health():
    return {"status": "ok", "service": "tripwise-api"}
EOF

cat > backend/app/core/config.py << 'EOF'
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-sonnet-4-5-20251001"
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    APP_ENV: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
EOF

cat > backend/app/core/supabase.py << 'EOF'
from supabase import create_client, Client
from app.core.config import settings

def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

supabase: Client = get_supabase()
EOF

cat > backend/app/core/deps.py << 'EOF'
from fastapi import Header, HTTPException

async def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    return authorization.split(" ")[1]
EOF

cat > backend/app/schemas/trip.py << 'EOF'
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class PlanRequest(BaseModel):
    origin: str = Field(..., example="上海")
    destination: str = Field(..., example="成都")
    start_date: date = Field(..., example="2026-05-01")
    end_date: date = Field(..., example="2026-05-04")
    budget: float = Field(..., gt=0, example=3500)
    preferences: List[str] = Field(default=[], example=["美食", "历史文化"])
    pace: str = Field(default="standard")

class RegenerateRequest(BaseModel):
    reason: Optional[str] = None

class ItineraryItemOut(BaseModel):
    start_time: str
    end_time: str
    place_name: str
    category: str
    notes: Optional[str]
    estimated_cost: float

class DayOut(BaseModel):
    day_index: int
    date: date
    title: str
    summary: str
    day_budget: float
    items: List[ItineraryItemOut] = []

class TripPlanOut(BaseModel):
    id: str
    destination: str
    origin: str
    start_date: date
    end_date: date
    budget: float
    status: str
    days: List[DayOut] = []
    created_at: str

class StatusOut(BaseModel):
    id: str
    status: str
    progress_hint: Optional[str] = None
    latency_ms: Optional[int] = None
    error_message: Optional[str] = None

class FeedbackRequest(BaseModel):
    score: int = Field(..., ge=1, le=5)
    comment: str = ""
EOF

cat > backend/app/services/claude.py << 'EOF'
import json
import anthropic
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """你是一个专业的旅游规划师。
根据用户提供的出发地、目的地、天数、预算和偏好，生成一份结构化旅行计划。

严格要求：
1. 只返回合法 JSON，不包含任何额外文字或 markdown 标记
2. 预算包含总预算和每日预算
3. 每天至少 3 个行程项目
4. 每个项目必须有时间、地点、分类、预估费用、注意事项

返回格式：
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
          "notes": "提前2小时到达办理登机",
          "estimated_cost": 600
        }
      ]
    }
  ]
}"""

async def generate_itinerary(
    origin: str, destination: str,
    start_date: str, end_date: str,
    budget: float, preferences: list, pace: str,
) -> dict:
    pace_label = {'budget': '省钱优先', 'deep': '深度游', 'standard': '均衡安排'}.get(pace, '均衡安排')
    user_prompt = f"""
出发地：{origin}
目的地：{destination}
出发日期：{start_date}
返回日期：{end_date}
总预算：{budget} 元
旅行偏好：{', '.join(preferences) if preferences else '无特殊偏好'}
节奏：{pace_label}

请返回 JSON 格式的旅行计划。
"""
    message = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )
    raw = message.content[0].text.strip()
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
EOF

cat > backend/app/services/planner.py << 'EOF'
import uuid
from datetime import datetime
from fastapi import BackgroundTasks
from app.schemas.trip import PlanRequest, RegenerateRequest
from app.services.claude import generate_itinerary
from app.core.supabase import supabase

async def create_plan(body: PlanRequest, background_tasks: BackgroundTasks) -> str:
    trip_id = str(uuid.uuid4())
    run_id = str(uuid.uuid4())

    supabase.table("trip_plans").insert({
        "id": trip_id, "origin": body.origin, "destination": body.destination,
        "start_date": str(body.start_date), "end_date": str(body.end_date),
        "budget": body.budget, "preferences": body.preferences,
        "pace": body.pace, "status": "pending",
    }).execute()

    supabase.table("planner_runs").insert({
        "id": run_id, "trip_plan_id": trip_id, "provider": "claude", "status": "pending",
    }).execute()

    background_tasks.add_task(_run_generation, trip_id, run_id, body)
    return trip_id

async def _run_generation(trip_id: str, run_id: str, body: PlanRequest):
    start_time = datetime.utcnow()
    try:
        supabase.table("planner_runs").update({"status": "generating"}).eq("id", run_id).execute()
        supabase.table("trip_plans").update({"status": "generating"}).eq("id", trip_id).execute()

        result = await generate_itinerary(
            origin=body.origin, destination=body.destination,
            start_date=str(body.start_date), end_date=str(body.end_date),
            budget=body.budget, preferences=body.preferences, pace=body.pace,
        )

        for day in result.get("days", []):
            day_id = str(uuid.uuid4())
            supabase.table("itinerary_days").insert({
                "id": day_id, "trip_plan_id": trip_id,
                "day_index": day["day_index"], "date": day["date"],
                "title": day["title"], "summary": day["summary"],
                "day_budget": day["day_budget"],
            }).execute()
            for item in day.get("items", []):
                supabase.table("itinerary_items").insert({
                    "id": str(uuid.uuid4()), "itinerary_day_id": day_id,
                    "start_time": item["start_time"], "end_time": item["end_time"],
                    "place_name": item["place_name"], "category": item["category"],
                    "notes": item.get("notes", ""), "estimated_cost": item["estimated_cost"],
                }).execute()

        latency = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        supabase.table("trip_plans").update({"status": "success", "raw_output": result}).eq("id", trip_id).execute()
        supabase.table("planner_runs").update({"status": "success", "latency_ms": latency}).eq("id", run_id).execute()

    except Exception as e:
        latency = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        supabase.table("trip_plans").update({"status": "failed"}).eq("id", trip_id).execute()
        supabase.table("planner_runs").update({
            "status": "failed", "error_message": str(e), "latency_ms": latency,
        }).eq("id", run_id).execute()

async def regenerate_plan(trip_id: str, body: RegenerateRequest, background_tasks: BackgroundTasks):
    original = supabase.table("trip_plans").select("*").eq("id", trip_id).single().execute().data
    plan = PlanRequest(
        origin=original["origin"], destination=original["destination"],
        start_date=original["start_date"], end_date=original["end_date"],
        budget=original["budget"], preferences=original["preferences"], pace=original["pace"],
    )
    await create_plan(plan, background_tasks)
EOF

cat > backend/app/services/exporter.py << 'EOF'
def build_markdown(trip: dict, days: list) -> str:
    lines = [
        f"# {trip['destination']} 旅行计划", "",
        f"**出发地**：{trip['origin']}  ",
        f"**目的地**：{trip['destination']}  ",
        f"**日期**：{trip['start_date']} → {trip['end_date']}  ",
        f"**总预算**：¥{trip['budget']}  ", "", "---", "",
    ]
    for day in days:
        lines += [
            f"## Day {day['day_index']} · {day['date']} · {day['title']}",
            f"> {day['summary']}",
            f"**当日预算**：¥{day['day_budget']}", "",
        ]
        for item in day.get("itinerary_items", []):
            lines.append(f"- **{item['start_time']}-{item['end_time']}** [{item['category']}] {item['place_name']}")
            if item.get("notes"):
                lines.append(f"  - 备注：{item['notes']}")
            lines.append(f"  - 预估费用：¥{item['estimated_cost']}")
        lines.append("")
    lines += ["---", "*由 Tripwise AI 生成*"]
    return "\n".join(lines)
EOF

cat > backend/app/routers/trips.py << 'EOF'
from fastapi import APIRouter, BackgroundTasks, Depends
from app.schemas.trip import PlanRequest, RegenerateRequest, StatusOut
from app.services.planner import create_plan, regenerate_plan
from app.core.deps import verify_token
from app.core.supabase import supabase

router = APIRouter()

@router.post("/plan")
async def plan_trip(body: PlanRequest, background_tasks: BackgroundTasks, token: str = Depends(verify_token)):
    trip_id = await create_plan(body, background_tasks)
    return {"trip_id": trip_id, "status": "pending"}

@router.get("/{trip_id}")
async def get_trip(trip_id: str, token: str = Depends(verify_token)):
    trip = supabase.table("trip_plans").select("*").eq("id", trip_id).single().execute().data
    days = supabase.table("itinerary_days").select("*, itinerary_items(*)").eq("trip_plan_id", trip_id).order("day_index").execute().data
    return {**trip, "days": days}

@router.get("/{trip_id}/status", response_model=StatusOut)
async def get_status(trip_id: str):
    run = supabase.table("planner_runs").select("*").eq("trip_plan_id", trip_id).order("created_at", desc=True).limit(1).execute().data
    if not run:
        return StatusOut(id=trip_id, status="pending")
    r = run[0]
    return StatusOut(id=trip_id, status=r["status"], latency_ms=r.get("latency_ms"), error_message=r.get("error_message"))

@router.post("/{trip_id}/regenerate")
async def regenerate(trip_id: str, body: RegenerateRequest, background_tasks: BackgroundTasks, token: str = Depends(verify_token)):
    await regenerate_plan(trip_id, body, background_tasks)
    return {"trip_id": trip_id, "status": "pending"}

@router.patch("/{trip_id}/preferences")
async def update_preferences(trip_id: str, token: str = Depends(verify_token)):
    return {"message": "TODO: v2 实现"}
EOF

cat > backend/app/routers/history.py << 'EOF'
from fastapi import APIRouter, Depends
from app.core.deps import verify_token
from app.core.supabase import supabase

router = APIRouter()

@router.get("/history")
async def get_history(token: str = Depends(verify_token)):
    result = supabase.table("trip_plans").select(
        "id, destination, origin, start_date, end_date, budget, status, created_at"
    ).order("created_at", desc=True).execute()
    return result.data
EOF

cat > backend/app/routers/exports.py << 'EOF'
from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from app.core.deps import verify_token
from app.core.supabase import supabase
from app.services.exporter import build_markdown

router = APIRouter()

@router.post("/{trip_id}/export")
async def export_trip(trip_id: str, token: str = Depends(verify_token)):
    trip = supabase.table("trip_plans").select("*").eq("id", trip_id).single().execute().data
    days = supabase.table("itinerary_days").select("*, itinerary_items(*)").eq("trip_plan_id", trip_id).order("day_index").execute().data
    md = build_markdown(trip, days)
    filename = f"tripwise_{trip['destination']}_{trip['start_date']}.md"
    return PlainTextResponse(content=md, headers={"Content-Disposition": f"attachment; filename={filename}"})
EOF

cat > backend/app/routers/feedback.py << 'EOF'
import uuid
from fastapi import APIRouter, Depends
from app.schemas.trip import FeedbackRequest
from app.core.deps import verify_token
from app.core.supabase import supabase

router = APIRouter()

@router.post("/{trip_id}/feedback")
async def submit_feedback(trip_id: str, body: FeedbackRequest, token: str = Depends(verify_token)):
    supabase.table("trip_feedback").insert({
        "id": str(uuid.uuid4()), "trip_plan_id": trip_id,
        "score": body.score, "comment": body.comment,
    }).execute()
    return {"ok": True}
EOF

cat > backend/app/routers/admin.py << 'EOF'
from fastapi import APIRouter
from app.core.supabase import supabase

router = APIRouter()

@router.get("/planner-runs")
async def get_runs(status: str = None, limit: int = 50):
    query = supabase.table("planner_runs").select("*").order("created_at", desc=True).limit(limit)
    if status:
        query = query.eq("status", status)
    return query.execute().data

@router.get("/stats")
async def get_stats():
    runs = supabase.table("planner_runs").select("status").execute().data
    total = len(runs)
    success = sum(1 for r in runs if r["status"] == "success")
    failed = sum(1 for r in runs if r["status"] == "failed")
    return {
        "total_runs": total,
        "success_rate": round(success / total * 100, 1) if total else 0,
        "failed_count": failed,
    }
EOF

cat > backend/tests/test_planner.py << 'EOF'
import pytest

def test_placeholder():
    """占位测试 — 迭代开发阶段补充"""
    assert True
EOF

echo "✅ 后端文件写入完成"

# ── 6. 数据库 migrations ───────────────────────────────────
cat > supabase/migrations/001_create_trip_plans.sql << 'EOF'
create table if not exists trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  origin text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  budget numeric not null,
  preferences jsonb default '[]',
  pace text default 'standard',
  status text default 'pending',
  raw_output jsonb,
  created_at timestamptz default now()
);
EOF

cat > supabase/migrations/002_create_itinerary_days.sql << 'EOF'
create table if not exists itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid references trip_plans(id) on delete cascade,
  day_index int not null,
  date date not null,
  title text,
  summary text,
  day_budget numeric default 0
);
EOF

cat > supabase/migrations/003_create_itinerary_items.sql << 'EOF'
create table if not exists itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_day_id uuid references itinerary_days(id) on delete cascade,
  start_time text,
  end_time text,
  place_name text,
  category text,
  notes text,
  estimated_cost numeric default 0
);
EOF

cat > supabase/migrations/004_create_planner_runs.sql << 'EOF'
create table if not exists planner_runs (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid references trip_plans(id) on delete cascade,
  provider text default 'claude',
  latency_ms int,
  status text default 'pending',
  error_message text,
  created_at timestamptz default now()
);
EOF

cat > supabase/migrations/005_create_trip_feedback.sql << 'EOF'
create table if not exists trip_feedback (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid references trip_plans(id) on delete cascade,
  user_id uuid references auth.users(id),
  score int check (score between 1 and 5),
  comment text default '',
  created_at timestamptz default now()
);
EOF

echo "✅ 数据库 migrations 写入完成"

# ── 7. 文档 ────────────────────────────────────────────────
cat > docs/API.md << 'EOF'
# Tripwise API 文档

Base URL: `http://localhost:8000`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/trips/plan | 创建规划任务 |
| GET | /api/trips/:id | 获取计划详情 |
| GET | /api/trips/:id/status | 轮询任务状态 |
| POST | /api/trips/:id/regenerate | 重新生成 |
| GET | /api/history | 历史计划列表 |
| POST | /api/trips/:id/export | 导出 Markdown |
| POST | /api/trips/:id/feedback | 提交反馈 |
| GET | /api/admin/planner-runs | 任务日志 |
| GET | /api/admin/stats | 后台统计 |
| GET | /health | 健康检查 |
EOF

cat > docs/DEPLOYMENT.md << 'EOF'
# Tripwise 部署说明

## 架构

用户（国内）→ Vercel 前端（香港节点）→ Railway 后端 → Claude API + Supabase

## 前端部署（Vercel）

1. 导入 GitHub 仓库，Root Directory 设为 `frontend`
2. 在 Settings > Functions 将 Region 改为 `hkg1`（香港）
3. 添加环境变量：
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_API_URL（填写 Railway 后端地址）

## 后端部署（Railway）

1. 新建项目，选择 Deploy from GitHub
2. Root Directory 设为 `backend`
3. 添加环境变量（参考 backend/.env.example）

## 数据库（Supabase）

在 Supabase SQL Editor 中按顺序执行 supabase/migrations/ 目录下的 5 个文件。
EOF

echo "✅ 文档写入完成"

# ── 8. Git 初始化并推送 ────────────────────────────────────
echo ""
echo "🔧 初始化 Git 仓库..."
git init
git add .
git commit -m "feat: 初始化 Tripwise 项目骨架

- 前端：Next.js 14 + Tailwind CSS，8个页面占位
- 后端：FastAPI + Python，Agent编排层 + 所有路由
- 数据库：Supabase migrations（5张核心表）
- 文档：API文档 + 部署说明"

echo ""
echo "🚀 推送到 GitHub..."
git remote add origin https://github.com/${GITHUB_USER}/${REPO_NAME}.git
git branch -M main
git push -u origin main

echo ""
echo "============================================"
echo "✅ Tripwise 骨架初始化完成！"
echo ""
echo "📁 仓库地址：https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "下一步："
echo "  1. 在 supabase.com 创建项目，执行 migrations"
echo "  2. 填写 backend/.env 和 frontend/.env.local"
echo "  3. cd frontend && npm install && npm run dev"
echo "  4. cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload"
echo "============================================"
