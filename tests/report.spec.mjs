import { test, expect } from '@playwright/test';

async function reachPlan(page, long = false) {
  await page.addInitScript(() => {
    window.__printCalls = 0;
    window.print = () => { window.__printCalls += 1; };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  await page.locator('input[type=email]').fill('test@example.com');
  await page.locator('input[type=password]').fill('test-password');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await page.getByRole('button', { name: 'Commencer maintenant' }).click();
  await page.locator('textarea').fill('Développer mon offre commerciale en ligne');
  const next = () => page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await next();
  await page.getByRole('slider').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft'); // Deliberately confirm the neutral answer.
  await next();
  await page.getByRole('slider').focus();
  await page.keyboard.press('ArrowRight');
  await next();
  for (const slider of await page.getByRole('slider').all()) {
    await slider.focus();
    await page.keyboard.press('ArrowRight');
  }
  await next();
  await next();
  await page.getByRole('button', { name: /Quadrant 1/ }).click();
  await next();
  const extra = long ? '\n' + 'Analyser les retours des clients et ajuster les actions chaque semaine. '.repeat(35) + '\n' + 'REFERENCE'.repeat(30) : '';
  for (const [i, value] of ['Observer les demandes reçues chaque semaine.', 'Lancer deux ateliers pilotes avant le 30 novembre.', 'Structurer une offre commerciale durable.'].entries()) {
    await page.locator('textarea').nth(i).fill(value + extra + ` FIN-REPONSE-${i}`);
  }
}

async function generate(page) {
  await page.getByRole('button', { name: 'Générer une synthèse de mon plan' }).click();
}

async function openReport(page) {
  await generate(page);
  await page.getByRole('button', { name: 'Terminer et ouvrir le rapport' }).click();
  await expect(page.getByRole('article', { name: 'Rapport individuel' })).toBeVisible();
}

test('rapport A4 sans débordement, commandes masquées et impression unique', async ({ page }, testInfo) => {
  await reachPlan(page);
  await openReport(page);
  await expect(page.getByText('Score: Neutre', { exact: true })).toBeVisible();
  await expect(page).toHaveTitle(/^EMIS-Horizons-Rapport-EMIS-/);
  await page.getByRole('button', { name: 'Imprimer / Enregistrer en PDF' }).click();
  await expect.poll(() => page.evaluate(() => window.__printCalls)).toBe(1);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.report-toolbar')).toBeHidden();
  // Simulate the actual printable width: 210 mm minus two 15 mm margins.
  await page.setViewportSize({ width: 680, height: 1009 });
  expect(await page.locator('.report-document').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.pdf({ path: testInfo.outputPath('rapport-standard.pdf'), preferCSSPageSize: true, printBackground: true });
  await page.emulateMedia({ media: 'screen' });
  await page.getByRole('button', { name: 'Quitter le rapport' }).click();
  await expect(page).toHaveTitle('emis-horizons');
  await page.getByRole('button', { name: 'Imprimer PDF', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__printCalls)).toBe(2);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.__printCalls)).toBe(2);
});

test('réponses longues conservées et rapport lisible sur mobile', async ({ page }, testInfo) => {
  await reachPlan(page, true);
  await openReport(page);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('rapport-mobile.png'), fullPage: true });
  await page.emulateMedia({ media: 'print' });
  await page.setViewportSize({ width: 680, height: 1009 });
  expect(await page.locator('.report-document').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.pdf({ path: testInfo.outputPath('rapport-long.pdf'), preferCSSPageSize: true, printBackground: true });
});

test('une modification invalide la synthèse et le rapport reprend les dernières réponses', async ({ page }) => {
  await reachPlan(page);
  await generate(page);
  const finish = page.getByRole('button', { name: 'Terminer et ouvrir le rapport' });
  await page.locator('textarea').nth(1).fill('Nouvelle action : rencontrer trois prospects vendredi.');
  await expect(finish).toBeDisabled();
  await expect(page.getByText('Diagnostic express', { exact: true })).toHaveCount(0);
  await generate(page);
  await expect(finish).toBeEnabled();
  await page.getByRole('button', { name: 'Précédent', exact: true }).click();
  await page.getByRole('button', { name: /Quadrant 2/ }).click();
  await page.getByRole('button', { name: 'Continuer', exact: true }).click();
  await expect(finish).toBeDisabled();
  await generate(page);
  await finish.click();
  await expect(page.locator('.report-synthesis')).toContainText('Nouvelle action : rencontrer trois prospects vendredi.');
  await expect(page.locator('.report-synthesis')).toContainText('Résistant engagé');
});

test('échec de la fenêtre d’impression : message et nouvelle tentative possibles', async ({ page }) => {
  await reachPlan(page);
  await openReport(page);
  await page.evaluate(() => { window.print = () => { throw new Error('Print blocked'); }; });
  const print = page.getByRole('button', { name: 'Imprimer / Enregistrer en PDF' });
  await print.click();
  await expect(page.getByRole('alert')).toContainText('Ctrl + P');
  await page.evaluate(() => { window.print = () => { window.__printCalls += 1; }; });
  await print.click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__printCalls)).toBe(1);
});
