import { expect, test } from '@playwright/test';
import { chooseSubject, open } from './helpers';

test('lekcja ma wykład: intuicję, przepis i pytanie z odpowiedzią do odsłonięcia', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Biznes i zarządzanie');
  await page.getByRole('button', { name: 'Zacznij lekcję' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Przedsiębiorczość i innowacje' })).toBeVisible();
  for (const name of ['Skąd to się bierze', 'Jak to zrobić', 'Sprawdź, czy rozumiesz']) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
  }

  const answer = page.getByText(/^Procesowa — zmienia się sposób wytwarzania/);
  await expect(answer).toHaveCount(0);
  await page.getByRole('button', { name: 'Pokaż odpowiedź' }).click();
  await expect(answer).toBeVisible();
});

test('wzory w lekcji matematyki renderują się bez błędów', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Matematyka');
  await page.getByRole('button', { name: 'Zacznij lekcję' }).click();

  await expect(page.getByRole('heading', { name: 'Jak to zrobić' })).toBeVisible();
  await expect(page.locator('.katex').first()).toBeVisible();
  await expect(page.locator('.katex-error')).toHaveCount(0);
});
