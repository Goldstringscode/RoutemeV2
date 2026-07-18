-- ============================================================
-- RouteMeV2 — Seed data for demo nurse
-- ============================================================

-- Demo user UUID: 8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433
--   Email: amara.okafor@nurse.demo
--   Password: demo1234

-- 1. Profile (if not exists from migration)
insert into public.profiles (id, name, title, license, region, avatar_url)
values (
  '8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433',
  'Amara Okafor, RN',
  'Registered Nurse · Home Health',
  'RN #2418906',
  'Corona · Zone 3',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHxudXJzZSUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwwfHx8fDE3ODQyMzM0OTl8MA&ixlib=rb-4.1.0&q=85'
) on conflict (id) do nothing;

-- 2. Clients (seed data)
insert into public.clients (id, nurse_id, full_name, initials, dob, phone, address, time_window, duration, priority, flags, condition, last_visit, lat, lng, photo_url) values
(
  'c0000000-0000-0000-0000-000000000001',
  '8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433',
  'Eleanor M.', 'E.M.', '1942-04-11',
  '(323) 555-0142', '7425 Sunset Blvd, Los Angeles, CA 90046',
  '08:00 – 09:30', 45, 'high',
  '{Fall risk, "Gate code #4821", "Small dog"}',
  'Post-op knee replacement', 'Yesterday · 08:20',
  34.0982, -118.3519,
  'https://images.unsplash.com/photo-1668622168008-90faecb4d3cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHw0fHxzZW5pb3IlMjBwYXRpZW50JTIwcG9ydHJhaXR8ZW58MHx8fHwxNzg0MjMzNDk5fDA&ixlib=rb-4.1.0&q=85'
),
(
  'c0000000-0000-0000-0000-000000000002',
  '8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433',
  'Rafael T.', 'R.T.', '1955-11-02',
  '(323) 555-0187', '1280 N Eastern Ave, Los Angeles, CA 90063',
  '10:00 – 11:00', 30, 'medium',
  '{Diabetic, "Insulin fridge"}',
  'Type II Diabetes · Wound care', '3 days ago',
  34.0498, -118.1759, null
),
(
  'c0000000-0000-0000-0000-000000000003',
  '8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433',
  'Margaret K.', 'M.K.', '1938-07-19',
  '(562) 555-0230', '4515 Atlantic Ave, Long Beach, CA 90807',
  '11:45 – 12:45', 50, 'high',
  '{Oxygen, "Hearing aid", Cat}',
  'COPD monitoring', 'Yesterday',
  33.8403, -118.1854, null
),
(
  'c0000000-0000-0000-0000-000000000004',
  '8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433',
  'Jerome O.', 'J.O.', '1961-02-24',
  '(818) 555-0311', '14520 Vanowen St, Van Nuys, CA 91405',
  '13:30 – 14:15', 25, 'low',
  '{"Stairs · 2nd floor"}',
  'Cardiac follow-up', '1 week ago',
  34.1939, -118.4497, null
),
(
  'c0000000-0000-0000-0000-000000000005',
  '8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433',
  'Lucía V.', 'L.V.', '1949-09-08',
  '(310) 555-0398', '12555 W Jefferson Blvd, Los Angeles, CA 90066',
  '15:00 – 15:45', 40, 'medium',
  '{"Spanish preferred", "Family present"}',
  'Chemo aftercare', '4 days ago',
  33.9812, -118.4094, null
),
(
  'c0000000-0000-0000-0000-000000000006',
  '8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433',
  'Harold B.', 'H.B.', '1944-12-30',
  '(626) 555-0421', '790 E Colorado Blvd, Pasadena, CA 91101',
  '16:15 – 17:00', 30, 'medium',
  '{"Dementia care", "Ring loud"}',
  'Memory care · vitals', 'Yesterday',
  34.1454, -118.1341, null
) on conflict (id) do nothing;

-- 3. Schedule (all clients today, in order)
insert into public.schedules (nurse_id, client_id, visit_date, sort_order) values
  ('8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433', 'c0000000-0000-0000-0000-000000000001', current_date, 0),
  ('8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433', 'c0000000-0000-0000-0000-000000000002', current_date, 1),
  ('8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433', 'c0000000-0000-0000-0000-000000000003', current_date, 2),
  ('8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433', 'c0000000-0000-0000-0000-000000000004', current_date, 3),
  ('8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433', 'c0000000-0000-0000-0000-000000000005', current_date, 4),
  ('8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433', 'c0000000-0000-0000-0000-000000000006', current_date, 5)
on conflict (nurse_id, client_id, visit_date) do nothing;

-- 4. Audit log (seed entries)
insert into public.audit_logs (nurse_id, label, type, created_at) values
  ('8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433', 'PHI access — Eleanor M.', 'read', now() - interval '2 hours'),
  ('8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433', 'Voice note transcribed', 'note', now() - interval '1.5 hours'),
  ('8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433', 'Route re-optimized', 'route', now() - interval '1 hour'),
  ('8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433', 'Vitals uploaded — Rafael T.', 'write', now() - interval '30 minutes'),
  ('8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433', 'PHI access — Margaret K.', 'read', now() - interval '15 minutes')
on conflict do nothing;