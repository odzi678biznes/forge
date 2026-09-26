import { expect, test } from '@playwright/test';
import { expectNoSideScroll, open } from './helpers';

test('analiza błędu ma dane, zasadę i odpowiedzi oddzielone od obliczeń', async ({ page }, testInfo) => {
  await open(page);
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Pomiń' }).click();
  await expect(page.locator('.karta__kontekst')).toContainText('Mnożenie wykonujemy przed dodawaniem');
  const zapis = page.getByRole('list', { name: 'Zapis do sprawdzenia' });
  await expect(zapis.getByRole('listitem')).toHaveCount(3);
  await expect(zapis.getByRole('button')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Odpowiedzi', exact: true }).getByRole('button')).toHaveCount(3);
  await page.getByRole('button', { name: /Wiersz 2/ }).click();
  await page.getByRole('button', { name: 'Sprawdź odpowiedź' }).click();
  await expect(page.getByRole('status')).toContainText('Dobrze');
  await expect(page.locator('.info__wyjasnienie')).toContainText('nie jest pierwszym błędem');
  if (testInfo.project.name === 'telefon') {
    await expectNoSideScroll(page, 'analiza błędu');
    await page.screenshot({ path: testInfo.outputPath('analiza-bledu-telefon.png'), fullPage: true });
  }
});

test('rozwiązanie jest dostępne bez liczenia i nie zalicza automatycznie zadania', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  for (let i = 0; i < 8; i++) await page.getByRole('button', { name: 'Pomiń' }).click();
  const progress = page.getByRole('progressbar');
  const before = await progress.getAttribute('aria-valuenow');
  await page.getByText('Nie mam jak liczyć — pokaż rozwiązanie', { exact: true }).click();
  await expect(page.getByText('Samo odsłonięcie', { exact: false })).toBeVisible();
  await expect(progress).toHaveAttribute('aria-valuenow', before!);
  await expect(page.getByRole('button', { name: 'Pomiń' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Odpowiedzi A–D' }).getByRole('button')).toHaveCount(4);
});
