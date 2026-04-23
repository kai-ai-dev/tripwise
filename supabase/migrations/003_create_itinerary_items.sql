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
