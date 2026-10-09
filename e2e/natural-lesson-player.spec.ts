import { expect, test, type Page } from '@playwright/test';
import { expectNoSideScroll, open, otworzWyklad } from './helpers';

/** Poprawny WAV do testowania prawdziwego elementu audio, bez płatnego API. */
function recording() {
  const samples = 12 * 8000;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(16000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(samples * 2, 40);
  return wav;
}

async function lecture(page: Page) {
  await open(page);
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  await otworzWyklad(page);
  return page.getByRole('dialog', { name: 'Wykład', exact: true });
}

test('naturalne nagranie przewija się według czasu i wznawia bez ponownej syntezy', async ({ page }) => {
  const requests: Array<{ text: string; voice: string }> = [];
  await page.route('**/api/lektor', async (route) => {
    if (route.request().method() === 'GET') await route.fulfill({ json: { dostepny: true } });
    else {
      requests.push(route.request().postDataJSON() as { text: string; voice: string });
      await route.fulfill({ contentType: 'audio/wav', body: recording() });
    }
  });
  const dialog = await lecture(page);
  await expect(dialog.getByRole('button', { name: 'Naturalny lektor online' })).toHaveAttribute('aria-pressed', 'true');
  await dialog.getByRole('button', { name: 'Przeczytaj lekcję na głos' }).click();
  const audio = dialog.locator('audio');
  await expect.poll(() => audio.evaluate((el) => (el as HTMLAudioElement).duration)).toBe(12);
  await expect(dialog.getByRole('button', { name: 'Pauza', exact: true })).toBeVisible();
  await audio.evaluate((el) => { (el as HTMLAudioElement).currentTime = 4.25; });
  await dialog.getByRole('button', { name: 'Pauza', exact: true }).click();
  const pausedAt = await audio.evaluate((el) => (el as HTMLAudioElement).currentTime);
  expect(pausedAt).toBeGreaterThanOrEqual(4.25);
  expect(pausedAt).toBeLessThan(5);
  await dialog.getByRole('combobox', { name: 'Tempo', exact: true }).selectOption('1.25');
  expect(await audio.evaluate((el) => (el as HTMLAudioElement).playbackRate)).toBe(1.25);
  expect(await audio.evaluate((el) => (el as HTMLAudioElement).currentTime)).toBe(pausedAt);
  await dialog.getByRole('button', { name: 'Wznów odczyt' }).click();
  await expect(dialog.getByRole('button', { name: 'Pauza', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Pauza', exact: true }).click();
  expect(await audio.evaluate((el) => (el as HTMLAudioElement).currentTime)).toBeGreaterThanOrEqual(pausedAt);
  expect(requests).toHaveLength(1);
  expect(requests[0]?.voice).toBe('pl-PL-ZofiaNeural');

  await dialog.getByRole('combobox', { name: 'Czytaj od fragmentu' }).selectOption({ label: 'Jak to zrobić · krok 2' });
  await expect.poll(() => requests.length).toBe(2);
  await expect.poll(() => audio.evaluate((el) => (el as HTMLAudioElement).readyState)).toBeGreaterThanOrEqual(2);
  expect(await audio.evaluate((el) => (el as HTMLAudioElement).paused)).toBe(true);
  expect(requests[1]?.text).toContain('Policz potęgi i pierwiastki');
  await dialog.getByRole('combobox', { name: 'Czytaj od fragmentu' }).selectOption('0');
  await expect.poll(() => audio.evaluate((el) => (el as HTMLAudioElement).readyState)).toBeGreaterThanOrEqual(2);
  expect(requests).toHaveLength(2);
  await expectNoSideScroll(page, 'naturalny odtwarzacz');
});

test('W pigułce czyta tylko skrót i pozwala wrócić od razu do ćwiczeń', async ({ page }) => {
  const texts: string[] = [];
  await page.route('**/api/lektor', async (route) => {
    if (route.request().method() === 'GET') await route.fulfill({ json: { dostepny: true } });
    else {
      texts.push((route.request().postDataJSON() as { text: string }).text);
      await route.fulfill({ contentType: 'audio/wav', body: recording() });
    }
  });
  const dialog = await lecture(page);
  await dialog.getByRole('button', { name: 'W pigułce', exact: true }).click();
  await expect(dialog.getByRole('combobox', { name: 'Czytaj od fragmentu' }).locator('option')).toHaveCount(4);
  await dialog.getByRole('button', { name: 'Przeczytaj skrót na głos' }).click();
  await expect(dialog.getByRole('button', { name: 'Pauza', exact: true })).toBeVisible();
  expect(texts[0]).toContain('najpierw nawiasy');
  expect(texts[0]).not.toContain('Każde zadanie maturalne');
  await expectNoSideScroll(page, 'naturalny skrót');
  await dialog.getByRole('button', { name: 'To już wiem — przejdź do ćwiczeń' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('.karta__pytanie')).toBeVisible();
});

test('naturalny lektor bez konfiguracji ma wyraźny komunikat i głos urządzenia', async ({ page }) => {
  await page.route('**/api/lektor', (route) => route.fulfill({ status: 503, json: {
    dostepny: false, powod: 'Naturalny lektor nie jest jeszcze podłączony. Możesz korzystać z głosu urządzenia.',
  } }));
  const dialog = await lecture(page);
  await expect(dialog.locator('.lesson-player__note[role="status"]')).toContainText('nie jest jeszcze podłączony');
  await expect(dialog.getByRole('button', { name: 'Przeczytaj lekcję na głos' })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Głos urządzenia' }).click();
  await expect(dialog.getByRole('slider')).toBeVisible();
  await expect(dialog.locator('audio')).toHaveCount(0);
});

test('lektor używa istniejącego kodu FORGE, a błąd nagrania można ponowić', async ({ page }) => {
  const code = 'test-private-code-for-forge';
  let fail = true;
  await page.route('**/api/lektor', async (route) => {
    const request = route.request();
    if (request.headers().authorization !== `Bearer ${code}`) {
      await route.fulfill({ status: 401, json: { dostepny: false, wymagaKodu: true, powod: 'Wpisz swój kod dostępu do FORGE.' } });
    } else if (request.method() === 'GET') await route.fulfill({ json: { dostepny: true } });
    else if (fail) {
      fail = false;
      await route.fulfill({ status: 502, json: { blad: 'Spróbuj ponownie za chwilę.' } });
    } else await route.fulfill({ contentType: 'audio/wav', body: recording() });
  });
  const dialog = await lecture(page);
  await dialog.getByLabel('Kod dostępu do FORGE', { exact: true }).fill(code);
  await dialog.getByRole('button', { name: 'Połącz lektora' }).click();
  await dialog.getByRole('button', { name: 'Przeczytaj lekcję na głos' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Spróbuj ponownie');
  await dialog.getByRole('button', { name: 'Przeczytaj lekcję na głos' }).click();
  await expect(dialog.getByRole('button', { name: 'Pauza', exact: true })).toBeVisible();
});
