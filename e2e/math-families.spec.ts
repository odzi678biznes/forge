import { expect, test, type Page } from '@playwright/test';
import { MATH_CORPUS } from '../content/math';
import { specializedMathPlan } from '../src/features/questions/math-specialized-plans';
import { open, otworzPlan, expectNoSideScroll } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/nauczyciel**', route => route.fulfill({ status: 503, json: { dostepny: false, blad: 'Test bez dostawcy AI' } }));
  await page.route('**/api/lektor**', route => route.fulfill({ status: 503, json: { dostepny: false } }));
});

async function startQuestion(page: Page, id: string) {
  await open(page); await otworzPlan(page);
  await page.getByRole('button', { name: /Diagnoza przekrojowa/ }).click();
  await page.getByRole('button', { name: 'Zacznij diagnozę' }).click();
  await expect(page.locator('.arena__count')).toBeVisible();
  const question = MATH_CORPUS.questions.find(q => q.id === id)!;
  const skill = MATH_CORPUS.skills.find(s => s.id === question.skillId)!;
  // Isolated Playwright browser context only: no real learner state is touched.
  await page.evaluate(async ({ question, skill }) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('forge'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    const tx = db.transaction('preferences', 'readwrite'), store = tx.objectStore('preferences');
    const request = store.get('learning.activeMission.v1');
    request.onsuccess = () => {
      const saved = request.result, session = JSON.parse(saved.value);
      session.current = { ...session.current, question, skill }; session.draft = null;
      store.put({ ...saved, value: JSON.stringify(session) });
    };
    await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); db.close();
  }, { question, skill });
  await page.reload(); await expect(page.locator('.arena')).toHaveAttribute('data-math-ready', 'true');
  return question;
}
async function attempts(page: Page, questionId: string) {
  return page.evaluate(async id => {
    const db = await new Promise<IDBDatabase>(resolve => { const r = indexedDB.open('forge'); r.onsuccess = () => resolve(r.result); });
    const rows = await new Promise<Array<{ questionId: string; hintLevel: number; correctness: string }>>(resolve => {
      const r = db.transaction('attempts').objectStore('attempts').getAll(); r.onsuccess = () => resolve(r.result);
    }); db.close(); return rows.filter(row => row.questionId === id);
  }, questionId);
}

for (const id of ['n-abs-3', 'e-ineq-6', 'q-disc-1', 'l-for-6', 'f-bas-7']) {
  test(`${id}: sensowne etapy, błąd, wznowienie i pojedynczy finał`, async ({ page }) => {
    const question = await startQuestion(page, id), plan = specializedMathPlan(question)!;
    expect(plan).not.toBeNull();
    if (id === 'n-abs-3') {
      expect(plan).toHaveLength(2);
      expect(plan[0]!.rhs).toBe('-5<x-2<5');
      expect(plan[1]!.stageKind).toBe('final');
    }
    const micro = page.getByRole('region', { name: 'Małe kroki zadania' });
    await expect(micro).toBeVisible();
    expect(await attempts(page, id)).toHaveLength(0);
    const first = plan[0]!, wrongIndex = first.options.findIndex(o => o.answer !== first.rhs);
    await micro.locator('button.choice').nth(wrongIndex).click();
    await expect(micro.getByRole('status')).toHaveText('Spróbuj jeszcze raz.');
    await page.getByRole('button', { name: 'Zapisz i wyjdź', exact: true }).click();
    await page.getByRole('button', { name: 'Wznów przerwaną sesję', exact: true }).click();
    await page.reload(); await expect(page.locator('.arena')).toHaveAttribute('data-math-ready', 'true');
    await expect(micro.getByRole('status')).toHaveText('Spróbuj jeszcze raz.');
    for (let index = 0; index < plan.length; index++) {
      const step = plan[index]!;
      await expect(micro.locator('button.choice')).toHaveCount(step.options.length);
      // The first frame must still show the current mini-question, never the final answer form.
      await expect(page.locator('.arena__answer .choice')).toHaveCount(0);
      await micro.locator('button.choice').nth(step.options.findIndex(o => o.answer === step.rhs)).click();
      if (index === 0 && plan.length > 1) {
        await page.reload(); await expect(page.locator('.arena')).toHaveAttribute('data-math-ready', 'true');
        expect(await attempts(page, id)).toHaveLength(0);
      }
      await expectNoSideScroll(page, `${id} etap ${index + 1}`);
    }
    await expect(page.locator('.fb__verdict')).toHaveText('Dobrze');
    await expect.poll(async () => (await attempts(page, id)).length).toBe(1);
    const result = (await attempts(page, id))[0]!;
    expect(result.correctness).toBe('correct');
    expect(result.hintLevel).toBeGreaterThan(0);
    await page.reload(); await expect(page.locator('.fb__verdict')).toHaveText('Dobrze');
    expect(await attempts(page, id)).toHaveLength(1);
  });
}

test('powtórka krokami zachowuje fokus na bieżącym etapie', async ({ page }) => {
  const question = await startQuestion(page, 'n-abs-3'), plan = specializedMathPlan(question)!;
  await page.getByRole('button', { name: 'Znam odpowiedź', exact: true }).click();
  const wrongIndex = question.choices!.findIndex((_choice, index) => 'ABCD'[index] !== question.answer);
  await page.locator('.arena__answer button.choice').nth(wrongIndex).click();
  await page.getByRole('button', { name: /^Sprawdź odpowiedź/ }).click();
  await page.getByRole('button', { name: 'Rozwiąż krokami', exact: true }).click();
  const review = page.getByRole('dialog', { name: 'Rozwiąż krokami', exact: true });
  const first = plan[0]!;
  await review.locator('button.choice').nth(first.options.findIndex(option => option.answer === first.rhs)).click();
  await expect(review.getByRole('heading')).toBeFocused();
  await expect(review).toContainText('Krok 2 z 2');
  await page.keyboard.press('Tab');
  await expect(review.locator('button.choice').first()).toBeFocused();
  expect(await attempts(page, question.id)).toHaveLength(1);
});

test('warunek w poleceniu nie ukrywa rachunku do wykonania', async ({ page }) => {
  await startQuestion(page, 'k-prm-8');
  const micro = page.getByRole('region', { name: 'Małe kroki zadania' });
  await expect(micro.getByRole('heading')).toContainText('Uprość wyróżnik');
  await expect(micro.locator('.arena__micro-expression')).toBeVisible();
  await expect(micro.locator('.arena__micro-expression annotation')).toHaveText('2^2-4m');
  expect(await micro.locator('button.choice').count()).toBeLessThanOrEqual(4);
  expect(await attempts(page, 'k-prm-8')).toHaveLength(0);
});
