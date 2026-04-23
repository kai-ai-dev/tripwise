create table if not exists planner_runs (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid references trip_plans(id) on delete cascade,
  provider text default 'claude',
  latency_ms int,
  status text default 'pending',
  error_message text,
  created_at timestamptz default now()
);
