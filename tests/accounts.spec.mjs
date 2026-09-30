import { test, expect } from '@playwright/test';
import { mockSupabase, login, users, tokenFor } from './helpers/mock-supabase.mjs';
import { fillAssessment } from './helpers/fill-assessment.mjs';

async function finish(page) {
  await page.getByRole('button', { name: 'Générer une synthèse de mon plan' }).click();
  await page.getByRole('button', { name: 'Terminer et ouvrir le rapport' }).click();
}

test('connexion réelle : identifiants invalides refusés', async ({ page, context }) => {
  await mockSupabase(context);
  await page.goto('/');
  await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill('alice@example.com');
  await page.getByLabel('Mot de passe', { exact: true }).fill('mauvais-mot-de-passe');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Email ou mot de passe incorrect.');
  await expect(page.getByRole('heading', { name: /Bonjour/ })).toHaveCount(0);
});

test('inscription avec confirmation, renvoi du lien et récupération du mot de passe', async ({ page, context }) => {
  const backend = await mockSupabase(context);
  await page.goto('/');
  await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();
  await page.getByLabel('Prénom ou nom d’usage').fill('Alice');
  await page.getByLabel('Email', { exact: true }).fill('alice@example.com');
  await page.getByLabel('Mot de passe', { exact: true }).fill('test-password-123');
  await page.getByLabel('Confirmer le mot de passe').fill('test-password-123');
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page.getByRole('status')).toContainText('confirmer votre adresse');
  expect(backend.lastSignup.data.display_name).toBe('Alice');
  await expect(page.getByRole('heading', { name: /Bonjour/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Déjà un compte ? Se connecter' }).click();
  await page.getByRole('button', { name: 'Email de confirmation non reçu ?' }).click();
  await page.getByRole('button', { name: 'Renvoyer le lien de confirmation' }).click();
  await expect(page.getByRole('status')).toContainText('un nouveau lien');
  expect(backend.resent).toHaveLength(1);
  await page.getByRole('button', { name: 'Déjà un compte ? Se connecter' }).click();
  await page.getByRole('button', { name: 'Mot de passe oublié ?' }).click();
  await page.getByRole('button', { name: 'Envoyer le lien' }).click();
  await expect(page.getByRole('status')).toContainText('réinitialisation');
  expect(backend.recoveries[0].url).toContain('mode%3Drecovery');
});

test('rapport complet retrouvé après rechargement, reconnexion et changement de compte', async ({ page, context }) => {
  const backend = await mockSupabase(context);
  await login(page);
  await fillAssessment(page);
  await finish(page);
  await expect(page.getByRole('status')).toHaveText('Rapport enregistré dans votre espace personnel.');
  const stored = [...backend.rows.values()][0];
  expect(stored.observe).toContain('FIN-REPONSE-0');
  expect(stored.act).toContain('FIN-REPONSE-1');
  expect(stored.transform).toContain('FIN-REPONSE-2');
  expect(stored.assessment_version).toBe(1);
  await page.reload();
  await page.getByRole('button', { name: 'Ouvrir le rapport' }).click();
  await expect(page.locator('.report-synthesis')).toContainText(stored.synthesis.reco);
  await page.getByRole('button', { name: 'Quitter le rapport' }).click();
  await page.getByRole('button', { name: 'Déconnexion', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Connexion', exact: true })).toBeVisible();
  await login(page, 'bob@example.com');
  await expect(page.getByRole('heading', { name: 'Aucune exploration' })).toBeVisible();
  await expect(page.getByText(stored.subject, { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Déconnexion', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Connexion', exact: true })).toBeVisible();
  await login(page);
  await expect(page.getByRole('button', { name: 'Ouvrir le rapport' })).toBeVisible();
});

test('réponse réseau perdue : aucun faux succès et nouvelle tentative sans doublon', async ({ page, context }) => {
  const backend = await mockSupabase(context);
  await login(page);
  await fillAssessment(page);
  backend.loseResponse = true;
  await finish(page);
  await expect(page.getByRole('alert')).toContainText('Vos réponses restent disponibles');
  await expect(page.locator('textarea').nth(1)).toHaveValue(/FIN-REPONSE-1/);
  await expect(page.getByRole('article')).toHaveCount(0);
  expect(backend.rows.size).toBe(1);
  backend.loseResponse = false;
  await page.locator('textarea').nth(1).fill('Action corrigée après la coupure réseau.');
  await page.getByRole('button', { name: 'Générer une synthèse de mon plan' }).click();
  await page.getByRole('button', { name: 'Terminer et ouvrir le rapport' }).click();
  await expect(page.getByRole('article')).toBeVisible();
  expect(backend.rows.size).toBe(1);
  expect(new Set(backend.submissions.map(row => row.id)).size).toBe(1);
  expect([...backend.rows.values()][0].act).toBe('Action corrigée après la coupure réseau.');
});

test('échec de chargement visible et déconnexion refusée sans faux succès', async ({ page, context }) => {
  const backend = await mockSupabase(context);
  backend.failLoad = true;
  await login(page);
  await expect(page.getByRole('alert')).toContainText('n’ont pas pu être chargés');
  await expect(page.getByRole('heading', { name: 'Aucune exploration' })).toHaveCount(0);
  backend.failLoad = false;
  await page.getByRole('button', { name: 'Réessayer le chargement' }).click();
  await expect(page.getByRole('heading', { name: 'Aucune exploration' })).toBeVisible();
  backend.failLogout = true;
  await page.getByRole('button', { name: 'Déconnexion', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Bonjour, Alice/ })).toBeVisible();
  backend.failLogout = false;
  await page.getByRole('button', { name: 'Déconnexion', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Connexion', exact: true })).toBeVisible();
});

test('lien de récupération : nouveau mot de passe enregistré avant l’accès à l’espace', async ({ page, context }) => {
  const backend = await mockSupabase(context);
  const user = users['alice@example.com'];
  await page.goto(`/?mode=recovery#access_token=${tokenFor(user)}&refresh_token=refresh-${user.id}&expires_in=3600&token_type=bearer&type=recovery`);
  await expect(page.getByRole('heading', { name: 'Choisir un nouveau mot de passe' })).toBeVisible();
  await page.getByLabel('Nouveau mot de passe', { exact: true }).fill('new-password-456');
  await page.getByLabel('Confirmer le mot de passe').fill('new-password-456');
  await page.getByRole('button', { name: 'Enregistrer le mot de passe' }).click();
  await expect(page.getByRole('heading', { name: /Bonjour, Alice/ })).toBeVisible();
  expect(backend.passwordUpdated).toBe('new-password-456');
  expect(page.url()).not.toContain('mode=recovery');
});

test('déconnexion propagée aux autres onglets sans conserver de rapport privé', async ({ page, context }) => {
  await mockSupabase(context);
  await login(page);
  await fillAssessment(page);
  await finish(page);
  await expect(page.getByRole('article')).toBeVisible();
  const second = await context.newPage();
  await second.goto('/');
  await expect(second.getByRole('button', { name: 'Ouvrir le rapport' })).toBeVisible();
  await second.getByRole('button', { name: 'Déconnexion', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Connexion|Cartographiez/ })).toBeVisible();
});

test('historique paginé : les rapports au-delà des vingt premiers restent accessibles', async ({ page, context }) => {
  const backend = await mockSupabase(context);
  for (let i = 0; i < 22; i += 1) {
    const id = `aaaaaaaa-aaaa-4aaa-8aaa-${String(i).padStart(12, '0')}`;
    backend.rows.set(id, {
      id, user_id: users['alice@example.com'].id, created_at: new Date(Date.UTC(2026, 8, 30, 8, i)).toISOString(),
      subject: `Rapport historique numéro ${i}`, future_axis: 0, power_axis: 1, clarity: 8, ambition: 11,
      current_quadrant: 1, desired_quadrant: 1, resilience_score: 52, assessment_version: 1,
      observe: 'Observer les progrès', act: 'Agir chaque jour', transform: 'Transformer les pratiques',
      synthesis: { diagnostic: 'Diagnostic', vigilance: 'Vigilance', reco: 'Action recommandée' },
    });
  }
  await login(page);
  await expect(page.getByRole('button', { name: 'Ouvrir le rapport', exact: true })).toHaveCount(20);
  await page.getByRole('button', { name: 'Charger les rapports précédents' }).click();
  await expect(page.getByRole('button', { name: 'Ouvrir le rapport', exact: true })).toHaveCount(22);
  await expect(page.getByRole('button', { name: 'Charger les rapports précédents' })).toHaveCount(0);
});

test('session révoquée : aucune donnée privée restaurée après expiration', async ({ page, context }) => {
  const backend = await mockSupabase(context);
  await login(page);
  await expect(page.getByRole('heading', { name: /Bonjour, Alice/ })).toBeVisible();
  await page.evaluate(() => {
    const key = 'sb-emis-test-auth-token';
    const session = JSON.parse(localStorage.getItem(key));
    session.expires_at = 1;
    localStorage.setItem(key, JSON.stringify(session));
  });
  backend.expireRefresh = true;
  await page.reload();
  await expect(page.getByRole('button', { name: 'Connexion', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Bonjour/ })).toHaveCount(0);
});

test('démo explicite : aucune évaluation envoyée malgré un service configuré', async ({ page, context }) => {
  const backend = await mockSupabase(context);
  await page.goto('/');
  await page.getByRole('button', { name: 'Essayer la démo', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('aucun rapport n’est enregistré en ligne');
  await fillAssessment(page);
  await finish(page);
  await expect(page.getByRole('article')).toBeVisible();
  expect(backend.submissions).toHaveLength(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Connexion', exact: true })).toBeVisible();
});
