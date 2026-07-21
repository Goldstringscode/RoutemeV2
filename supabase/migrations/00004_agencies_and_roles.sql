-- ============================================================
-- RouteMeV2 — Migration 00004: Agencies, Roles & Multi-Tenant RLS
-- ============================================================
-- This migration adds:
--   1. agencies table (top-level tenant)
--   2. invitations table (for inviting agency members)
--   3. role + agency_id columns to profiles
--   4. agency_id columns to clients, schedules
--   5. Helper function get_user_role()
--   6. Complete RLS overhaul for all tables
-- ============================================================

-- ============================================================
-- PART 1: Create new tables
-- ============================================================

-- 1a. Agencies table — the top-level tenant
create table if not exists public.agencies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  subscription_tier text not null default 'starter'
    check (subscription_tier in ('starter', 'pro', 'business', 'enterprise')),
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1b. Invitations table — for inviting agency members via email
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  agency_id uuid not null references public.agencies(id) on delete cascade,
  email text not null,
  role text not null check (role in ('agency_admin', 'nurse')),
  token text not null unique,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- ============================================================
-- PART 2: Add columns to existing tables
-- ============================================================

-- 2a. Profiles: add role and agency_id
alter table public.profiles
  add column if not exists role text not null default 'nurse'
    check (role in ('super_admin', 'agency_admin', 'nurse'));

alter table public.profiles
  add column if not exists agency_id uuid references public.agencies(id) on delete set null;

-- 2b. Clients: add agency_id
alter table public.clients
  add column if not exists agency_id uuid references public.agencies(id) on delete cascade;

-- 2c. Schedules: add agency_id
alter table public.schedules
  add column if not exists agency_id uuid references public.agencies(id) on delete cascade;

-- 2d. Visit notes: add agency_id
alter table public.visit_notes
  add column if not exists agency_id uuid references public.agencies(id) on delete cascade;

-- 2e. Audit logs: add agency_id
alter table public.audit_logs
  add column if not exists agency_id uuid references public.agencies(id) on delete cascade;

-- 2f. Saved routes: add agency_id
alter table public.saved_routes
  add column if not exists agency_id uuid references public.agencies(id) on delete cascade;

-- ============================================================
-- PART 3: Helper function for role-based RLS
-- ============================================================

create or replace function public.get_user_role()
returns text
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.get_user_agency_id()
returns uuid
language sql
stable
security definer
as $$
  select agency_id from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- PART 4: Enable RLS on new tables
-- ============================================================

alter table public.agencies enable row level security;
alter table public.invitations enable row level security;

-- ============================================================
-- PART 5: RLS policies for agencies table
-- ============================================================

-- Super admin: full access to all agencies
create policy "agencies_super_admin_all"
  on agencies
  for all
  using (public.get_user_role() = 'super_admin')
  with check (public.get_user_role() = 'super_admin');

-- Agency admin: read own agency
create policy "agencies_agency_admin_select"
  on agencies
  for select
  using (public.get_user_role() = 'agency_admin' and id = public.get_user_agency_id());

-- Nurse: read own agency
create policy "agencies_nurse_select"
  on agencies
  for select
  using (public.get_user_role() = 'nurse' and id = public.get_user_agency_id());

-- ============================================================
-- PART 6: RLS policies for invitations
-- ============================================================

-- Super admin: full access
create policy "invitations_super_admin_all"
  on invitations
  for all
  using (public.get_user_role() = 'super_admin')
  with check (public.get_user_role() = 'super_admin');

-- Agency admin: manage own agency's invitations
create policy "invitations_agency_admin_select"
  on invitations
  for select
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

