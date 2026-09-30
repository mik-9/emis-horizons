import { supabase } from '../supabaseClient.js';

export const REPORT_VERSION = 1;
export const PAGE_SIZE = 20;
export const SUBJECT_LIMIT = 2000;
export const ACTION_LIMIT = 10000;

export function reportToRow(report, userId) {
  return {
    id: report.id,
    user_id: userId,
    subject: report.subject.trim(),
    future_axis: report.futureAxis,
    power_axis: report.powerAxis,
    clarity: report.resilienceScore.clarte,
    ambition: report.resilienceScore.ambition,
    desired_quadrant: report.desiredQuadrant,
    observe: report.actionSteps.observe.trim(),
    act: report.actionSteps.act.trim(),
    transform: report.actionSteps.transform.trim(),
    synthesis: report.aiAnalysis,
    assessment_version: REPORT_VERSION,
  };
}

export function rowToReport(row) {
  return {
    id: row.id,
    date: row.created_at,
    subject: row.subject,
    futureAxis: row.future_axis,
    powerAxis: row.power_axis,
    resilienceScore: {
      optimisme: Math.round(((row.future_axis + 100) / 200) * 25),
      pouvoir: Math.round(((row.power_axis + 100) / 200) * 40),
      clarte: row.clarity,
      ambition: row.ambition,
      total: row.resilience_score,
    },
    currentQuadrant: row.current_quadrant,
    desiredQuadrant: row.desired_quadrant,
    actionSteps: { observe: row.observe, act: row.act, transform: row.transform },
    aiAnalysis: row.synthesis,
    assessmentVersion: row.assessment_version,
    saved: true,
  };
}

export async function listReports(userId, offset = 0, signal) {
  const { data, error, status } = await supabase.from('assessment_reports')
    .select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).order('id', { ascending: false })
    .range(offset, offset + PAGE_SIZE).retry(false).abortSignal(signal ?? AbortSignal.timeout(20000));
  if (error) throw { ...error, status };
  return { reports: data.slice(0, PAGE_SIZE).map(rowToReport), hasMore: data.length > PAGE_SIZE };
}

export async function saveReport(report, userId) {
  // The same UUID is reused on retries, including when a response was lost.
  const { data, error, status } = await supabase.from('assessment_reports')
    .upsert(reportToRow(report, userId), { onConflict: 'id' })
    .select('*').single().abortSignal(AbortSignal.timeout(20000));
  if (error) throw { ...error, status };
  return rowToReport(data);
}
