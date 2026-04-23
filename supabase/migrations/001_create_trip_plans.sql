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
