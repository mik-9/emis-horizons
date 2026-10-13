import { Buffer } from 'node:buffer';

export const users = {
  'alice@example.com': { id: '11111111-1111-4111-8111-111111111111', email: 'alice@example.com', user_metadata: { display_name: 'Alice' } },
  'bob@example.com': { id: '22222222-2222-4222-8222-222222222222', email: 'bob@example.com', user_metadata: { display_name: 'Bob' } },
};
export function tokenFor(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: user.id, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  return `${header}.${payload}.mock-test-signature`;
}
export function sessionFor(user) {
  return { access_token: tokenFor(user), refresh_token: `refresh-${user.id}`, expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user };
}
export async function mockSupabase(context) {
  const state = { rows: new Map(), submissions: [], failSave: false, loseResponse: false, failLoad: false, failLogout: false, expireRefresh: false, lastSignup: null, recoveries: [], resent: [], passwordUpdated: null };
  await context.route('https://emis-test.supabase.co/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const payload = request.postDataJSON();
    const respond = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: { 'x-supabase-api-version': '2024-01-01', 'access-control-expose-headers': 'x-supabase-api-version' }, body: JSON.stringify(data) });
    if (url.pathname.endsWith('/token')) {
      if (url.searchParams.get('grant_type') === 'refresh_token') {
        if (state.expireRefresh) return respond({ code: 'refresh_token_not_found', msg: 'Refresh token revoked' }, 400);
        const user = Object.values(users).find(u => payload.refresh_token === `refresh-${u.id}`);
        return respond(sessionFor(user));
      }
      const user = users[payload.email];
      if (!user || payload.password !== 'test-password-123') return respond({ code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400);
      return respond(sessionFor(user));
    }
    if (url.pathname.endsWith('/signup')) { state.lastSignup = payload; return respond({ user: { ...users['alice@example.com'], email: payload.email } }); }
    if (url.pathname.endsWith('/recover')) { state.recoveries.push({ payload, url: url.href }); return respond({}); }
    if (url.pathname.endsWith('/resend')) { state.resent.push(payload); return respond({}); }
    if (url.pathname.endsWith('/logout')) {
      if (state.failLogout) return respond({ code: 'unexpected_failure', msg: 'Unavailable' }, 400);
      return route.fulfill({ status: 204 });
    }
    const authorization = request.headers().authorization ?? '';
    let owner;
    try { owner = JSON.parse(Buffer.from(authorization.split('.')[1], 'base64url').toString()).sub; } catch { /* No valid mock token. */ }
    if (url.pathname.endsWith('/user')) {
      const user = Object.values(users).find(u => u.id === owner);
      if (method === 'PUT') state.passwordUpdated = payload.password;
      return respond(user ?? { error: 'Unauthorized' }, user ? 200 : 401);
    }
    if (url.pathname.endsWith('/assessment_reports')) {
      if (!owner) return respond({ code: '42501', message: 'Denied' }, 401);
      if (method === 'GET') {
        if (state.failLoad) return respond({ message: 'Unavailable' }, 503);
        if (url.searchParams.get('user_id') !== `eq.${owner}`) return respond({ message: 'Missing owner filter' }, 400);
        const offset = Number(url.searchParams.get('offset') || 0);
        const limit = Number(url.searchParams.get('limit') || 21);
        const rows = [...state.rows.values()].filter(row => row.user_id === owner).sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id));
        return respond(rows.slice(offset, offset + limit));
      }
      if (method === 'POST') {
        state.submissions.push(payload);
        if (state.failSave) return respond({ message: 'Unavailable' }, 503);
        if (payload.user_id !== owner || (state.rows.has(payload.id) && state.rows.get(payload.id).user_id !== owner)) return respond({ code: '42501', message: 'Denied' }, 403);
        const row = {
          ...payload,
          created_at: state.rows.get(payload.id)?.created_at ?? new Date().toISOString(),
          resilience_score: Math.round((payload.future_axis + 100) / 200 * 25) + Math.round((payload.power_axis + 100) / 200 * 40) + payload.clarity + payload.ambition,
          current_quadrant: payload.future_axis >= 0 ? (payload.power_axis >= 0 ? 1 : 4) : (payload.power_axis >= 0 ? 2 : 3),
        };
        state.rows.set(row.id, row);
        if (state.loseResponse) return route.abort('failed');
        return respond(row, 201);
      }
    }
    return respond({ message: `Unexpected mock request: ${method} ${url.pathname}` }, 500);
  });
  return state;
}

export async function login(page, email = 'alice@example.com') {
  await page.goto('/');
  await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill('test-password-123');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
}
