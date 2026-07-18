-- Add visit_type and status columns to visit_notes
alter table public.visit_notes
  add column if not exists visit_type text default 'Routine visit',
  add column if not exists status text default 'Completed';

-- Add update/delete policies for visit_notes (not yet in 00001)
create policy "Notes update own"
  on visit_notes for update
  using (auth.uid() = nurse_id);

create policy "Notes delete own"
  on visit_notes for delete
  using (auth.uid() = nurse_id);