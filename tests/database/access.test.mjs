import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const ownerA = '11111111-1111-4111-8111-111111111111';
const ownerB = '22222222-2222-4222-8222-222222222222';
const reportId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const root = new URL('../../supabase/migrations/', import.meta.url);
const sql = name => readFile(new URL(name, root), 'utf8');
const migrationName = '20260930164234_private_assessment_reports.sql';

test('PostgreSQL : migration réexécutable, données conservées et accès isolés', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth, public to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
      insert into auth.users values ('${ownerA}'), ('${ownerB}');
    `);
    await db.exec(await sql('20260721000000_legacy_evaluations_baseline.sql'));
    await db.exec(`insert into public.evaluations(subject) values ('Ancienne évaluation anonyme');`);
    await db.exec(await sql('20260722000000_enable_rls_on_evaluations.sql'));
    await db.exec(await sql('20260722000100_restrict_evaluations_insert_policy.sql'));
    await db.exec(await sql(migrationName));
    await db.exec(await sql(migrationName));
    assert.equal((await db.query('select count(*)::int as n from public.evaluations')).rows[0].n, 1);

    await db.exec('set role anon');
    await assert.rejects(db.query('select * from public.assessment_reports'), /permission denied/);
    await assert.rejects(db.query("insert into public.evaluations(subject) values ('Spam anonyme')"), /permission denied/);
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub = '${ownerA}'`);
    const payload = [reportId, ownerA, 'Préparer une transformation', 0, 1, 8, 11, 1, 'Observer les résultats', 'Agir cette semaine', 'Transformer les pratiques', JSON.stringify({ diagnostic: 'Situation', vigilance: 'Vigilance', reco: 'Prochaine action' })];
    const insert = `insert into public.assessment_reports
      (id,user_id,subject,future_axis,power_axis,clarity,ambition,desired_quadrant,observe,act,transform,synthesis)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      on conflict(id) do update set act=excluded.act returning *`;
    const saved = (await db.query(insert, payload)).rows[0];
    assert.equal(saved.resilience_score, 52);
    assert.equal(saved.current_quadrant, 1);
    const retry = (await db.query(insert, payload)).rows[0];
    assert.equal(String(retry.created_at), String(saved.created_at));
    assert.equal((await db.query('select count(*)::int as n from public.assessment_reports')).rows[0].n, 1);
    await assert.rejects(db.query('update public.assessment_reports set resilience_score=100'), /permission denied|generated|updated to DEFAULT/);
    await assert.rejects(db.query('update public.assessment_reports set created_at=now()'), /permission denied/);
    await assert.rejects(db.query('update public.assessment_reports set user_id=$1', [ownerB]), /row-level security/);
    await assert.rejects(db.query("update public.assessment_reports set subject='court'"), /check constraint/);
    await assert.rejects(db.query("update public.assessment_reports set synthesis='{}'"), /check constraint/);
    await assert.rejects(db.query("update public.assessment_reports set synthesis='{\"diagnostic\":null,\"vigilance\":\"ok\",\"reco\":\"ok\"}'"), /check constraint/);
    await assert.rejects(db.query('update public.assessment_reports set future_axis=101'), /check constraint/);

    await db.exec(`set request.jwt.claim.sub = '${ownerB}'`);
    assert.equal((await db.query('select * from public.assessment_reports')).rows.length, 0);
    assert.equal((await db.query("update public.assessment_reports set act='Voler les données' returning *")).rows.length, 0);
    await assert.rejects(db.query(insert, payload), /row-level security/);
    const forged = [...payload]; forged[0] = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    await assert.rejects(db.query(insert, forged), /row-level security/);
    forged[1] = ownerB;
    await db.query(insert, forged);
    assert.equal((await db.query('select * from public.assessment_reports')).rows.length, 1);
    await db.exec(`set request.jwt.claim.sub = '${ownerA}'`);
    const own = (await db.query('select * from public.assessment_reports')).rows;
    assert.equal(own.length, 1); assert.equal(own[0].act, 'Agir cette semaine');
    await assert.rejects(db.query('select * from public.evaluations'), /permission denied/);
  } finally { await db.close(); }
});
