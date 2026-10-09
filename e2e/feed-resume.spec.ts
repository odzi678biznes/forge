import { test, expect, type Page } from '@playwright/test';
import { open, chooseSubject, expectNoSideScroll } from './helpers';
import { M1, M2, operation, solveWorked, expectExpression, lessonState, calculationDraft, feedCheckpoint, openWorkedMore, mockLearningApis } from './worked-helpers';

test.beforeEach(async ({ page }) => mockLearningApis(page));
async function resume(page: Page) {
  await page.getByRole('button', { name: 'Wyjdź z lekcji', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Wznów przerwaną lekcję', exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Wznów przerwaną lekcję', exact: true }).click();
  await expect(page.locator('.karta__pytanie')).toBeVisible();
}
async function start(page: Page) {
  await open(page);
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
}

test('wzór, błędna operacja i historia wracają, a finał tworzy tylko jedną wspomaganą próbę', async ({ page }) => {
  await start(page);
  await operation(page, M1, 0, false);
  const feedback = await page.locator('.worked-calculation__feedback--incorrect').innerText();
  await expectExpression(page, M1.initialTex);
  await resume(page);
  await expect(page.locator('.worked-calculation__feedback--incorrect')).toHaveText(feedback);
  await expectExpression(page, M1.initialTex);
  expect((await calculationDraft(page)).mistakes).toBe(1);
  await operation(page, M1, 0);
  await operation(page, M1, 1);
  await expectExpression(page, M1.steps[1]!.apply().tex);
  await expect(page.getByRole('progressbar', { name: 'Postęp obliczeń zadania' })).toHaveAttribute('aria-valuenow', '2');
  expect((await lessonState(page))?.lekcje['num-order']?.wyniki['m1-zadanie']?.proby ?? 0).toBe(0);
  await openWorkedMore(page);
  await page.getByRole('button', { name: '← Poprzedni zapis', exact: true }).click();
  await resume(page);
  await expectExpression(page, M1.steps[0]!.apply().tex);
  expect((await calculationDraft(page)).history).toHaveLength(2);
  await expect(page.locator('.worked-calculation__option')).toHaveCount(0);
  await page.getByRole('button', { name: 'Wróć do obliczeń', exact: true }).click();
  await solveWorked(page, M1, 2);
  await expectExpression(page, '\\frac{4}{25}');
  await expect.poll(async () => (await lessonState(page))?.lekcje['num-order']?.wyniki['m1-zadanie']?.proby).toBe(1);
  await resume(page);
  await expectExpression(page, '\\frac{4}{25}');
  await expect(page.locator('.worked-calculation__option')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Sprawdź odpowiedź', exact: true })).toHaveCount(0);
  await openWorkedMore(page);
  await page.getByRole('button', { name: '← Poprzedni zapis', exact: true }).click();
  await page.getByRole('button', { name: 'Następny zapis →', exact: true }).click();
  const state = await lessonState(page);
  expect(state.lekcje['num-order'].wyniki['m1-zadanie']).toMatchObject({ proby: 1, zaliczona: true, wspomagana: true });
  expect(state.lekcje['num-order'].samodzielnosc).toBe(0);
  expect(state.lekcje['num-order'].seria).toBe(0);
  expect(state.powtorki['num-order'].udanePoPrzerwie).toBe(0);
  await expectNoSideScroll(page, 'wznowione obliczenia z historią');
});

test('wielopolowa odpowiedź i kod wracają; feedback ostatniej karty nie dodaje próby', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Informatyka');
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Pomiń', exact: true }).click();
  const inputs = page.locator('.karta form.wpis input');
  await expect(inputs).toHaveCount(2);
  await inputs.nth(0).fill('121101');
  const python = page.getByRole('textbox', { name: /Twój program/ });
  if (!(await python.isVisible())) await page.getByRole('button', { name: 'Napisz i uruchom program (Python)' }).click();
  await python.fill('print(121101, 2)');
  await resume(page);
  await expect(inputs.nth(0)).toHaveValue('121101');
  await expect(inputs.nth(1)).toHaveValue('');
  await expect(python).toHaveValue('print(121101, 2)');
  await inputs.nth(1).fill('2');
  await page.getByRole('button', { name: 'Sprawdź odpowiedź', exact: true }).click();
  await expect(page.getByText('✓ Dobrze', { exact: true })).toBeVisible();
  await resume(page);
  await expect(page.getByText('✓ Dobrze', { exact: true })).toBeVisible();
  await expect(inputs.nth(1)).toHaveValue('2');
  expect((await lessonState(page)).lekcje['cs-py-basics'].wyniki['c1-zadanie'].proby).toBe(1);
});

