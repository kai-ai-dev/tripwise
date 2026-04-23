create table if not exists trip_feedback (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid references trip_plans(id) on delete cascade,
  user_id uuid references auth.users(id),
  score int check (score between 1 and 5),
  comment text default '',
  created_at timestamptz default now()
);
