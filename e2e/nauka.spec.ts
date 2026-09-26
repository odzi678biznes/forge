import { expect, test } from '@playwright/test';
import { chooseSubject, open } from './helpers';

/**
 * Prototyp nauki: feed kart prowadzących do zadania CKE.
 * Sprawdza zachowania z założeń: błąd → łatwiejszy krok tego samego zadania,
 * pominięcie bez postępu, automatyczny zapis, zawsze widoczne wyjście,
 * nauczyciel z wyraźnie oznaczonym trybem demonstracyjnym.
 */

test('błąd prowadzi do łatwiejszego kroku tego samego zadania CKE', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Matematyka');
  await page.getByRole('button', { name: /Kontynuuj/ }).click();

  const relacja = page.locator('.feed__relacja');
  await expect(relacja).toContainText('krok 1 z 9 zadania 1 (zadanie z arkusza CKE, 2022)');
  await page.getByRole('button', { name: /Obliczyć wartość/ }).click();
  await expect(page.getByText('Dobrze', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Dalej/ }).click();

  // Kolejność: celowo zła (dodawanie przed mnożeniem).
  await expect(page.locator('.karta__pytanie')).toContainText('Ułóż działania');
  for (const t of ['dodawanie w nawiasie', 'potęga w nawiasie', 'mnożenie', 'potęga całego']) {
    await page.locator('.kolejnosc__pula button', { hasText: t }).click();
  }
  await page.getByRole('button', { name: 'Sprawdź' }).click();
  await expect(page.getByText('Jeszcze nie', { exact: true })).toBeVisible();
  await expect(page.locator('.feed__komunikat')).toContainText('Wracamy o krok');
  await page.getByRole('button', { name: /Dalej/ }).click();

  await expect(relacja).toContainText('łatwiejszy krok zadania 1');
  await expect(page.locator('.karta__pytanie')).toContainText('Co liczysz wcześniej');
});

test('pominięcie nie daje postępu, a postęp zapisuje się sam', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Informatyka');
  await page.getByRole('button', { name: /Kontynuuj/ }).click();
  const pasek = page.getByRole('progressbar');

  await page.getByRole('button', { name: 'Pomiń' }).click();
  await expect(page.locator('.feed__komunikat')).toContainText('nie liczy się do postępu');
  await expect(pasek).toHaveAttribute('aria-valuenow', '0');

  await page.getByRole('button', { name: /n % 10.*n \/\/ 10/ }).click();
  await expect(pasek).toHaveAttribute('aria-valuenow', '1');

  // Wyjście zawsze widoczne; po ponownym uruchomieniu lekcja jest „w trakcie”.
  await page.getByRole('button', { name: /Wyjdź/ }).click();
  await page.reload();
  await chooseSubject(page, 'Informatyka');
  await expect(page.getByRole('button', { name: /Kontynuuj/ })).toContainText('Zmienne, typy i działania — krok');
});

test('nauczyciel bez klucza API działa w oznaczonym trybie demonstracyjnym', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Biznes i zarządzanie');
  await page.getByRole('button', { name: /Kontynuuj/ }).click();
  await page.getByRole('button', { name: 'Zapytaj nauczyciela' }).click();
  await expect(page.getByText('Tryb demonstracyjny — to nie jest AI')).toBeVisible();
  await page.getByRole('button', { name: 'Nie rozumiem.' }).click();
  await expect(page.locator('.dymek--nauczyciel')).toContainText('Weźmy tylko ten jeden krok');
});

test('po serii Dziś prowadzi do następnej lekcji, a trening rotuje karty', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Matematyka');
  await page.getByRole('button', { name: /Kontynuuj/ }).click();
  for (let i = 0; i < 8; i++) await page.getByRole('button', { name: 'Pomiń' }).click();
  await page.getByRole('group', { name: 'Odpowiedzi A–D' }).getByRole('button', { name: /^B\./ }).click();
  await page.getByRole('button', { name: /Dalej/ }).click();
  await expect(page.getByRole('heading', { name: 'Seria skończona' })).toBeVisible();
  await page.getByRole('button', { name: 'Wróć do „Dziś”' }).click();
  await expect(page.getByRole('button', { name: /Kontynuuj/ })).toContainText('Potęgi o wykładniku całkowitym');
  await page.getByRole('button', { name: /Statystyki →/ }).click();
  await page.getByRole('navigation', { name: 'Zakładki statystyk' }).getByRole('button', { name: 'Raport' }).click();
  await expect(page.getByRole('heading', { name: 'Lekcje z kartami w tym tygodniu' })).toBeVisible();
  await expect(page.getByText('Ułamki i kolejność działań')).toBeVisible();
  await page.locator('.week__back').click();

  await page.getByRole('button', { name: /Wszystkie lekcje w Kursie/ }).click();
  await page.getByRole('button', { name: 'Ucz się' }).first().click();
  const pierwsza = await page.locator('.karta__pytanie').textContent();
  await page.getByRole('button', { name: 'Pomiń' }).click();
  await page.getByRole('button', { name: /Wyjdź/ }).click();
  await page.getByRole('button', { name: /Wszystkie lekcje w Kursie/ }).click();
  await page.getByRole('button', { name: 'Ucz się' }).first().click();
  await expect(page.locator('.karta__pytanie')).not.toHaveText(pierwsza ?? '');
  await page.getByRole('button', { name: /Wyjdź/ }).click();
  await page.getByRole('button', { name: /Kontynuuj/ }).click();
  for (let i = 0; i < 9; i++) await page.getByRole('button', { name: 'Pomiń' }).click();
  await page.getByRole('group', { name: 'Odpowiedzi A–D' }).getByRole('button', { name: /^B\./ }).click();
  await page.getByRole('button', { name: /Dalej/ }).click();
  await page.getByRole('button', { name: 'Wróć do „Dziś”' }).click();
  await expect(page.getByRole('button', { name: /Kontynuuj/ })).toContainText('Pierwiastki i wykładnik wymierny');
  await page.getByRole('button', { name: /Kontynuuj/ }).click();
  await expect(page.getByRole('heading', { name: 'Pierwiastki i wykładnik wymierny' })).toBeVisible();
});