test('zapis matematyczny nie podpowiada; teoria i pełne rozwiązanie pozostają pomocą po wznowieniu', async ({ page }) => {
  const requests: Array<{ prosba: string; kontekst: { krok: { kontekst?: string } } }> = [];
  await page.route('**/api/nauczyciel**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/setup')) return route.fulfill({ json: { localSetupAvailable: false } });
    if (path.endsWith('/status')) return route.fulfill({ json: { dostepny: true, model: 'test-only', powod: null, providerVerified: true } });
    if (route.request().method() !== 'POST') return route.fulfill({ status: 404, json: { blad: 'Atrapa testowa.' } });
    const request = route.request().postDataJSON() as typeof requests[number]; requests.push(request);
    if (request.prosba === 'zapis') return route.fulfill({ json: { tekst: 'Przepisany zapis: $2^{-1}$.', model: 'test-only',
      struktura: { rodzaj: 'inne', ujawniaWynik: false, pytanieKontrolne: '', misconception: '', zapisKalkulatora: '2^(-1)' } } });
    if (request.prosba === 'pelne') return route.fulfill({ json: { tekst: 'Pełne rozwiązanie testowe: potęga, mnożenie, dodawanie, potęga całego nawiasu. Wynik: $4/25$.', model: 'test-only',
      struktura: { rodzaj: 'rozwiazanie', ujawniaWynik: true, pytanieKontrolne: '', misconception: '' } } });
    return route.fulfill({ status: 400, json: { blad: 'Nieoczekiwane żądanie testowe.' } });
  });
  await start(page);
  const ask = page.locator('.feed__tools').getByRole('button', { name: 'Zapytaj nauczyciela', exact: true });
  await ask.click();
  const teacher = page.getByRole('dialog', { name: 'Nauczyciel', exact: true });
  await teacher.getByRole('textbox', { name: 'Własne pytanie do nauczyciela' }).fill('dwa do potęgi minus jeden');
  await teacher.getByRole('button', { name: 'Zapisz matematycznie', exact: true }).click();
  await expect(teacher.getByText('Przepisany zapis:', { exact: false })).toBeVisible();
  await teacher.getByRole('button', { name: 'Zamknij nauczyciela', exact: true }).click();
  expect((await feedCheckpoint(page)).biez.pomoc ?? false).toBe(false);
  await operation(page, M1, 0);
  expect((await calculationDraft(page)).assisted).toBe(false);
  await openWorkedMore(page);
  await page.getByRole('button', { name: 'Teoria — przypomnij regułę', exact: true }).click();
  await resume(page);
  await openWorkedMore(page);
  await expect(page.getByRole('button', { name: 'Schowaj teorię', exact: true })).toHaveAttribute('aria-expanded', 'true');
  expect((await calculationDraft(page)).assisted).toBe(true);
  expect((await feedCheckpoint(page)).biez.pomoc).toBe(true);
  await ask.click();
  await teacher.locator('.nauczyciel__extra summary').click();
  await teacher.getByRole('button', { name: 'Pokaż pełne rozwiązanie', exact: true }).click();
  await expect(teacher.getByText('Pełne rozwiązanie testowe:', { exact: false })).toBeVisible();
  expect(requests.at(-1)?.kontekst.krok.kontekst).toContain(M1.steps[0]!.apply().tex);
  await teacher.getByRole('button', { name: 'Zamknij nauczyciela', exact: true }).click();
  await resume(page);
  expect((await feedCheckpoint(page)).biez.pomoc).toBe(true);
  await solveWorked(page, M1, 1);
  await expect.poll(async () => (await lessonState(page))?.lekcje['num-order']?.wyniki['m1-zadanie']?.wspomagana).toBe(true);
  expect((await lessonState(page)).lekcje['num-order'].wyniki['m1-zadanie'].proby).toBe(1);
  expect(requests.map(r => r.prosba)).toEqual(['zapis', 'pelne']);
});

