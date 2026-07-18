// Seed Supabase with demo data using the demo user's auth session
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const DEMO_EMAIL = 'amara.okafor@nurse.demo';
const DEMO_PASSWORD = 'demo1234';
const DEMO_USER_ID = '8f4c5d1f-0c3b-48fd-86cd-fb1f7bf2e433';

async function seed() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Sign in as demo user
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (authError) { console.error('Auth error:', authError.message); process.exit(1); }
  console.log('Signed in as:', auth.user.email);

  // 2. Check if clients already exist
  const { data: existing } = await supabase.from('clients').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('Data already seeded, skipping.');
    await supabase.auth.signOut();
    process.exit(0);
  }

  // 3. Insert clients
  const clients = [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      nurse_id: DEMO_USER_ID,
      full_name: 'Eleanor M.', initials: 'E.M.', dob: '1942-04-11',
      phone: '(323) 555-0142', address: '7425 Sunset Blvd, Los Angeles, CA 90046',
      time_window: '08:00 – 09:30', duration: 45, priority: 'high',
      flags: ['Fall risk', 'Gate code #4821', 'Small dog'],
      condition: 'Post-op knee replacement', last_visit: 'Yesterday · 08:20',
      lat: 34.0982, lng: -118.3519,
      photo_url: 'https://images.unsplash.com/photo-1668622168008-90faecb4d3cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHw0fHxzZW5pb3IlMjBwYXRpZW50JTIwcG9ydHJhaXR8ZW58MHx8fHwxNzg0MjMzNDk5fDA&ixlib=rb-4.1.0&q=85',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      nurse_id: DEMO_USER_ID,
      full_name: 'Rafael T.', initials: 'R.T.', dob: '1955-11-02',
      phone: '(323) 555-0187', address: '1280 N Eastern Ave, Los Angeles, CA 90063',
      time_window: '10:00 – 11:00', duration: 30, priority: 'medium',
      flags: ['Diabetic', 'Insulin fridge'],
      condition: 'Type II Diabetes · Wound care', last_visit: '3 days ago',
      lat: 34.0498, lng: -118.1759, photo_url: null,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      nurse_id: DEMO_USER_ID,
      full_name: 'Margaret K.', initials: 'M.K.', dob: '1938-07-19',
      phone: '(562) 555-0230', address: '4515 Atlantic Ave, Long Beach, CA 90807',
      time_window: '11:45 – 12:45', duration: 50, priority: 'high',
      flags: ['Oxygen', 'Hearing aid', 'Cat'],
      condition: 'COPD monitoring', last_visit: 'Yesterday',
      lat: 33.8403, lng: -118.1854, photo_url: null,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000004',
      nurse_id: DEMO_USER_ID,
      full_name: 'Jerome O.', initials: 'J.O.', dob: '1961-02-24',
      phone: '(818) 555-0311', address: '14520 Vanowen St, Van Nuys, CA 91405',
      time_window: '13:30 – 14:15', duration: 25, priority: 'low',
      flags: ['Stairs · 2nd floor'],
      condition: 'Cardiac follow-up', last_visit: '1 week ago',
      lat: 34.1939, lng: -118.4497, photo_url: null,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000005',
      nurse_id: DEMO_USER_ID,
      full_name: 'Lucía V.', initials: 'L.V.', dob: '1949-09-08',
      phone: '(310) 555-0398', address: '12555 W Jefferson Blvd, Los Angeles, CA 90066',
      time_window: '15:00 – 15:45', duration: 40, priority: 'medium',
      flags: ['Spanish preferred', 'Family present'],
      condition: 'Chemo aftercare', last_visit: '4 days ago',
      lat: 33.9812, lng: -118.4094, photo_url: null,
    },
    {
      id: 'c0000000-0000-0000-0000-000000000006',
      nurse_id: DEMO_USER_ID,
      full_name: 'Harold B.', initials: 'H.B.', dob: '1944-12-30',
      phone: '(626) 555-0421', address: '790 E Colorado Blvd, Pasadena, CA 91101',
      time_window: '16:15 – 17:00', duration: 30, priority: 'medium',
      flags: ['Dementia care', 'Ring loud'],
      condition: 'Memory care · vitals', last_visit: 'Yesterday',
      lat: 34.1454, lng: -118.1341, photo_url: null,
    },
  ];

  const { error: clientErr } = await supabase.from('clients').insert(clients);
  if (clientErr) { console.error('Client insert error:', clientErr.message); process.exit(1); }
  console.log(`Inserted ${clients.length} clients`);

  // 4. Insert schedule
  const schedule = clients.map((c, i) => ({
    nurse_id: DEMO_USER_ID,
    client_id: c.id,
    visit_date: new Date().toISOString().split('T')[0],
    sort_order: i,
  }));
  const { error: schedErr } = await supabase.from('schedules').insert(schedule);
  if (schedErr) { console.error('Schedule insert error:', schedErr.message); process.exit(1); }
  console.log(`Inserted ${schedule.length} schedule entries`);

  // 5. Insert audit log
  const auditEntries = [
    { nurse_id: DEMO_USER_ID, label: 'PHI access — Eleanor M.', type: 'read', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
    { nurse_id: DEMO_USER_ID, label: 'Voice note transcribed', type: 'note', created_at: new Date(Date.now() - 1.5 * 3600000).toISOString() },
    { nurse_id: DEMO_USER_ID, label: 'Route re-optimized', type: 'route', created_at: new Date(Date.now() - 3600000).toISOString() },
    { nurse_id: DEMO_USER_ID, label: 'Vitals uploaded — Rafael T.', type: 'write', created_at: new Date(Date.now() - 1800000).toISOString() },
    { nurse_id: DEMO_USER_ID, label: 'PHI access — Margaret K.', type: 'read', created_at: new Date(Date.now() - 900000).toISOString() },
  ];
  const { error: auditErr } = await supabase.from('audit_logs').insert(auditEntries);
  if (auditErr) { console.error('Audit insert error:', auditErr.message); process.exit(1); }
  console.log(`Inserted ${auditEntries.length} audit entries`);

  console.log('✅ Seed complete!');
  await supabase.auth.signOut();
}

seed().catch(console.error);