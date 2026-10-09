import { expect, test } from '@playwright/test';
import { open, otworzPlan, otworzWyklad } from './helpers';

test('systemowe wstecz zamyka panel, wraca o kartę i potem do mapy', async ({ page }) => {
  await open(page);
  await otworzPlan(page);
  await page.getByRole('button', { name: 'Mapa', exact: true }).click();
  await page.getByRole('button', { name: /^Trenuj: Ułamki i kolejność działań/ }).click();
  // Compare the stable DOM text: KaTeX visual lines vary after a rerender.
  const first = await page.locator('.karta__pytanie').textContent() ?? '';
  expect(first.trim()).not.toBe('');
  await page.getByRole('button', { name: 'Pomiń', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Seria skończona', exact:true })).toBeVisible();
  await otworzWyklad(page);
  await page.goBack();
  await expect(page.getByRole('dialog', { name: 'Wykład' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Seria skończona', exact:true })).toBeVisible();
  await page.goBack();
  await expect(page.locator('.karta__pytanie')).toHaveText(first);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Mapa umiejętności' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Plan i postęp' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Dziś · Matematyka' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Dziś · Matematyka' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Dziś · Matematyka' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Dziś · Matematyka' })).toBeVisible();
});
