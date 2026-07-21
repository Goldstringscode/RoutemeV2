-- RouteMeV2 — Test data setup
-- This creates a test agency and updates the demo nurse profile

-- 1. Create a real agency for the demo
INSERT INTO public.agencies (name, slug, subscription_tier, subscription_status, settings)
VALUES (
  'Corona Home Health Services',
  'corona-home-health',
  'pro',
  'active',
  '{"timezone": "America/Los_Angeles"}'
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Show all agencies
SELECT id, name, slug, subscription_tier, subscription_status 
FROM public.agencies 
ORDER BY created_at DESC;