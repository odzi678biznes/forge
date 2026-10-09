import { expect, test, type Locator, type Page } from '@playwright/test';
import { chooseSubject, expectNoSideScroll, open } from './helpers';

/** Both desktop and phone open the calculator only when requested. */
async function openNotebook(page: Page): Promise<Locator> {
  await expect(page.getByRole('complementary', { name: 'Rachunki obok zadania', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Rachunki i kalkulator', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Rachunki w lekcji', exact: true });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function closeNotebook(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Rachunki w lekcji', exact: true });
  if (await dialog.isVisible()) {
    await dialog.getByRole('button', { name: 'Wróć do kroku', exact: true }).click();
    await expect(dialog).toHaveCount(0);
  }
}

async function reloadAndResume(page: Page) {
  await closeNotebook(page);
  await page.getByRole('button', { name: 'Wyjdź z lekcji', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('radiogroup', { name: 'Przedmiot' })).toBeVisible();
  await page.getByRole('button', { name: 'Wznów przerwaną lekcję', exact: true }).click();
  await expect(page.locator('.karta__pytanie')).toBeVisible();
}

// Playwright supplies an isolated browser profile. These routes also ensure that
// opening the teacher never reaches a paid provider during this regression test.
test('rachunki zwykłej lekcji wracają po wyjściu i odświeżeniu, a nauczyciel widzi zapis ucznia', async ({ page }) => {
  const requests: Array<{ kontekst: { krok: { kontekst?: string; pytanie: string } }; pytanie?: string }> = [];
  await page.route('**/api/nauczyciel**', async route => {
    if (new URL(route.request().url()).pathname.endsWith('/status')) {
      await route.fulfill({ json: { dostepny: true, model: 'test-notebook', powod: null, providerVerified: true } });
      return;
    }
    if (route.request().method() !== 'POST') {
      await route.fulfill({ status: 404, json: { blad: 'Ten test używa wyłącznie atrapy nauczyciela.' } });
      return;
    }
    requests.push(route.request().postDataJSON());
    await route.fulfill({ json: { tekst: 'Widzę Twoje zapisane działania. Którą operację chcesz teraz uzasadnić?', model: 'test-notebook' } });
  });
  await page.route('**/api/lektor**', route => route.fulfill({ json: { dostepny: false, powod: 'Test bez syntezy online.' } }));

  await open(page);
  await chooseSubject(page, 'Matematyka');
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  await expect(page.locator('.karta__pytanie')).toBeVisible();
  const originalQuestion = await page.locator('.karta__pytanie').innerText();
  let notebook = await openNotebook(page);
  await expect(notebook).toBeVisible();
  await expect(notebook.getByRole('textbox', { name: 'Działanie do obliczenia', exact: true })).toBeVisible();
  await expect(notebook.locator('.math-pad')).toHaveCount(0);
  await notebook.getByRole('textbox', { name: 'Działanie do obliczenia', exact: true }).focus();
  await expect(notebook.locator('.math-pad')).toHaveCount(0);
  await notebook.getByRole('button', { name: 'Klawiatura matematyczna', exact: true }).click();
  await expect(notebook.getByRole('group', { name: 'Klawiatura matematyczna', exact: true })).toBeVisible();
  await notebook.getByRole('button', { name: 'Schowaj klawiaturę', exact: true }).click();
  await expect(notebook.locator('.math-pad')).toHaveCount(0);
  const note = 'Autobus: najpierw odejmuję opłatę początkową, potem dzielę przez cenę kilometra.';
  await notebook.getByRole('button', { name: 'Brudnopis', exact: true }).click();
  await notebook.getByLabel('Twoje rachunki i pomysły', { exact: true }).fill(note);
  await notebook.getByRole('button', { name: 'Kalkulator', exact: true }).click();
  await notebook.getByRole('textbox', { name: 'Działanie do obliczenia', exact: true }).fill('(43 minus 8)/3,5');
  await notebook.getByRole('button', { name: 'Oblicz', exact: true }).click();
  await expect(notebook.locator('.workspace__result')).toContainText('10');
  await expectNoSideScroll(page, 'notatnik i kalkulator w zwykłej lekcji');
  await notebook.getByRole('button', { name: 'Zapisz w brudnopisie', exact: true }).click();
  await expect(notebook.getByLabel('Twoje rachunki i pomysły', { exact: true })).toHaveValue(/Autobus:.*\n.*= 10/);
  await closeNotebook(page);

  // Leave before answering: this must preserve the unfinished card and notebook,
  // independently of whether that card happens to be choice, input or reading.
  await reloadAndResume(page);
  await expect.poll(() => page.locator('.karta__pytanie').innerText()).toBe(originalQuestion);
  notebook = await openNotebook(page);
  await expect(notebook.getByRole('textbox', { name: 'Działanie do obliczenia', exact: true })).toHaveValue('(43 minus 8)/3,5');
  await notebook.getByRole('button', { name: 'Brudnopis', exact: true }).click();
  await expect(notebook.getByLabel('Twoje rachunki i pomysły', { exact: true })).toHaveValue(/Autobus:.*\n.*= 10/);
  await expect(notebook.locator('.workspace__result')).toContainText('10');
  await notebook.getByRole('button', { name: 'Kalkulator', exact: true }).click();
  await expect(notebook.getByRole('textbox', { name: 'Działanie do obliczenia', exact: true })).toHaveValue('(43 minus 8)/3,5');
  await closeNotebook(page);

  // The main lesson teacher must see notes even though the notebook is closed.
  await page.locator('.feed__tools').getByRole('button', { name: 'Zapytaj nauczyciela', exact: true }).click();
  const teacher = page.getByRole('dialog', { name: 'Nauczyciel', exact: true });
  await teacher.getByRole('textbox', { name: 'Własne pytanie do nauczyciela', exact: true }).fill('Czy widzisz moje rachunki zapisane przed wyjściem?');
  await teacher.getByRole('button', { name: 'Wyślij', exact: true }).click();
  await expect(teacher.locator('.dymek--nauczyciel')).toContainText('Widzę Twoje zapisane działania.');
  expect(requests).toHaveLength(1);
  expect(requests[0]?.kontekst.krok.pytanie).toBeTruthy();
  expect(requests[0]?.kontekst.krok.kontekst).toContain(note);
  expect(requests[0]?.kontekst.krok.kontekst).toContain('= 10');
  await expectNoSideScroll(page, 'nauczyciel z zachowanymi rachunkami');
});

test('nadzór rachunków wysyła dopiero zatwierdzony krok, zachowuje odpowiedź i ukrywa nowy wynik', async ({ page }) => {
  const requests: Array<{ prosba: string; kontekst: { krok: { kontekst?: string; pytanie: string } } }> = [];
  let releaseFirst!: () => void;
  const firstReply = new Promise<void>(resolve => { releaseFirst = resolve; });
  const feedback = 'Odejmowanie opłaty początkowej pasuje do wybranego rachunku.';
  const hiddenAnswer = 'Następny wynik to 1234567.';
  const hiddenQuestion = 'Czy umiesz uzasadnić 1234567?';
  await page.route('**/api/nauczyciel**', async route => {
    if (new URL(route.request().url()).pathname.endsWith('/status')) {
      await route.fulfill({ json: { dostepny: true, model: 'test-coach', powod: null, providerVerified: true } });
      return;
    }
    if (route.request().method() !== 'POST') {
      await route.fulfill({ status: 404, json: { blad: 'Wyłącznie atrapa nauczyciela.' } });
      return;
    }
    requests.push(route.request().postDataJSON());
    const isFirst = requests.length === 1;
    if (isFirst) await firstReply;
    await route.fulfill({ json: { tekst: isFirst ? feedback : hiddenAnswer, model: 'test-coach',
      struktura: { rodzaj: isFirst ? 'inne' : 'rozwiazanie', ujawniaWynik: !isFirst,
        pytanieKontrolne: isFirst ? '' : hiddenQuestion, misconception: '', zapisKalkulatora: '' } } });
  });
  await page.route('**/api/lektor**', route => route.fulfill({ json: { dostepny: false, powod: 'Test bez syntezy online.' } }));
  await open(page);
  await chooseSubject(page, 'Matematyka');
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  await expect(page.locator('.karta__pytanie')).toBeVisible();
  let notebook = await openNotebook(page);
  let input = notebook.getByRole('textbox', { name: 'Działanie do obliczenia', exact: true });
  await notebook.getByLabel('Więcej narzędzi', { exact:true }).click();
  await notebook.getByRole('checkbox', { name: 'Nauczyciel sprawdza moje kroki', exact: true }).check();
  await notebook.getByLabel('Więcej narzędzi', { exact:true }).click();
  await input.fill('43 minus 8');
  expect(requests).toHaveLength(0);
  await notebook.getByRole('button', { name: 'Oblicz', exact: true }).click();
  await expect.poll(() => requests.length).toBe(1);
  expect(requests[0]?.prosba).toBe('sprawdz-rachunek');
  expect(requests[0]?.kontekst.krok.kontekst).toContain('OSTATNI ZATWIERDZONY RACHUNEK: 43 - 8 = 35');
  expect(requests[0]?.kontekst.krok.pytanie).toBeTruthy();
  await expect(notebook.locator('.workspace__result')).toContainText('35');
  await expect(notebook.getByText('Nauczyciel sprawdza…', { exact: true })).toBeVisible();
  await expect(notebook.getByRole('button', { name: 'Sprawdź ostatni rachunek z AI', exact: true })).toHaveCount(0);
  await input.fill('35/3,5');
  expect(requests).toHaveLength(1);
  releaseFirst();
  await expect(notebook.locator('.workspace__coach')).toContainText(feedback);
  await reloadAndResume(page);
  notebook = await openNotebook(page);
  input = notebook.getByRole('textbox', { name: 'Działanie do obliczenia', exact: true });
  await notebook.getByLabel('Więcej narzędzi', { exact:true }).click();
  await expect(notebook.getByRole('checkbox', { name: 'Nauczyciel sprawdza moje kroki', exact: true })).toBeChecked();
  await notebook.getByLabel('Więcej narzędzi', { exact:true }).click();
  await expect(input).toHaveValue('35/3,5');
  await expect(notebook.locator('.workspace__coach')).toContainText(feedback);
  await notebook.getByRole('button', { name:'Historia obliczeń',exact:true }).click();
  await notebook.getByRole('button', { name: 'Sprawdź ostatni rachunek z AI', exact: true }).click();
  await expect(notebook.locator('.workspace__message')).toContainText('Ten rachunek został już wysłany');
  expect(requests).toHaveLength(1);

  // Enter is another explicit approval, and never exposes an unsolicited solution.
  await input.press('Enter');
  await expect.poll(() => requests.length).toBe(2);
  const reveal = notebook.getByRole('button', { name: 'Pokaż podpowiedź', exact: true });
  await expect(reveal).toBeVisible();
  await expect(notebook.getByText(hiddenAnswer, { exact: true })).toHaveCount(0);
  await expect(notebook.getByText(hiddenQuestion, { exact: true })).toHaveCount(0);
  await expectNoSideScroll(page, 'kompaktowe rachunki i ukryta odpowiedź AI');
  await reloadAndResume(page);
  notebook = await openNotebook(page);
  await expect(notebook.getByRole('button', { name: 'Pokaż podpowiedź', exact: true })).toBeVisible();
  await expect(notebook.getByText(hiddenAnswer, { exact: true })).toHaveCount(0);
  expect(requests).toHaveLength(2);
  await notebook.getByRole('button', { name: 'Pokaż podpowiedź', exact: true }).click();
  await expect(notebook.locator('.workspace__coach')).toContainText(hiddenAnswer);
  await expect(notebook.locator('.workspace__coach')).toContainText(hiddenQuestion);
  expect(requests).toHaveLength(2);
});


test('jedno pole rozpoznaje słowa, pokazuje jeden zapis i jeden wynik', async ({page}, info) => {
  let calls = 0;
  await page.route('**/api/nauczyciel**', async route => {
    if(route.request().method() !== 'POST') return route.fulfill({json:{dostepny:true,model:'test-only',providerVerified:true}});
    calls++;
    expect(route.request().postDataJSON().prosba).toBe('zapis');
    await route.fulfill({json:{tekst:'Zapisuję dokładnie to, co podyktowałeś. Długie dodatkowe objaśnienie, którego nie potrzeba na ekranie kalkulatora.', model:'test-only', struktura:{rodzaj:'inne',ujawniaWynik:false,pytanieKontrolne:'',misconception:'',zapisKalkulatora:'16^(-8)'}}});
  });
  await page.route('**/api/lektor**', r=>r.fulfill({json:{dostepny:false}}));
  await open(page);
  await page.getByRole('button',{name:/Rozpocznij lekcję|Kontynuuj lekcję/}).click();
  const pad=await openNotebook(page);
  const input=pad.getByRole('textbox',{name:'Działanie do obliczenia',exact:true});
  await expect(pad.getByRole('checkbox')).not.toBeVisible();
  await input.fill('szesnaście do potęgi minus osiem');
  await pad.getByRole('button',{name:'Oblicz',exact:true}).click();
  const notation=pad.getByLabel('Rozpoznany zapis',{exact:true});
  await expect(notation).toBeVisible();
  await expect(pad.getByText(/Długie dodatkowe objaśnienie/)).toHaveCount(0);
  expect(calls).toBe(1);
  await notation.getByRole('button',{name:'Oblicz ten zapis',exact:true}).click();
  await expect(notation).toHaveCount(0);
  await expect(pad.locator('.workspace__result')).toHaveCount(1);
  await expect(pad.locator('.workspace__result-value')).toContainText('2,32831');
  await expect(pad.locator('.workspace__message')).toHaveCount(0);
  await expect(pad.locator('.workspace__history')).toHaveCount(0);
  await pad.getByRole('button',{name:'Licz dalej',exact:true}).click();
  await expect(input).toHaveValue('2.3283064365386963e-10');
  expect(calls).toBe(1);
  await expectNoSideScroll(page,'proste rachunki');
  await pad.screenshot({path:info.outputPath('rachunki-proste.png')});
  await reloadAndResume(page);
  const resumed=await openNotebook(page);
  await expect(resumed.getByLabel('Rozpoznany zapis',{exact:true})).toHaveCount(0);
  await expect(resumed.locator('.workspace__result')).toHaveCount(1);
  expect(calls).toBe(1);
});
