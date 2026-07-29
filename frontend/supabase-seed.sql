-- ============================================================
-- RouteMe - Complete Schema + Seed Migration
-- Step 1: Create 3 auth users in Dashboard first
--   amara.okafor@nurse.demo / Demo1234!
--   priya@sunrisehh.demo    / Demo1234!
--   super@routeme.com       / SuperAdmin2026!
-- Step 2: Run this entire script in SQL Editor
-- ============================================================

-- Ensure columns exist on existing tables (table may already exist)
-- Note: UNIQUE constraint added separately to avoid conflicts with existing data
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS license TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_base JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_saved_minutes INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_saved_miles FLOAT8 DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agency_id UUID;

-- Create profiles table (if starting fresh)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  title TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'nurse',
  agency_id UUID,
  license TEXT,
  region TEXT,
  avatar_url TEXT,
  home_base JSONB,
  weekly_saved_minutes INT DEFAULT 0,
  weekly_saved_miles FLOAT8 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  initials TEXT,
  dob TEXT,
  phone TEXT,
  address TEXT,
  lat FLOAT8,
  lng FLOAT8,
  time_window TEXT,
  duration INT DEFAULT 30,
  priority TEXT DEFAULT 'medium',
  flags TEXT[],
  condition TEXT,
  last_visit TEXT,
  photo_url TEXT,
  nurse_id UUID REFERENCES profiles(id),
  medications JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  nurse_id UUID REFERENCES profiles(id),
  date DATE DEFAULT CURRENT_DATE,
  time TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create soap_notes table
CREATE TABLE IF NOT EXISTS soap_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  author TEXT,
  service_at TIMESTAMPTZ,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED: Amara Okafor, RN
-- ============================================================
INSERT INTO profiles (id, name, title, email, role, license, region, avatar_url, home_base)
SELECT
  u.id,
  'Amara Okafor, RN',
  'Registered Nurse - Home Health',
  'amara.okafor@nurse.demo',
  'nurse',
  'RN #2418906',
  'Corona - Zone 3',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=srgb&fm=jpg&q=85',
  jsonb_build_object('lat', 33.7726, 'lng', -117.5928, 'address', 'Dos Lagos, Corona, CA 92883')
FROM auth.users u
WHERE u.email = 'amara.okafor@nurse.demo'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  license = EXCLUDED.license,
  region = EXCLUDED.region,
  avatar_url = EXCLUDED.avatar_url,
  home_base = EXCLUDED.home_base;

-- SEED: Priya Nair (agency director)
INSERT INTO profiles (id, name, title, email, role)
SELECT
  u.id, 'Priya Nair', 'Agency Director', 'priya@sunrisehh.demo', 'agency_admin'
FROM auth.users u
WHERE u.email = 'priya@sunrisehh.demo'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- SEED: Dr. Isla Fernandez (super admin)
INSERT INTO profiles (id, name, title, email, role)
SELECT
  u.id, 'Dr. Isla Fernandez', 'Platform Owner', 'super@routeme.com', 'super_admin'
FROM auth.users u
WHERE u.email = 'super@routeme.com'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- ============================================================
-- SEED: Clients (Amara's patients)
-- ============================================================
INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, photo_url, nurse_id, medications)
SELECT 'Eleanor M.', 'E.M.', '1942-04-11', '(323) 555-0142', '7425 Sunset Blvd, Los Angeles, CA 90046', 34.0982, -118.3519, '08:00 - 09:30', 45, 'high', ARRAY['Fall risk', 'Gate code #4821', 'Small dog'], 'Post-op knee replacement', 'Yesterday', 'https://images.unsplash.com/photo-1668622168008-90faecb4d3cd?crop=entropy&cs=srgb&fm=jpg&q=85', u.id, jsonb_build_array(jsonb_build_object('name','Oxycodone 5mg','freq','every 6 hours PRN'),jsonb_build_object('name','Aspirin 81mg','freq','daily'),jsonb_build_object('name','Vitamin D 2000IU','freq','daily'))
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo' AND NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Eleanor M.');

INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, nurse_id, medications)
SELECT 'Rafael T.', 'R.T.', '1955-11-02', '(323) 555-0187', '1280 N Eastern Ave, Los Angeles, CA 90063', 34.0498, -118.1759, '10:00 - 11:00', 30, 'medium', ARRAY['Diabetic', 'Insulin fridge'], 'Type II Diabetes - Wound care', '3 days ago', u.id, jsonb_build_array(jsonb_build_object('name','Metformin 500mg','freq','twice daily'),jsonb_build_object('name','Insulin glargine','freq','12 units AM'),jsonb_build_object('name','Lisinopril 10mg','freq','daily'))
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo' AND NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Rafael T.');

INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, nurse_id, medications)
SELECT 'Margaret K.', 'M.K.', '1938-07-19', '(562) 555-0230', '4515 Atlantic Ave, Long Beach, CA 90807', 33.8403, -118.1854, '11:45 - 12:45', 50, 'high', ARRAY['Oxygen', 'Hearing aid', 'Cat'], 'COPD monitoring', 'Yesterday', u.id, jsonb_build_array(jsonb_build_object('name','Spiriva Respimat','freq','2 inhalations daily'),jsonb_build_object('name','Albuterol HFA','freq','2 puffs every 4-6h PRN'),jsonb_build_object('name','Prednisone 5mg','freq','daily'))
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo' AND NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Margaret K.');

INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, nurse_id, medications)
SELECT 'Jerome O.', 'J.O.', '1961-02-24', '(818) 555-0311', '14520 Vanowen St, Van Nuys, CA 91405', 34.1939, -118.4497, '13:30 - 14:15', 25, 'low', ARRAY['Stairs - 2nd floor'], 'Cardiac follow-up', '1 week ago', u.id, jsonb_build_array(jsonb_build_object('name','Furosemide 40mg','freq','daily'),jsonb_build_object('name','Carvedilol 6.25mg','freq','twice daily'),jsonb_build_object('name','Potassium 20mEq','freq','daily'))
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo' AND NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Jerome O.');

INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, nurse_id, medications)
SELECT 'Lucia V.', 'L.V.', '1949-09-08', '(310) 555-0398', '12555 W Jefferson Blvd, Los Angeles, CA 90066', 33.9812, -118.4094, '15:00 - 15:45', 40, 'medium', ARRAY['Spanish preferred', 'Family present'], 'Chemo aftercare', '4 days ago', u.id, jsonb_build_array(jsonb_build_object('name','Ondansetron 8mg','freq','every 8 hours PRN'),jsonb_build_object('name','Dexamethasone 4mg','freq','day 1-3 post chemo'),jsonb_build_object('name','Prochlorperazine 10mg','freq','every 6 hours PRN'))
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo' AND NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Lucia V.');

INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, nurse_id, medications)
SELECT 'Harold B.', 'H.B.', '1944-12-30', '(626) 555-0421', '790 E Colorado Blvd, Pasadena, CA 91101', 34.1454, -118.1341, '16:15 - 17:00', 30, 'medium', ARRAY['Dementia care', 'Ring loud'], 'Memory care - vitals', 'Yesterday', u.id, jsonb_build_array(jsonb_build_object('name','Donepezil 10mg','freq','at bedtime'),jsonb_build_object('name','Memantine 5mg','freq','twice daily'),jsonb_build_object('name','Sertraline 50mg','freq','daily'))
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo' AND NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Harold B.');