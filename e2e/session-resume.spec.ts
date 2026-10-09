import { test, expect, type Page } from '@playwright/test';
import { open, chooseSubject, otworzPlan } from './helpers';
import { mockLearningApis } from './worked-helpers';

test.beforeEach(async ({ page }) => mockLearningApis(page));
async function openConfidence(page: Page) {
  const details = page.locator('.arena__answer details').filter({ has: page.locator('summary', { hasText: 'Pewność odpowiedzi' }) });
  if (!(await details.evaluate(el => (el as HTMLDetailsElement).open))) await details.locator('summary').click();
}

async function checkpoint(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open('forge'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    });
    const read = (store: string) => new Promise<unknown[]>((resolve, reject) => {
      const r = db.transaction(store).objectStore(store).getAll();
      r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    });
    const prefs = await read('preferences') as {key: string; value: string}[];
    const attempts = await read('attempts'); db.close();
    return { session: JSON.parse(prefs.find(p => p.key === 'learning.activeMission.v1')?.value ?? 'null'), attempts: attempts.length };
  });
}

test('przerwana diagnoza zachowuje odpowiedź, podpowiedź i ocenę bez podwójnej próby', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Biznes i zarządzanie');
  await otworzPlan(page);
  await page.getByRole('button', { name: /Diagnoza przekrojowa/ }).click();
  await page.getByRole('button', { name: 'Zacznij diagnozę' }).click();
  await expect(page.getByText('Pytanie 1 z 16')).toBeVisible();
  await page.locator('#answer').fill('próba odpowiedzi');
  await openConfidence(page);
  await page.getByRole('radio', { name: 'Jestem pewny' }).check();
  await page.getByRole('button', { name: /Potrzebuję podpowiedzi/ }).click();
  await expect.poll(async () => (await checkpoint(page)).session?.draft?.hintLevel).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Zapisz i wyjdź' }).click();
  await page.getByRole('button', { name: 'Wznów przerwaną sesję' }).click();
  await expect(page.locator('#answer')).toHaveValue('próba odpowiedzi');
  await openConfidence(page);
  await expect(page.getByRole('radio', { name: 'Jestem pewny' })).toBeChecked();
  await page.reload();
  await expect(page.getByText('Pytanie 1 z 16')).toBeVisible();
  await expect(page.locator('#answer')).toHaveValue('próba odpowiedzi');
  await openConfidence(page);
  await expect(page.getByRole('radio', { name: 'Jestem pewny' })).toBeChecked();
  await expect(page.locator('.arena__hint').first()).toBeVisible();
  await page.getByRole('button', { name: /^Sprawdź odpowiedź/ }).click();
  await expect(page.locator('.fb')).toBeVisible();
  await expect.poll(async () => (await checkpoint(page)).session?.feedback?.userAnswer).toBe('próba odpowiedzi');
  expect((await checkpoint(page)).attempts).toBe(1);
  await page.reload();
  await expect(page.locator('.fb')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Sprawdź odpowiedź/ })).toHaveCount(0);
  expect((await checkpoint(page)).attempts).toBe(1);
  await page.getByRole('button', { name: /^Dalej/ }).click();
  await expect(page.getByText('Pytanie 2 z 16')).toBeVisible();
  await expect.poll(async () => (await checkpoint(page)).session?.feedback).toBeNull();
  await page.reload();
  await expect(page.getByText('Pytanie 2 z 16')).toBeVisible();
  await expect(page.locator('button.choice[aria-pressed="true"]')).toHaveCount(0);
  expect((await checkpoint(page)).attempts).toBe(1);
});
