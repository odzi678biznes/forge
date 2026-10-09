import { expect, test } from '@playwright/test';
import { expectNoSideScroll, open, otworzWyklad } from './helpers';

test('połączenie nauczyciela na starcie, bez płatnego zapytania', async ({ page }) => {
  let posts = 0;
  await page.route('**/api/nauczyciel/setup', route => route.fulfill({json:{localSetupAvailable:false}}));
  await page.route('**/api/nauczyciel/status', async route => {
    const connected = route.request().headers().authorization === 'Bearer test-private-access-code';
    await route.fulfill({ status: connected ? 200 : 401, json: connected
      ? { dostepny: true, model: 'test-teacher', powod: null }
      : { dostepny: false, model: null, powod: 'Wpisz kod dostępu.', wymagaKodu: true } });
  });
  await page.route('**/api/nauczyciel', async route => { posts++; await route.abort(); });
  await open(page);
  const startup = page.getByRole('complementary', { name: 'Nauczyciel przed nauką' });
  await startup.getByRole('button', { name: 'Połącz nauczyciela', exact: true }).click();
  await startup.getByLabel('Kod dostępu do nauczyciela').fill('test-private-access-code');
  await startup.getByRole('button', { name: 'Zapisz i sprawdź połączenie' }).click();
  await expect(startup.getByText('AI połączone · będzie dostępne w lekcjach')).toBeVisible();
  await page.reload();
  await expect(page.getByText('AI połączone · będzie dostępne w lekcjach')).toBeVisible();
  expect(posts).toBe(0);
  await expectNoSideScroll(page, 'konfiguracja nauczyciela');
});

test('nauczyciel obecny w lekcji, zapis słów w matematykę i powrót do rozmowy', async ({ page }) => {
  const requests: { prosba: string; pytanie: string; kontekst: { lekcja: string; krok: { kontekst: string } } }[] = [];
  await page.route('**/api/nauczyciel/status', route => route.fulfill({ json: { dostepny: true, model: 'test-teacher', powod: null } }));
  await page.route('**/api/nauczyciel', async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ json: { tekst: 'Twój zapis: $(-6)^2$.', model: 'test-teacher', struktura: { rodzaj: 'inne', ujawniaWynik: false, pytanieKontrolne: '', misconception: '' } } });
  });
  await open(page);
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  await otworzWyklad(page);
  const lesson = page.getByRole('dialog', { name: 'Wykład', exact: true });
  await lesson.getByRole('button', { name: 'Zapytaj nauczyciela', exact: true }).click();
  const teacher = page.getByRole('dialog', { name: 'Nauczyciel', exact: true });
  await teacher.getByLabel('Własne pytanie do nauczyciela').fill('minus sześć w nawiasie do kwadratu');
  await teacher.getByRole('button', { name: 'Zapisz matematycznie' }).click();
  await expect(teacher.getByText('Twój zapis:', { exact: false })).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0]?.prosba).toBe('zapis');
  expect(requests[0]?.pytanie).toContain('minus sześć');
  expect(requests[0]?.kontekst.krok.kontekst.length).toBeGreaterThan(20);
  await teacher.getByRole('button', { name: 'Zamknij nauczyciela' }).click();
  await lesson.getByRole('button', { name: 'Zapytaj nauczyciela', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Nauczyciel', exact: true }).getByText('Twój zapis:', { exact: false })).toBeVisible();
  expect(requests).toHaveLength(1);
  await expectNoSideScroll(page, 'nauczyciel w lekcji');
});
