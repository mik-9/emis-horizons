import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reportToRow, rowToReport } from '../../src/lib/reports.js';

test('la sauvegarde conserve toutes les réponses et laisse le serveur calculer les scores', () => {
  const report = {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', subject: 'Un projet de transformation',
    futureAxis: 0, powerAxis: 1,
    resilienceScore: { clarte: 8, ambition: 11, total: 999 },
    desiredQuadrant: 2, actionSteps: { observe: 'Observer les retours', act: 'Agir demain', transform: 'Transformer mon offre' },
    aiAnalysis: { diagnostic: 'D', vigilance: 'V', reco: 'R' },
  };
  const row = reportToRow(report, 'owner-a');
  assert.equal(row.user_id, 'owner-a');
  assert.equal(row.assessment_version, 1);
  assert.equal(row.resilience_score, undefined);
  assert.equal(row.current_quadrant, undefined);
  assert.equal(row.created_at, undefined);
  const restored = rowToReport({ ...row, created_at: '2026-09-30T12:00:00Z', current_quadrant: 1, resilience_score: 52 });
  assert.deepEqual(restored.actionSteps, report.actionSteps);
  assert.deepEqual(restored.aiAnalysis, report.aiAnalysis);
  assert.equal(restored.resilienceScore.total, 52);
  assert.equal(restored.resilienceScore.clarte, 8);
  assert.equal(restored.resilienceScore.ambition, 11);
});
