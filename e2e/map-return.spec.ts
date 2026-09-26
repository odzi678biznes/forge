import { expect, test } from '@playwright/test';
import { open, otworzPlan, expectNoSideScroll } from './helpers';

test('zamknięcie lekcji wraca do mapy, instrukcja jest schowana pod znakiem zapytania', async ({ page }) => {
  await open(page);
  await otworzPlan(page);
  await page.getByRole('button', { name: 'Mapa', exact: true }).click();
  const hint = page.getByText('Kliknij umiejętność, żeby ją trenować.', { exact: false });
  await expect(hint).toHaveCount(0);
  const help = page.getByRole('button', { name: 'Jak korzystać z mapy' });
  await help.click();
  await expect(hint).toBeVisible();
  await expectNoSideScroll(page, 'rozwinięta pomoc mapy');
  await help.click();
  await expect(hint).toHaveCount(0);
  await page.getByRole('button', { name: /^Trenuj: Ułamki i kolejność działań/ }).click();
  await expect(page.getByRole('button', { name: 'Wyjdź z lekcji' })).toBeVisible();
  await page.getByRole('button', { name: 'Wyjdź z lekcji' }).click();
  await expect(page.getByRole('heading', { name: 'Mapa umiejętności' })).toBeVisible();
});
