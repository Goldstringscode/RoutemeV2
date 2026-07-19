-- ============================================================
-- RouteMeV2 — Saved Routes (pre-planned route templates)
-- ============================================================

create table if not exists public.saved_routes (
  id uuid default gen_random_uuid() primary key,
  nurse_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  stops uuid[] not null default '{}',  -- ordered array of client IDs
  stop_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table public.saved_routes enable row level security;

create policy "Saved routes select own"
  on saved_routes for select
  using (auth.uid() = nurse_id);

create policy "Saved routes insert own"
  on saved_routes for insert
  with check (auth.uid() = nurse_id);

create policy "Saved routes update own"
  on saved_routes for update
  using (auth.uid() = nurse_id);

create policy "Saved routes delete own"
  on saved_routes for delete
  using (auth.uid() = nurse_id);

-- Index for fast lookups
create index if not exists idx_saved_routes_nurse
  on saved_routes (nurse_id);