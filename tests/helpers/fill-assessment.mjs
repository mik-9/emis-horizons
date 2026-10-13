export async function fillAssessment(page, long = false) {
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
