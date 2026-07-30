-- RouteMe EVV (Electronic Visit Verification) Migration
-- Phase 1: Core EVV capture tables
-- Applies to Supabase PostgreSQL

-- 1. EVV visits — captures GPS clock-in/out per visit
CREATE TABLE IF NOT EXISTS evv_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id TEXT,
  nurse_id TEXT NOT NULL,
  client_id TEXT NOT NULL,

  -- Core EVV: WHO + WHEN + WHERE
  visit_started_at TIMESTAMPTZ,
  visit_ended_at TIMESTAMPTZ,
  start_lat NUMERIC(10,7),
  start_lng NUMERIC(10,7),
  start_gps_accuracy NUMERIC(8,2),
  start_gps_timestamp TIMESTAMPTZ,
  end_lat NUMERIC(10,7),
  end_lng NUMERIC(10,7),
  end_gps_accuracy NUMERIC(8,2),
  end_gps_timestamp TIMESTAMPTZ,

  -- GPS metadata (required by Sandata/HHAeXchange submissions)
  start_altitude NUMERIC(8,2),
  start_heading NUMERIC(5,2),
  start_speed NUMERIC(6,2),
  end_altitude NUMERIC(8,2),
  end_heading NUMERIC(5,2),
  end_speed NUMERIC(6,2),

  -- GPS fallback mode (gps or wifi)
  gps_fallback_mode VARCHAR(10),

  -- Continuous GPS readings during visit (JSON array of {lat, lng, accuracy, capturedAt})
  gps_readings JSONB DEFAULT '[]'::jsonb,

  -- Core EVV: WHAT (service code)
  service_code VARCHAR(20),
  service_description TEXT,

  -- EVV status
  status VARCHAR(20) DEFAULT 'pending',         -- pending, clocked_in, clocked_out, submitted, acknowledged, failed
  override_reason TEXT,
  override_category VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Submission metadata
  submitted_at TIMESTAMPTZ,
  submission_status VARCHAR(20) DEFAULT 'pending',
  submission_target VARCHAR(50),               -- sandata, hhaxchange, ca_edi, etc.
  submission_response JSONB
);

-- 2. EVV service codes — configurable per state/agency
CREATE TABLE IF NOT EXISTS evv_service_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  state VARCHAR(2),
  agency_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. EVV state configuration
CREATE TABLE IF NOT EXISTS evv_state_config (
  state VARCHAR(2) PRIMARY KEY,
  target_system VARCHAR(50),
  gps_required BOOLEAN DEFAULT true,
  gps_accuracy_threshold NUMERIC(6,2),
  telephonic_allowed BOOLEAN DEFAULT false,
  telephonic_percent_limit NUMERIC(3,2),
  submission_frequency VARCHAR(20) DEFAULT 'daily',
  requires_auth_number BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true
);

-- 4. EVV submission log
CREATE TABLE IF NOT EXISTS evv_submission_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evv_visit_id UUID REFERENCES evv_visits(id) ON DELETE CASCADE,
  target_system VARCHAR(50),
  payload JSONB,
  response_status INTEGER,
  response_body JSONB,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Agency EVV config
