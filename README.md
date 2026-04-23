# Tripwise — 智能旅游规划 Agent 平台

> 一次表单提交，生成可执行的结构化旅行计划。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 App Router + TypeScript + Tailwind CSS |
| 后端 | FastAPI + Python |
| Agent | Anthropic Claude API |
| 数据库 | Supabase (PostgreSQL) |
| 鉴权 | Supabase Auth |
| 部署 | Vercel（前端）+ Railway（后端）|

## 项目结构

```
tripwise/
├── frontend/          # Next.js 前端
├── backend/           # FastAPI 后端 + Agent 编排
├── supabase/          # 数据库 migrations
├── docs/              # PRD、API 文档
└── README.md
```

## 快速开始

```bash
git clone https://github.com/kai-ai-dev/tripwise.git
cd tripwise

# 前端
cp frontend/.env.local.example frontend/.env.local
cd frontend && npm install && npm run dev

# 后端
cp backend/.env.example backend/.env
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
```

## MVP 功能

- [x] 规划表单页
- [x] 行程详情页（Day by Day + 预算拆分）
- [x] 历史计划页
- [x] 计划保存与重生成
- [x] Markdown 导出（PDF 占位）
- [x] 后台任务与失败日志

## 文档

- [PRD](./docs/PRD.md) | [API 文档](./docs/API.md) | [部署说明](./docs/DEPLOYMENT.md)