create policy "invitations_agency_admin_insert"
  on invitations
  for insert
  with check (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

create policy "invitations_agency_admin_delete"
  on invitations
  for delete
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

-- ============================================================
-- PART 7: Update RLS policies for profiles
-- ============================================================

-- Drop existing policies
drop policy if exists "Profiles select own" on profiles;
drop policy if exists "Profiles insert own" on profiles;
drop policy if exists "Profiles update own" on profiles;

-- Super admin: see all profiles
create policy "profiles_super_admin_select"
  on profiles
  for select
  using (public.get_user_role() = 'super_admin');

-- Agency admin: see profiles in their agency
create policy "profiles_agency_admin_select"
  on profiles
  for select
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

-- Everyone: see their own profile
create policy "profiles_self_select"
  on profiles
  for select
  using (auth.uid() = id);

-- Everyone: insert their own profile
create policy "profiles_self_insert"
  on profiles
  for insert
  with check (auth.uid() = id);

-- Everyone: update their own profile
create policy "profiles_self_update"
  on profiles
  for update
  using (auth.uid() = id);

-- Super admin: update any profile
create policy "profiles_super_admin_update"
  on profiles
  for update
  using (public.get_user_role() = 'super_admin');

-- ============================================================
-- PART 8: Update RLS policies for clients
-- ============================================================

drop policy if exists "Clients select own" on clients;
drop policy if exists "Clients insert own" on clients;
drop policy if exists "Clients update own" on clients;
drop policy if exists "Clients delete own" on clients;

-- Super admin: see all clients
create policy "clients_super_admin_select"
  on clients
  for select
  using (public.get_user_role() = 'super_admin');

-- Agency admin: see clients in their agency
create policy "clients_agency_admin_select"
  on clients
  for select
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

-- Nurse: see their own clients
create policy "clients_nurse_select"
  on clients
  for select
  using (auth.uid() = nurse_id);

-- Nurse: insert their own clients
create policy "clients_nurse_insert"
  on clients
  for insert
  with check (auth.uid() = nurse_id);

-- Nurse: update their own clients
create policy "clients_nurse_update"
  on clients
  for update
  using (auth.uid() = nurse_id);

-- Nurse: delete their own clients
create policy "clients_nurse_delete"
  on clients
  for delete
  using (auth.uid() = nurse_id);

-- Agency admin: insert clients for their agency
create policy "clients_agency_admin_insert"
  on clients
  for insert
  with check (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

-- Agency admin: update clients in their agency
create policy "clients_agency_admin_update"
  on clients
  for update
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

-- Agency admin: delete clients in their agency
create policy "clients_agency_admin_delete"
  on clients
  for delete
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

-- ============================================================
-- PART 9: Update RLS policies for schedules
-- ============================================================

drop policy if exists "Schedules select own" on schedules;
drop policy if exists "Schedules insert own" on schedules;
drop policy if exists "Schedules update own" on schedules;

-- Super admin: see all schedules
create policy "schedules_super_admin_select"
  on schedules
  for select
  using (public.get_user_role() = 'super_admin');

-- Agency admin: see schedules in their agency
create policy "schedules_agency_admin_select"
  on schedules
  for select
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

-- Nurse: see their own schedules
create policy "schedules_nurse_select"
  on schedules
  for select
  using (auth.uid() = nurse_id);

-- Nurse: insert their own schedules
create policy "schedules_nurse_insert"
  on schedules
  for insert
  with check (auth.uid() = nurse_id);

-- Nurse: update their own schedules
create policy "schedules_nurse_update"
  on schedules
  for update
  using (auth.uid() = nurse_id);

-- Nurse: delete their own schedules
create policy "schedules_nurse_delete"
  on schedules
  for delete
  using (auth.uid() = nurse_id);

-- Agency admin: manage schedules in their agency
create policy "schedules_agency_admin_insert"
  on schedules
  for insert
  with check (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

create policy "schedules_agency_admin_update"
  on schedules
  for update
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

create policy "schedules_agency_admin_delete"
  on schedules
  for delete
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

-- ============================================================
-- PART 10: Update RLS policies for visit_notes
-- ============================================================

drop policy if exists "Visit notes select own" on visit_notes;
drop policy if exists "Visit notes insert own" on visit_notes;
drop policy if exists "Visit notes update own" on visit_notes;
drop policy if exists "Visit notes delete own" on visit_notes;

-- Super admin: see all notes
create policy "notes_super_admin_select"
  on visit_notes
  for select
  using (public.get_user_role() = 'super_admin');

-- Agency admin: see notes in their agency
create policy "notes_agency_admin_select"
  on visit_notes
  for select
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

-- Nurse: see their own notes
create policy "notes_nurse_select"
  on visit_notes
  for select
  using (auth.uid() = nurse_id);

-- Nurse: insert their own notes
create policy "notes_nurse_insert"
  on visit_notes
  for insert
  with check (auth.uid() = nurse_id);

-- Nurse: update their own notes
create policy "notes_nurse_update"
  on visit_notes
  for update
  using (auth.uid() = nurse_id);

-- Nurse: delete their own notes
create policy "notes_nurse_delete"
  on visit_notes
  for delete
  using (auth.uid() = nurse_id);

-- ============================================================
-- PART 11: Update RLS policies for audit_logs
-- ============================================================

drop policy if exists "Audit logs select own" on audit_logs;
drop policy if exists "Audit logs insert own" on audit_logs;

-- Super admin: see all audit logs
create policy "audit_super_admin_select"
  on audit_logs
  for select
  using (public.get_user_role() = 'super_admin');

-- Agency admin: see audit logs in their agency
create policy "audit_agency_admin_select"
  on audit_logs
  for select
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

-- Nurse: see their own audit logs
create policy "audit_nurse_select"
  on audit_logs
  for select
  using (auth.uid() = nurse_id);

-- Everyone: insert audit logs (used by all)
create policy "audit_all_insert"
  on audit_logs
  for insert
  with check (auth.uid() = nurse_id);

-- ============================================================
-- PART 12: Update RLS policies for saved_routes
-- ============================================================

drop policy if exists "Saved routes select own" on saved_routes;
drop policy if exists "Saved routes insert own" on saved_routes;
drop policy if exists "Saved routes update own" on saved_routes;
drop policy if exists "Saved routes delete own" on saved_routes;

-- Super admin: see all saved routes
create policy "routes_super_admin_select"
  on saved_routes
  for select
  using (public.get_user_role() = 'super_admin');

-- Agency admin: see saved routes in their agency
create policy "routes_agency_admin_select"
  on saved_routes
  for select
  using (public.get_user_role() = 'agency_admin' and agency_id = public.get_user_agency_id());

-- Nurse: see their own saved routes
create policy "routes_nurse_select"
  on saved_routes
  for select
  using (auth.uid() = nurse_id);

-- Nurse: insert their own saved routes
create policy "routes_nurse_insert"
  on saved_routes
  for insert
  with check (auth.uid() = nurse_id);

-- Nurse: update their own saved routes
create policy "routes_nurse_update"
  on saved_routes
  for update
  using (auth.uid() = nurse_id);

-- Nurse: delete their own saved routes
create policy "routes_nurse_delete"
  on saved_routes
  for delete
  using (auth.uid() = nurse_id);

-- ============================================================
-- PART 13: Indexes for performance
-- ============================================================

create index if not exists idx_profiles_role on profiles (role);
create index if not exists idx_profiles_agency on profiles (agency_id);
create index if not exists idx_clients_agency on clients (agency_id);
create index if not exists idx_schedules_agency on schedules (agency_id);
create index if not exists idx_invitations_agency on invitations (agency_id);
create index if not exists idx_invitations_token on invitations (token);
create index if not exists idx_agencies_slug on agencies (slug);

-- ============================================================
-- END OF MIGRATION 00004
-- ============================================================