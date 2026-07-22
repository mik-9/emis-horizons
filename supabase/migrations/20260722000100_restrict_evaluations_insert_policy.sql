-- Replace the broad insert policy with checks that match the public form payload.
-- This keeps anonymous submissions working while preventing arbitrary rows from
-- bypassing RLS with an always-true WITH CHECK expression.

drop policy if exists "Allow public evaluation submissions" on public.evaluations;

create policy "Allow valid public evaluation submissions"
on public.evaluations
for insert
to anon, authenticated
with check (
  subject is not null
  and length(btrim(subject)) between 1 and 2000
  and future_axis between -100 and 100
  and power_axis between -100 and 100
  and resilience_score between 0 and 100
  and current_quadrant between 1 and 4
  and desired_quadrant between 1 and 4
);
