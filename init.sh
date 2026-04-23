#!/bin/bash
# Tripwise 仓库骨架一键初始化脚本
# 用法：bash init.sh
# 作者：kai-ai-dev

set -e

echo "🚀 开始初始化 Tripwise 项目骨架..."

# ─── 根目录文件 ───────────────────────────────────────
touch README.md .gitignore

# ─── 前端 frontend/ ───────────────────────────────────
mkdir -p frontend/src/app/{planner,trips,history,exports,login}
mkdir -p frontend/src/app/admin/{runs}
mkdir -p frontend/src/components/{form,trip,budget,shared}
mkdir -p frontend/src/lib
mkdir -p frontend/src/types
mkdir -p frontend/public

touch frontend/src/app/layout.tsx
touch frontend/src/app/page.tsx                        # 官网首页 www:/
touch frontend/src/app/login/page.tsx                  # 登录页 app:/login
touch frontend/src/app/planner/page.tsx                # 规划页 app:/planner
touch frontend/src/app/trips/\[id\]/page.tsx           # 行程详情页 app:/trips/:id
touch frontend/src/app/history/page.tsx                # 历史计划页 app:/history
touch frontend/src/app/exports/page.tsx                # 导出反馈页 app:/exports
touch frontend/src/app/admin/page.tsx                  # 后台首页 admin:/
touch frontend/src/app/admin/runs/page.tsx             # 任务反馈页 admin:/runs

touch frontend/src/components/form/PlannerForm.tsx     # 旅行需求表单
touch frontend/src/components/form/PreferenceSelector.tsx
touch frontend/src/components/trip/DayCard.tsx         # Day by Day 行程卡片
touch frontend/src/components/trip/ItineraryItem.tsx
touch frontend/src/components/trip/StatusBar.tsx       # 任务进度状态条
touch frontend/src/components/budget/BudgetBreakdown.tsx  # 预算拆分卡片
touch frontend/src/components/shared/HistoryList.tsx   # 历史记录列表
touch frontend/src/components/shared/ErrorRetry.tsx    # 错误重试组件
touch frontend/src/components/shared/ExportButton.tsx

touch frontend/src/lib/supabase.ts                     # Supabase 客户端
touch frontend/src/lib/api.ts                          # 前端 API 请求封装
touch frontend/src/types/trip.ts                       # 共享类型定义

touch frontend/next.config.ts
touch frontend/tailwind.config.ts
touch frontend/tsconfig.json
touch frontend/package.json
touch frontend/.env.local.example

# ─── 后端 backend/ ────────────────────────────────────
mkdir -p backend/app/{routers,services,models,schemas,core}
mkdir -p backend/tests

touch backend/app/main.py                              # FastAPI 入口
touch backend/app/core/config.py                       # 环境变量配置
touch backend/app/core/supabase.py                     # Supabase 客户端
touch backend/app/core/deps.py                         # 依赖注入（auth校验）

touch backend/app/routers/trips.py                     # /api/trips/* 路由
touch backend/app/routers/history.py                   # /api/history 路由
touch backend/app/routers/exports.py                   # /api/trips/:id/export
touch backend/app/routers/feedback.py                  # /api/trips/:id/feedback
touch backend/app/routers/admin.py                     # /api/admin/* 路由

touch backend/app/services/planner.py                  # Agent 编排核心逻辑
touch backend/app/services/claude.py                   # Claude API 调用封装
touch backend/app/services/exporter.py                 # Markdown 导出逻辑

touch backend/app/models/trip.py                       # Pydantic 数据模型
touch backend/app/schemas/trip.py                      # 请求/响应 Schema

touch backend/tests/test_planner.py
touch backend/requirements.txt
touch backend/.env.example
touch backend/Dockerfile

# ─── 数据库 supabase/ ─────────────────────────────────
mkdir -p supabase/migrations

touch supabase/migrations/001_create_trip_plans.sql
touch supabase/migrations/002_create_itinerary_days.sql
touch supabase/migrations/003_create_itinerary_items.sql
touch supabase/migrations/004_create_planner_runs.sql
touch supabase/migrations/005_create_trip_feedback.sql
touch supabase/schema.sql                              # 完整 schema 汇总

# ─── 文档 docs/ ───────────────────────────────────────
mkdir -p docs
touch docs/PRD.md
touch docs/API.md
touch docs/DEPLOYMENT.md

echo "✅ 目录骨架创建完成！"
echo ""
echo "📁 目录结构："
find . -not -path './.git/*' | sort | head -80
