import { expect, test } from '@playwright/test';
import { expectNoSideScroll, open } from './helpers';
import { M1, operation, expectExpression, calculationDraft, openWorkedMore, mockLearningApis } from './worked-helpers';
test.beforeEach(async ({ page }) => mockLearningApis(page));

test('analiza błędu ma dane, zasadę i odpowiedzi oddzielone od obliczeń', async ({ page }, testInfo) => {
  await open(page);
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  await operation(page, M1, 0);
  const previous = M1.steps[0]!.apply().tex;
  await expectExpression(page, previous);
  const zapis = page.locator('.worked-calculation__expression');
  await expect(zapis.getByRole('button')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Wybierz odpowiedź', exact: true }).getByRole('button')).toHaveCount(4);
  const wrong = M1.steps[1]!.options.findIndex(o => o.id === 'add-first');
  await page.locator('.worked-calculation__option').nth(wrong).click();
  await expect(page.locator('.worked-calculation__feedback--incorrect')).toHaveText('Spróbuj jeszcze raz');
  expect((await calculationDraft(page)).mistakes).toBe(1);
  await expectExpression(page, previous);
  await openWorkedMore(page);
  await page.getByRole('button', { name: 'Teoria — przypomnij regułę', exact: true }).click();
  await expect(page.locator('.worked-calculation__theory')).toContainText('mnożenie przed dodawaniem');
  await operation(page, M1, 1);
  await expect(page.locator('.worked-calculation__feedback--correct')).toContainText('Dobrze');
  await expectExpression(page, M1.steps[1]!.apply().tex);
  if (testInfo.project.name === 'telefon') {
    await expectNoSideScroll(page, 'analiza błędu');
    await page.screenshot({ path: testInfo.outputPath('analiza-bledu-telefon.png'), fullPage: true });
  }
});

test('rozwiązanie jest dostępne bez liczenia i nie zalicza automatycznie zadania', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  const progress = page.getByRole('progressbar');
  const before = await progress.getAttribute('aria-valuenow');
  // Rozwiązanie jest pod ikoną 📄, a nie na karcie.
  await page.getByRole('button', { name: 'Zadanie i wykład', exact: true }).click();
  await page.getByText('Źródło i pełne rozwiązanie', { exact: true }).click();
  await expect(page.getByText('Samo odsłonięcie', { exact: false })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(progress).toHaveAttribute('aria-valuenow', before!);
  await expect(page.getByRole('button', { name: 'Pomiń' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Wybierz odpowiedź', exact: true }).getByRole('button')).toHaveCount(4);
  await expectExpression(page, M1.initialTex);
});
