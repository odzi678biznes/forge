import { expect, test, type Page } from '@playwright/test';
import { open } from './helpers';

/**
 * Nowy tryb nauki matematyki (demo): pełne zadanie krok po kroku, lokalna
 * diagnoza błędu, zapis w osobnym kluczu z kopią bezpieczeństwa,
 * wznowienie po przeładowaniu i fiszki swipe w istniejącym systemie pudełek.
 */

async function preferencje(page: Page): Promise<{ klucze: string[]; kopie: number }> {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        const req = indexedDB.open('forge');
        req.onsuccess = () => {
          const db = req.result;
          const t = db.transaction(['preferences', 'backups']);
          const p = t.objectStore('preferences').getAllKeys();
          const b = t.objectStore('backups').count();
          t.oncomplete = () => resolve({ klucze: (p.result as string[]).map(String), kopie: b.result });
        };
      }),
  );
}

/** Zaznacza kolejne opcje, aż krok zostanie zaliczony; zwraca liczbę prób. */
async function rozwiazWybor(page: Page): Promise<number> {
  const opcje = page.locator('.deep .sesja-opcja');
  let proby = 0;
  for (let i = 0; i < (await opcje.count()); i++) {
    if (await opcje.nth(i).isDisabled()) continue;
    await opcje.nth(i).click();
    await page.locator('#sesja-akcja').getByRole('button', { name: 'Sprawdź' }).click();
    proby++;
    if (await page.locator('.deep .sesja-info--ok').isVisible()) return proby;
  }
  return proby;
}

test('pełne zadanie: diagnoza błędu, zapis osobno od starego postępu, wznowienie', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: /Kontynuuj matematykę/ }).click();
  await expect(page.getByText('Poziom opanowania:')).toBeVisible();
  await page.getByRole('button', { name: /Zacznij lekcję/ }).click();

  await expect(page.locator('.deep__etap')).toContainText('Krok 1 z 10');
  await expect(page.getByText(/nie pochodzi z arkusza CKE/)).toBeVisible();
  // Zła odpowiedź nie kończy kroku i dostaje konkretną przyczynę.
  const proby = await rozwiazWybor(page);
  if (proby > 1) await expect(page.locator('.sesja-info--zle')).toHaveCount(0);
  await expect(page.locator('.deep .sesja-info--ok')).toBeVisible();
  await page.locator('#sesja-akcja').getByRole('button', { name: /Dalej/ }).click();
  await expect(page.locator('.deep__etap')).toContainText('Krok 2 z 10');
  await expect(page.locator('.deep__rozwiazanie')).toContainText('Twoje rozwiązanie');

  // Stary postęp nietknięty: nowy tryb ma własny klucz i zrobił kopię bezpieczeństwa.
  await expect.poll(async () => (await preferencje(page)).klucze).toContain('learning_progress_v2');
  expect((await preferencje(page)).kopie).toBeGreaterThanOrEqual(1);

  // Wyrażenie: równoważny zapis przechodzi, typowy błąd ma nazwaną przyczynę.
  await rozwiazWybor(page);
  await page.locator('#sesja-akcja').getByRole('button', { name: /Dalej/ }).click();
  await rozwiazWybor(page);
  await page.locator('#sesja-akcja').getByRole('button', { name: /Dalej/ }).click();
  if (await page.locator('.mikro').isVisible()) {
    const o = page.locator('.mikro .sesja-opcja');
    for (let i = 0; i < (await o.count()) && !(await page.locator('#sesja-akcja button').isVisible()); i++) {
      if (!(await o.nth(i).isDisabled())) await o.nth(i).click();
    }
    await page.locator('#sesja-akcja button').click();
  }
  await expect(page.locator('.deep__etap')).toContainText('Krok 4 z 10');
  await page.locator('#deep-wpis').fill('m^2+8m+24');
  await page.locator('#sesja-akcja').getByRole('button', { name: 'Sprawdź' }).click();
  await expect(page.locator('.sesja-info--zle')).toContainText('MINUS');
  await page.locator('#deep-wpis').fill('(m-4)(m+4)');
  await page.locator('#sesja-akcja').getByRole('button', { name: 'Sprawdź' }).click();
  await expect(page.locator('.deep .sesja-info--ok')).toBeVisible();

  // Nauczyciel jest dostępny w każdym kroku (tu: tryb demonstracyjny bez serwera).
  await page.getByRole('button', { name: /Zapytaj AI/ }).click();
  await expect(page.getByRole('dialog', { name: 'Nauczyciel' })).toBeVisible();
  await page.getByRole('button', { name: 'Zamknij nauczyciela' }).click();

  await page.locator('#sesja-akcja').getByRole('button', { name: /Dalej/ }).click();
  await page.reload();
  // „Kontynuuj” na Dziś prowadzi prosto do miejsca, w którym uczeń skończył.
  await page.getByRole('button', { name: /Kontynuuj matematykę/ }).click();
  await expect(page.locator('.deep__etap')).toContainText('Krok 5 z 10');
  await expect(page.locator('.deep__rozwiazanie')).toContainText('4 kroki');
});

test('fiszki swipe: odwrócenie, decyzja i licznik talii', async ({ page }) => {
  await page.goto('./#sesja');
  await page.getByRole('button', { name: /Fiszki swipe/ }).click();
  await expect(page.locator('.fiszki-lekcja__licznik')).toHaveText('1 / 12');
  const wiedzialem = page.getByRole('button', { name: 'Wiedziałem', exact: true });
  await expect(wiedzialem).toBeDisabled();
  await page.getByRole('button', { name: 'Odwróć' }).click();
  await expect(wiedzialem).toBeEnabled();
  await wiedzialem.click();
  await expect(page.locator('.fiszki-lekcja__licznik')).toHaveText('2 / 12');
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowLeft');
  // „Nie wiedziałem” wraca na koniec talii.
  await expect(page.locator('.fiszki-lekcja__licznik')).toHaveText('3 / 13');
});
