begin;

-- Anonymous legacy rows have no reliable owner: preserve, never auto-assign them.
do $$
begin
  if to_regclass('public.evaluations') is not null then
    alter table public.evaluations enable row level security;
    drop policy if exists "Allow public evaluation submissions" on public.evaluations;
    drop policy if exists "Allow valid public evaluation submissions" on public.evaluations;
    revoke all on public.evaluations from public, anon, authenticated;
  end if;
end $$;

create table if not exists public.assessment_reports (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  assessment_version integer not null default 1 check (assessment_version = 1),
  subject text not null check (length(btrim(subject)) between 10 and 2000),
  future_axis integer not null check (future_axis between -100 and 100),
  power_axis integer not null check (power_axis between -100 and 100),
  clarity integer not null check (clarity between 0 and 15),
  ambition integer not null check (ambition between 0 and 20),
  desired_quadrant integer not null check (desired_quadrant between 1 and 4),
  observe text not null check (length(btrim(observe)) between 5 and 10000),
  act text not null check (length(btrim(act)) between 5 and 10000),
  transform text not null check (length(btrim(transform)) between 5 and 10000),
  synthesis jsonb not null check (
    jsonb_typeof(synthesis) = 'object'
    and synthesis ?& array['diagnostic', 'vigilance', 'reco']
    and jsonb_typeof(synthesis->'diagnostic') = 'string'
    and jsonb_typeof(synthesis->'vigilance') = 'string'
    and jsonb_typeof(synthesis->'reco') = 'string'
    and length(btrim(synthesis->>'diagnostic')) > 0
    and length(btrim(synthesis->>'vigilance')) > 0
    and length(btrim(synthesis->>'reco')) > 0
    and octet_length(synthesis::text) <= 150000
  ),
  resilience_score integer generated always as (
    round((future_axis + 100)::numeric / 200 * 25)::integer
    + round((power_axis + 100)::numeric / 200 * 40)::integer
    + clarity + ambition
  ) stored,
  current_quadrant integer generated always as (
    case when future_axis >= 0 and power_axis >= 0 then 1
         when future_axis < 0 and power_axis >= 0 then 2
         when future_axis < 0 and power_axis < 0 then 3 else 4 end
  ) stored
);

create index if not exists assessment_reports_owner_date_idx
  on public.assessment_reports (user_id, created_at desc, id desc);

alter table public.assessment_reports enable row level security;
revoke all on public.assessment_reports from public, anon, authenticated;
grant select on public.assessment_reports to authenticated;
-- Clients cannot forge the timestamp or the generated scores.
grant insert (id, user_id, assessment_version, subject, future_axis, power_axis,
  clarity, ambition, desired_quadrant, observe, act, transform, synthesis),
  update (id, user_id, assessment_version, subject, future_axis, power_axis,
  clarity, ambition, desired_quadrant, observe, act, transform, synthesis)
  on public.assessment_reports to authenticated;
grant all on public.assessment_reports to service_role;

drop policy if exists "Read own reports" on public.assessment_reports;
create policy "Read own reports" on public.assessment_reports
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Create own reports" on public.assessment_reports;
create policy "Create own reports" on public.assessment_reports
  for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Update own reports" on public.assessment_reports;
create policy "Update own reports" on public.assessment_reports
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

comment on table public.assessment_reports is
  'Private versioned reports. Legacy anonymous evaluations are intentionally not linked.';
notify pgrst, 'reload schema';
commit;
