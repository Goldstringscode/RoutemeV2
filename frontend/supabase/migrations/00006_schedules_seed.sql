-- ============================================================
-- RouteMe — Create schedules table + seed today's schedule
-- Run this AFTER supabase-seed.sql (clients + profiles must exist)
-- ============================================================

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_schedules_nurse_date
  ON schedules (nurse_id, visit_date);

-- ============================================================
-- Seed: Today's schedule for Amara Okafor, RN
-- Uses the same 6 clients from supabase-seed.sql
-- Order matches the mockData.js CLIENTS_SEED order
-- ============================================================
DO $$
DECLARE
  nurse_uuid UUID;
  client_rec RECORD;
  client_order TEXT[] := ARRAY[
    'Eleanor M.',
    'Rafael T.',
    'Margaret K.',
    'Jerome O.',
    'Lucia V.',
    'Harold B.'
  ];
  idx INT := 0;
  client_name TEXT;
BEGIN
  -- Get Amara's user ID
  SELECT u.id INTO nurse_uuid
  FROM auth.users u
  WHERE u.email = 'amara.okafor@nurse.demo';

  IF nurse_uuid IS NULL THEN
    RAISE NOTICE 'Auth user amara.okafor@nurse.demo not found — skipping schedule seed';
    RETURN;
  END IF;

  -- Delete any existing schedules for today (clean slate)
  DELETE FROM schedules
  WHERE nurse_id = nurse_uuid
    AND visit_date = CURRENT_DATE;

  -- Insert each client in order
  FOREACH client_name IN ARRAY client_order
  LOOP
    SELECT id INTO client_rec FROM clients
    WHERE full_name = client_name AND nurse_id = nurse_uuid
    LIMIT 1;

    IF client_rec.id IS NOT NULL THEN
      INSERT INTO schedules (nurse_id, client_id, visit_date, sort_order)
      VALUES (nurse_uuid, client_rec.id, CURRENT_DATE, idx);
      idx := idx + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Inserted % schedule records for nurse %', idx, nurse_uuid;
END $$;