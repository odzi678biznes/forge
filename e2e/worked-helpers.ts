import { expect, type Page } from '@playwright/test';
import { getWorkedPlan, type WorkedPlan } from '../src/nauka/worked-plans';
export const M1 = getWorkedPlan('mat-2209-pp-1')!;
export const M2 = getWorkedPlan('mat-2405-pp-2')!;

export async function mockLearningApis(page: Page) {
  await page.route('**/api/nauczyciel**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/setup')) return route.fulfill({ json: { localSetupAvailable: false } });
    if (path.endsWith('/status')) return route.fulfill({ json: { dostepny: false, model: null, powod: 'Test lokalny.' } });
    return route.fulfill({ status: 503, json: { blad: 'Test nie używa dostawcy AI.' } });
  });
  await page.route('**/api/lektor**', route => route.fulfill({ json: { dostepny: false } }));
}
export async function operation(page: Page, plan: WorkedPlan, stepIndex: number, correct = true) {
  const step = plan.steps[stepIndex]!;
  await expect(page.locator('.worked-calculation')).toHaveAttribute('data-step', step.id);
  await expect(page.locator('.worked-calculation h2')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Wybierz odpowiedź', exact: true }).getByRole('button')).toHaveCount(step.options.length);
  const index = step.options.findIndex(o => correct ? o.id === step.correctId : o.id !== step.correctId);
  await page.locator('.worked-calculation__option').nth(index).click();
}
export async function openWorkedMore(page: Page) {
  const details = page.locator('.worked-calculation__history');
  if (!(await details.evaluate(el => (el as HTMLDetailsElement).open))) await details.locator('summary').click();
  await expect(details).toHaveAttribute('open', '');
}
export async function feedCheckpoint(page: Page, skillId = 'num-order') {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? 'null')?.value,
    `forge.lesson-draft.v1:feed:nauka:${skillId}`);
}
export async function solveWorked(page: Page, plan = M1, from = 0) {
  for (let i = from; i < plan.steps.length; i++) await operation(page, plan, i);
  await expect(page.getByRole('heading', { name: 'Obliczenia zakończone', exact: true })).toBeVisible();
}
export async function expectExpression(page: Page, tex: string) {
  await expect(page.locator('.worked-calculation__expression annotation[encoding="application/x-tex"]')).toHaveText(tex);
}
export async function lessonState(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open('forge'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    });
    const raw = await new Promise<{ key: string; value: string }>((resolve, reject) => {
      const r = db.transaction('preferences').objectStore('preferences').get('nauka.v1');
      r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    }); db.close();
    return JSON.parse(raw?.value ?? 'null');
  });
}
export async function calculationDraft(page: Page, plan = M1) {
  const key = `forge.lesson-draft.v1:worked:worked:feed:${plan.skillId}:nauka:${plan.id}:course`;
  return page.evaluate(k => JSON.parse(localStorage.getItem(k) ?? 'null')?.value, key);
}
