-- ============================================================
-- RouteMeV2 — Initial Schema
-- ============================================================

-- 1. Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null default '',
  title text default '',
  license text default '',
  region text default '',
  avatar_url text default '',
  weekly_saved_minutes int default 214,
  weekly_saved_miles numeric default 38.4,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Clients table
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  nurse_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  initials text default '',
  dob date,
  phone text default '',
  address text not null,
  time_window text default '',
  duration int default 30,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  flags text[] default '{}',
  condition text default '',
  last_visit text default 'New client',
  lat numeric,
  lng numeric,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Schedule / visit order (one row per visit per day)
create table public.schedules (
  id uuid default gen_random_uuid() primary key,
  nurse_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  visit_date date not null default current_date,
  sort_order int not null,
  created_at timestamptz default now(),
  unique(nurse_id, client_id, visit_date)
);

-- 5. Visit notes (voice transcriptions)
create table public.visit_notes (
  id uuid default gen_random_uuid() primary key,
  nurse_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

-- 6. Audit log (HIPAA compliance)
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  nurse_id uuid references public.profiles(id) on delete cascade not null,
  label text not null,
  type text default 'read' check (type in ('read', 'write', 'note', 'route')),
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.schedules enable row level security;
alter table public.visit_notes enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: users can only see and edit their own profile
create policy "Profiles select own"
  on profiles for select
  using (auth.uid() = id);

create policy "Profiles insert own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Profiles update own"
  on profiles for update
  using (auth.uid() = id);

-- Clients: nurses see only their clients
create policy "Clients select own"
  on clients for select
  using (auth.uid() = nurse_id);

create policy "Clients insert own"
  on clients for insert
  with check (auth.uid() = nurse_id);

create policy "Clients update own"
  on clients for update
  using (auth.uid() = nurse_id);

create policy "Clients delete own"
  on clients for delete
  using (auth.uid() = nurse_id);

-- Schedules: nurses see only their schedule
create policy "Schedules select own"
  on schedules for select
  using (auth.uid() = nurse_id);

create policy "Schedules insert own"
  on schedules for insert
  with check (auth.uid() = nurse_id);

create policy "Schedules update own"
  on schedules for update
  using (auth.uid() = nurse_id);

create policy "Schedules delete own"
  on schedules for delete
  using (auth.uid() = nurse_id);

-- Notes: nurses see only their notes
create policy "Notes select own"
  on visit_notes for select
  using (auth.uid() = nurse_id);

create policy "Notes insert own"
  on visit_notes for insert
  with check (auth.uid() = nurse_id);

-- Audit logs: nurses see only their audit trail
create policy "Audit select own"
  on audit_logs for select
  using (auth.uid() = nurse_id);

create policy "Audit insert own"
  on audit_logs for insert
  with check (auth.uid() = nurse_id);

-- ============================================================
-- Seed data: demo nurse profile
-- Demo user UUID: 8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433
--   Email: amara.okafor@nurse.demo
--   Password: demo1234
-- ============================================================

insert into public.profiles (id, name, title, license, region, avatar_url)
values (
  '8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433',
  'Amara Okafor, RN',
  'Registered Nurse · Home Health',
  'RN #2418906',
  'Corona · Zone 3',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHxudXJzZSUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwwfHx8fDE3ODQyMzM0OTl8MA&ixlib=rb-4.1.0&q=85'
) on conflict (id) do nothing;