CREATE TABLE IF NOT EXISTS agency_evv_config (
  agency_id TEXT PRIMARY KEY,
  evv_provider VARCHAR(50),                    -- sandata, hhaxchange, carevisit, state_portal, csv_export
  account_id TEXT,
  api_key_encrypted TEXT,
  primary_state VARCHAR(2) DEFAULT 'CA',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_evv_visits_nurse ON evv_visits(nurse_id);
CREATE INDEX IF NOT EXISTS idx_evv_visits_client ON evv_visits(client_id);
CREATE INDEX IF NOT EXISTS idx_evv_visits_status ON evv_visits(status);
CREATE INDEX IF NOT EXISTS idx_evv_visits_date ON evv_visits(visit_started_at);
CREATE INDEX IF NOT EXISTS idx_evv_submission_visit ON evv_submission_log(evv_visit_id);
CREATE INDEX IF NOT EXISTS idx_evv_submission_status ON evv_submission_log(target_system, response_status);

-- Seed California state config
INSERT INTO evv_state_config (state, target_system, gps_required, gps_accuracy_threshold, telephonic_allowed, telephonic_percent_limit, submission_frequency)
VALUES ('CA', 'sandata', true, 100, true, 0.10, 'daily')
ON CONFLICT (state) DO NOTHING;

INSERT INTO evv_state_config (state, target_system, gps_required, gps_accuracy_threshold, telephonic_allowed, submission_frequency)
VALUES ('TX', 'sandata', true, 50, false, 'daily')
ON CONFLICT (state) DO NOTHING;

INSERT INTO evv_state_config (state, target_system, gps_required, gps_accuracy_threshold, telephonic_allowed, submission_frequency)
VALUES ('NY', 'hhaxchange', true, 100, false, 'realtime')
ON CONFLICT (state) DO NOTHING;

INSERT INTO evv_state_config (state, target_system, gps_required, gps_accuracy_threshold, submission_frequency)
VALUES ('FL', 'state_portal', true, 200, 'monthly')
ON CONFLICT (state) DO NOTHING;

-- Seed service codes
INSERT INTO evv_service_codes (code, description, category, state) VALUES
  ('G0154', 'Skilled nursing services (RN/LPN)', 'nursing', 'CA'),
  ('G0156', 'Home health aide (skilled)', 'aide', 'CA'),
  ('T2012', 'Home health aide services (60 min)', 'aide', 'CA'),
  ('G0151', 'Physical therapy evaluation', 'therapy', 'CA'),
  ('G0152', 'Occupational therapy evaluation', 'therapy', 'CA'),
  ('G0153', 'Speech-language pathology', 'therapy', 'CA'),
  ('99512', 'Telehealth visit (home health)', 'telehealth', 'CA'),
  ('99600', 'Unlisted home visit service', 'other', 'CA')
ON CONFLICT DO NOTHING;

-- Row Level Security
ALTER TABLE evv_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE evv_service_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evv_state_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE evv_submission_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_evv_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for evv_visits
CREATE POLICY evv_visits_select ON evv_visits
  FOR SELECT USING (nurse_id = current_setting('app.user_id', true)::text);
CREATE POLICY evv_visits_insert ON evv_visits
  FOR INSERT WITH CHECK (nurse_id = current_setting('app.user_id', true)::text);
CREATE POLICY evv_visits_update ON evv_visits
  FOR UPDATE USING (nurse_id = current_setting('app.user_id', true)::text);

-- RLS policies for evv_service_codes — all authenticated users can read
CREATE POLICY evv_service_codes_select ON evv_service_codes
  FOR SELECT USING (true);

-- RLS policies for evv_state_config — all authenticated users can read
CREATE POLICY evv_state_config_select ON evv_state_config
  FOR SELECT USING (true);

-- RLS policies for evv_submission_log
CREATE POLICY evv_submission_log_select ON evv_submission_log
  FOR SELECT USING (
    evv_visit_id IN (
      SELECT id FROM evv_visits WHERE nurse_id = current_setting('app.user_id', true)::text
    )
  );
CREATE POLICY evv_submission_log_insert ON evv_submission_log
  FOR INSERT WITH CHECK (
    evv_visit_id IN (
      SELECT id FROM evv_visits WHERE nurse_id = current_setting('app.user_id', true)::text
    )
  );

-- RLS policies for agency_evv_config — agency admins manage their own
CREATE POLICY agency_evv_config_select ON agency_evv_config
  FOR SELECT USING (agency_id = current_setting('app.agency_id', true)::text);
CREATE POLICY agency_evv_config_insert ON agency_evv_config
  FOR INSERT WITH CHECK (agency_id = current_setting('app.agency_id', true)::text);
CREATE POLICY agency_evv_config_update ON agency_evv_config
  FOR UPDATE USING (agency_id = current_setting('app.agency_id', true)::text);