test('M2 wznawia środkowy wzór i kończy potęgą, a bezbłędny wybór metody nadal jest pracą prowadzoną', async ({ page }) => {
  await start(page);
  await solveWorked(page);
  expect((await calculationDraft(page)).assisted).toBe(false);
  await expect.poll(async () => (await lessonState(page))?.lekcje['num-order']?.wyniki['m1-zadanie']?.wspomagana).toBe(true);
  await page.locator('.feed__primary').getByRole('button', { name: 'Dalej →', exact: true }).click();
  await page.getByRole('button', { name: 'Wróć do „Dziś”', exact: true }).click();
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  await expectExpression(page, M2.initialTex);
  await operation(page, M2, 0);
  await resume(page);
  await expectExpression(page, M2.steps[0]!.apply().tex);
  await operation(page, M2, 1);
  await expectExpression(page, '2^{-32}\\cdot2^{48}');
  await operation(page, M2, 2);
  await expectExpression(page, '2^{16}');
  await expect.poll(async () => (await lessonState(page))?.lekcje['num-powers']?.wyniki['m2-zadanie']?.proby).toBe(1);
  await resume(page);
  await expectExpression(page, '2^{16}');
  const state = await lessonState(page);
  expect(state.lekcje['num-powers'].wyniki['m2-zadanie']).toMatchObject({ proby: 1, wspomagana: true });
  expect(state.lekcje['num-order'].wyniki['m1-zadanie'].proby).toBe(1);
  await expectNoSideScroll(page, 'M2 wynik potęgowy');
});


test('Znam odpowiedź w lekcji zapisuje wybór bez zaliczenia i daje samodzielny finał', async ({page}) => {
  await start(page);
  await page.getByRole('button',{name:'Znam odpowiedź',exact:true}).click();
  await expect(page.locator('.worked-calculation')).toHaveCount(0);
  expect((await lessonState(page))?.lekcje['num-order']?.wyniki['m1-zadanie']?.proby??0).toBe(0);
  await resume(page);
  await expect(page.locator('.worked-calculation')).toHaveCount(0);
  const correct=page.locator('.opcja').filter({has:page.locator('annotation[encoding="application/x-tex"]', {hasText:'{4}{25}'})});
  await correct.click();
  await page.getByRole('button',{name:'Sprawdź odpowiedź',exact:true}).click();
  await expect.poll(async()=> (await lessonState(page)).lekcje['num-order']?.wyniki['m1-zadanie']?.proby).toBe(1);
  const result=(await lessonState(page)).lekcje['num-order'];
  expect(result.wyniki['m1-zadanie'].pierwsza).toBe(true);
  expect(result.wyniki['m1-zadanie'].wspomagana).not.toBe(true);
  expect(result.seria).toBeGreaterThan(0);
});

test('błędny samodzielny finał można przećwiczyć bez nadpisywania pierwszej oceny', async ({page}) => {
  await start(page);
  await page.getByRole('button',{name:'Znam odpowiedź',exact:true}).click();
  await page.locator('.opcja').first().click();
  await page.getByRole('button',{name:'Sprawdź odpowiedź',exact:true}).click();
  const before=(await lessonState(page)).lekcje['num-order'].wyniki['m1-zadanie'];
  expect(before.pierwsza).toBe(false);
  await page.getByRole('button',{name:'Rozwiąż krokami',exact:true}).click();
  const review=page.getByRole('dialog',{name:'Rozwiąż krokami',exact:true});
  for(let i=0;i<M1.steps.length;i++) await operation(page,M1,i);
  await expect(review).toHaveCount(0);
  expect((await lessonState(page)).lekcje['num-order'].wyniki['m1-zadanie']).toEqual(before);
});
