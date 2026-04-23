create table if not exists itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid references trip_plans(id) on delete cascade,
  day_index int not null,
  date date not null,
  title text,
  summary text,
  day_budget numeric default 0
);
