import { expect, test } from '@playwright/test';
import { chooseSubject, open } from './helpers';
import { M1, M2, operation, solveWorked, expectExpression, openWorkedMore, mockLearningApis } from './worked-helpers';
test.beforeEach(async ({ page }) => mockLearningApis(page));

/**
 * Prototyp nauki: feed kart prowadzących do zadania CKE.
 * Sprawdza zachowania z założeń: błąd → łatwiejszy krok tego samego zadania,
 * pominięcie bez postępu, automatyczny zapis, zawsze widoczne wyjście,
 * nauczyciel z wyraźnie oznaczonym trybem demonstracyjnym.
 */

test('błędną operację można poprawić w tym samym zadaniu, korzystając z oddzielnej teorii', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Matematyka');
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();

  const progress = page.getByRole('progressbar', { name: 'Postęp obliczeń zadania' });
  await operation(page, M1, 0, false);
  await expect(page.locator('.worked-calculation__feedback--incorrect')).toBeVisible();
  await expect(progress).toHaveAttribute('aria-valuenow', '0');
  await expectExpression(page, M1.initialTex);
  await openWorkedMore(page);
  await page.getByRole('button', { name: 'Teoria — przypomnij regułę', exact: true }).click();
  await expect(page.locator('.worked-calculation__theory')).toContainText('odwrotność');
  await operation(page, M1, 0);
  await expect(progress).toHaveAttribute('aria-valuenow', '1');
  await expectExpression(page, M1.steps[0]!.apply().tex);
});

test('pominięcie nie daje postępu, a postęp zapisuje się sam', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Informatyka');
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  const pasek = page.getByRole('progressbar');

  await page.getByRole('button', { name: 'Pomiń' }).click();
  await expect(page.locator('.feed__komunikat')).toContainText('nie liczy się do postępu');
  await expect(pasek).toHaveAttribute('aria-valuenow', '0');

  await page.locator('.opcja').filter({ has: page.locator('annotation[encoding="application/x-tex"]', { hasText: /^101$/ }) }).click();
  await expect(page.getByText('✓ Dobrze', { exact: true })).toBeVisible();
  await expect(pasek).toHaveAttribute('aria-valuenow', '1');

  // Wyjście zawsze widoczne; po ponownym uruchomieniu lekcja jest „w trakcie”.
  await page.getByRole('button', { name: /Wyjdź/ }).click();
  await page.reload();
  await chooseSubject(page, 'Informatyka');
  await expect(page.getByRole('region', { name: 'Rekomendowana nauka' })).toContainText('Zmienne, typy i działania');
});

test('nauczyciel bez klucza API działa w oznaczonym trybie demonstracyjnym', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Biznes i zarządzanie');
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  await page.getByRole('button', { name: 'Zapytaj nauczyciela' }).click();
  await expect(page.getByText('Tryb demonstracyjny — to nie jest AI')).toBeVisible();
  // Bez listy gotowych próśb: jedna podpowiedź na start, potem własne pytania.
  await expect(page.getByRole('button', { name: 'Nie rozumiem.' })).toHaveCount(0);
  await page.getByRole('button', { name: /Pomóż mi zrobić następny krok/ }).click();
  await expect(page.locator('.dymek--nauczyciel')).toBeVisible();
});

test('po serii Dziś prowadzi do następnej lekcji, a trening rotuje karty', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Matematyka');
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  await solveWorked(page);
  await page.locator('.feed__primary').getByRole('button', { name: 'Dalej →', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Seria skończona' })).toBeVisible();
  await page.getByRole('button', { name: 'Wróć do „Dziś”' }).click();
  await expect(page.getByRole('region', { name: 'Rekomendowana nauka' })).toContainText('Potęgi o wykładniku całkowitym');
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
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  await solveWorked(page,M2);
  await page.locator('.feed__primary').getByRole('button', { name: 'Dalej →', exact: true }).click();
  await page.getByRole('button', { name: 'Wróć do „Dziś”' }).click();
  await expect(page.getByRole('region', { name: 'Rekomendowana nauka' })).toContainText('Pierwiastki i wykładnik wymierny');
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  await expect(page.getByRole('heading', { name: 'Pierwiastki i wykładnik wymierny' })).toBeVisible();
});
