-- Enable Row Level Security for the evaluations table exposed through PostgREST.
--
-- The application currently writes completed assessments from the public client.
-- This policy keeps that insert path available for Supabase anon/authenticated
-- roles while leaving reads, updates, and deletes blocked unless separate
-- policies are added later.

alter table public.evaluations enable row level security;

create policy "Allow public evaluation submissions"
on public.evaluations
for insert
to anon, authenticated
with check (true);
