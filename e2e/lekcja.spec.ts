import { expect, test } from '@playwright/test';
import { chooseSubject, open } from './helpers';

test('z feedu można otworzyć wykład: intuicja, przepis i pytanie do odsłonięcia', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Biznes i zarządzanie');
  await page.getByRole('button', { name: /Kontynuuj/ }).click();
  await page.getByRole('button', { name: 'Wykład' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Przedsiębiorczość i innowacje' })).toBeVisible();
  for (const name of ['Skąd to się bierze', 'Jak to zrobić', 'Sprawdź, czy rozumiesz']) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
  }
  const answer = page.getByText(/^Procesowa — zmienia się sposób wytwarzania/);
  await expect(answer).toHaveCount(0);
  await page.getByRole('button', { name: 'Pokaż odpowiedź' }).click();
  await expect(answer).toBeVisible();
});

test('wzory w kartach matematyki renderują się bez błędów', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Matematyka');
  await page.getByRole('button', { name: /Kontynuuj/ }).click();
  await expect(page.locator('.karta .katex').first()).toBeVisible();
  await expect(page.locator('.katex-error')).toHaveCount(0);
});
