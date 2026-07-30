-- ============================================================
-- RouteMeV2 — Migration 00005: Stripe Subscriptions
-- ============================================================

-- 1. Add stripe columns to agencies
alter table public.agencies
  add column if not exists stripe_price_id text,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_tier text
    default 'solo' check (subscription_tier in ('solo', 'growth', 'scale', 'enterprise')),
  add column if not exists subscription_status text
    default 'inactive' check (subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'inactive')),
  add column if not exists billing_interval text
    default 'monthly' check (billing_interval in ('monthly', 'annual'));

-- 2. Webhook dedup table (idempotency)
create table if not exists public.webhook_events (
  id text primary key,  -- Stripe event id (evt_xxx)
  type text not null,
  status text not null default 'processed',
  created_at timestamptz default now()
);

alter table public.webhook_events enable row level security;

-- Service role access for webhook processing
create policy "webhook_events_service_only"
  on webhook_events
  for all
  using (true)
  with check (true);

create index if not exists idx_webhook_events_type on webhook_events (type);
create index if not exists idx_webhook_events_created on webhook_events (created_at);