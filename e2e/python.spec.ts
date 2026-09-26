import { expect, test } from '@playwright/test';
import { chooseSubject, open, otworzPlan } from './helpers';

const SOLUTION = `def suma_cyfr(n):
    suma = 0
    while n > 0:
        suma += n % 10
        n //= 10
    return suma
`;

test('kod w Pythonie uruchamia się w przeglądarce i przechodzi testy', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Informatyka');
  await otworzPlan(page);
  await page.getByRole('button', { name: /Diagnoza przekrojowa/ }).click();
  await page.getByRole('button', { name: 'Zacznij diagnozę' }).click();

  // Pierwsza sonda informatyki to funkcja suma_cyfr (py-l-4).
  const editor = page.locator('#code-editor');
  await expect(editor).toBeVisible();
  await expect(page.getByText(/suma_cyfr/).first()).toBeVisible();
  await editor.fill(SOLUTION);
  await page.getByRole('button', { name: 'Uruchom testy' }).click();

  // Pierwsze uruchomienie ładuje Pyodide (ok. 13 MB), stąd dłuższy limit.
  await expect(page.getByText('Dobrze', { exact: true })).toBeVisible({ timeout: 90_000 });
});
