-- ============================================================
-- RouteMe — Supabase Seed Migration
-- Creates demo accounts + all test data for development/testing
-- Run this in your Supabase SQL Editor (SQL > New Query)
-- ============================================================

-- 1. Create demo auth users (emails must match exactly)
-- NOTE: Supabase Auth users are created via the Auth API or UI.
-- Run these in Supabase Dashboard > Authentication > Users > Add User
-- OR use the Supabase CLI / Management API.
--
-- Create these users manually in the Dashboard:
--   amara.okafor@nurse.demo  /  Demo1234!
--   priya@sunrisehh.demo     /  Demo1234!
--   super@routeme.com        /  SuperAdmin2026!

-- 2. Seed the profiles table
INSERT INTO profiles (id, name, title, email, role, agency_id, license, region, avatar_url, home_base)
SELECT
  u.id,
  'Amara Okafor, RN',
  'Registered Nurse · Home Health',
  'amara.okafor@nurse.demo',
  'nurse',
  NULL,
  'RN #2418906',
  'Corona · Zone 3',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHxudXJzZSUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwwfHx8fDE3ODQyMzM0OTl8MA&ixlib=rb-4.1.0&q=85',
  jsonb_build_object('lat', 33.7726, 'lng', -117.5928, 'address', 'Dos Lagos, Corona, CA 92883')
FROM auth.users u
WHERE u.email = 'amara.okafor@nurse.demo'
AND NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'amara.okafor@nurse.demo');

-- 3. Seed clients (Amara's patients)
INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, photo_url, nurse_id, medications)
SELECT
  'Eleanor M.', 'E.M.', '1942-04-11', '(323) 555-0142',
  '7425 Sunset Blvd, Los Angeles, CA 90046', 34.0982, -118.3519,
  '08:00 – 09:30', 45, 'high',
  ARRAY['Fall risk', 'Gate code #4821', 'Small dog'],
  'Post-op knee replacement', 'Yesterday · 08:20',
  'https://images.unsplash.com/photo-1668622168008-90faecb4d3cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHw0fHxzZW5pb3IlMjBwYXRpZW50JTIwcG9ydHJhaXR8ZW58MHx8fHwxNzg0MjMzNDk5fDA&ixlib=rb-4.1.0&q=85',
  u.id,
  jsonb_build_array(
    jsonb_build_object('name', 'Oxycodone 5mg', 'freq', 'every 6 hours PRN'),
    jsonb_build_object('name', 'Aspirin 81mg', 'freq', 'daily'),
    jsonb_build_object('name', 'Vitamin D 2000IU', 'freq', 'daily')
  )
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Eleanor M.');

INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, nurse_id, medications)
SELECT
  'Rafael T.', 'R.T.', '1955-11-02', '(323) 555-0187',
  '1280 N Eastern Ave, Los Angeles, CA 90063', 34.0498, -118.1759,
  '10:00 – 11:00', 30, 'medium',
  ARRAY['Diabetic', 'Insulin fridge'],
  'Type II Diabetes · Wound care', '3 days ago',
  u.id,
  jsonb_build_array(
    jsonb_build_object('name', 'Metformin 500mg', 'freq', 'twice daily'),
    jsonb_build_object('name', 'Insulin glargine', 'freq', '12 units AM'),
    jsonb_build_object('name', 'Lisinopril 10mg', 'freq', 'daily')
  )
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Rafael T.');

INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, nurse_id, medications)
SELECT
  'Margaret K.', 'M.K.', '1938-07-19', '(562) 555-0230',
  '4515 Atlantic Ave, Long Beach, CA 90807', 33.8403, -118.1854,
  '11:45 – 12:45', 50, 'high',
  ARRAY['Oxygen', 'Hearing aid', 'Cat'],
  'COPD monitoring', 'Yesterday',
  u.id,
  jsonb_build_array(
    jsonb_build_object('name', 'Spiriva Respimat', 'freq', '2 inhalations daily'),
    jsonb_build_object('name', 'Albuterol HFA', 'freq', '2 puffs every 4-6h PRN'),
    jsonb_build_object('name', 'Prednisone 5mg', 'freq', 'daily')
  )
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Margaret K.');

INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, nurse_id, medications)
SELECT
  'Jerome O.', 'J.O.', '1961-02-24', '(818) 555-0311',
  '14520 Vanowen St, Van Nuys, CA 91405', 34.1939, -118.4497,
  '13:30 – 14:15', 25, 'low',
  ARRAY['Stairs · 2nd floor'],
  'Cardiac follow-up', '1 week ago',
  u.id,
  jsonb_build_array(
    jsonb_build_object('name', 'Furosemide 40mg', 'freq', 'daily'),
    jsonb_build_object('name', 'Carvedilol 6.25mg', 'freq', 'twice daily'),
    jsonb_build_object('name', 'Potassium 20mEq', 'freq', 'daily')
  )
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Jerome O.');

INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, nurse_id, medications)
SELECT
  'Lucía V.', 'L.V.', '1949-09-08', '(310) 555-0398',
  '12555 W Jefferson Blvd, Los Angeles, CA 90066', 33.9812, -118.4094,
  '15:00 – 15:45', 40, 'medium',
  ARRAY['Spanish preferred', 'Family present'],
  'Chemo aftercare', '4 days ago',
  u.id,
  jsonb_build_array(
    jsonb_build_object('name', 'Ondansetron 8mg', 'freq', 'every 8 hours PRN'),
    jsonb_build_object('name', 'Dexamethasone 4mg', 'freq', 'day 1-3 post chemo'),
    jsonb_build_object('name', 'Prochlorperazine 10mg', 'freq', 'every 6 hours PRN')
  )
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Lucía V.');

INSERT INTO clients (full_name, initials, dob, phone, address, lat, lng, time_window, duration, priority, flags, condition, last_visit, nurse_id, medications)
SELECT
  'Harold B.', 'H.B.', '1944-12-30', '(626) 555-0421',
  '790 E Colorado Blvd, Pasadena, CA 91101', 34.1454, -118.1341,
  '16:15 – 17:00', 30, 'medium',
  ARRAY['Dementia care', 'Ring loud'],
  'Memory care · vitals', 'Yesterday',
  u.id,
  jsonb_build_array(
    jsonb_build_object('name', 'Donepezil 10mg', 'freq', 'at bedtime'),
    jsonb_build_object('name', 'Memantine 5mg', 'freq', 'twice daily'),
    jsonb_build_object('name', 'Sertraline 50mg', 'freq', 'daily')
  )
FROM auth.users u WHERE u.email = 'amara.okafor@nurse.demo'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE full_name = 'Harold B.');
