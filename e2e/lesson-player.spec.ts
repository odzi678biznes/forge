import { expect, test, type Page } from '@playwright/test';
import { expectNoSideScroll, open, otworzWyklad } from './helpers';

interface SpeechHarness {
  calls: Array<{ text: string; voice: string; rate: number }>;
  pauses: number;
  resumes: number;
  cancels: number;
  boundary: (position: number) => void;
  fail: () => void;
  voicesReady: () => void;
  noVoices: () => void;
}

test.beforeEach(async ({ page }) => {
  // Symulujemy silnik głosu; testy są niezależne od głosów zainstalowanych w CI.
  await page.addInitScript(() => {
    const local = { name: 'Polski systemowy', voiceURI: 'pl-local', lang: 'pl-PL', localService: true, default: true };
    const natural = { name: 'Polski Natural', voiceURI: 'pl-natural', lang: 'pl-PL', localService: false, default: false };
    let voices = [local, natural];
    let active: SpeechSynthesisUtterance | null = null;
    const events = new EventTarget();
    const harness: SpeechHarness = {
      calls: [], pauses: 0, resumes: 0, cancels: 0,
      boundary: (charIndex) => {
        if (active) active.onboundary?.({ charIndex } as SpeechSynthesisEvent);
      },
      fail: () => {
        if (active) active.onerror?.({ error: 'synthesis-failed' } as SpeechSynthesisErrorEvent);
        active = null;
      },
      voicesReady: () => { voices = [local, natural]; events.dispatchEvent(new Event('voiceschanged')); },
      noVoices: () => { voices = []; events.dispatchEvent(new Event('voiceschanged')); },
    };
    Object.defineProperty(window, '__lessonSpeech', { value: harness });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: class {
      text: string;
      constructor(text: string) { this.text = text; }
    } });
    Object.defineProperty(window, 'speechSynthesis', { value: {
      getVoices: () => voices,
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
      speak: (utterance: SpeechSynthesisUtterance) => {
        active = utterance;
        harness.calls.push({ text: utterance.text, voice: utterance.voice?.voiceURI ?? '', rate: utterance.rate });
      },
      cancel: () => { harness.cancels++; active = null; },
      pause: () => { harness.pauses++; },
      resume: () => { harness.resumes++; },
    } });
  });
});

async function lecture(page: Page) {
  await open(page);
  await page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ }).click();
  await otworzWyklad(page);
  await page.getByRole('button', { name: 'Głos urządzenia', exact: true }).click();
  return page.getByRole('dialog', { name: 'Wykład', exact: true });
}

const harness = (page: Page) => page.evaluate(() => {
  const speech = (window as unknown as { __lessonSpeech: SpeechHarness }).__lessonSpeech;
  return { calls: speech.calls, pauses: speech.pauses, resumes: speech.resumes, cancels: speech.cancels };
});

test('pauza wznawia tę samą wypowiedź, a fragment i pasek przewijają odczyt', async ({ page }) => {
  const dialog = await lecture(page);
  await expect(dialog.getByRole('combobox', { name: 'Głos', exact: true })).toHaveValue('pl-natural');
  await expect(dialog.getByText(/Czytany tekst jest przesyłany/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Przeczytaj lekcję na głos' }).click();
  await page.evaluate(() => (window as unknown as { __lessonSpeech: SpeechHarness }).__lessonSpeech.boundary(30));
  const slider = dialog.getByRole('slider');
  await expect(slider).toHaveValue('30');
  await dialog.getByRole('button', { name: 'Pauza', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Wznów odczyt' })).toBeVisible();
  const paused = await harness(page);
  expect(paused.calls).toHaveLength(1);
  expect(paused.cancels).toBe(0);
  await dialog.getByRole('button', { name: 'Wznów odczyt' }).click();
  await expect(slider).toHaveValue('30');
  expect((await harness(page)).calls).toHaveLength(1);

  await dialog.getByLabel('Czytaj od fragmentu').selectOption({ label: 'Jak to zrobić · krok 2' });
  expect((await harness(page)).calls.at(-1)?.text).toBe('Krok 2.');
  await dialog.getByRole('button', { name: 'Pauza', exact: true }).click();
  const calls = (await harness(page)).calls.length;
  await slider.fill('500');
  await expect(dialog.getByRole('button', { name: 'Wznów odczyt' })).toBeVisible();
  expect((await harness(page)).calls).toHaveLength(calls);
  await dialog.getByRole('button', { name: 'Wznów odczyt' }).click();
  expect((await harness(page)).calls).toHaveLength(calls + 1);
  await dialog.getByRole('button', { name: 'Od początku', exact: true }).click();
  await expect(slider).toHaveValue('0');
  await expectNoSideScroll(page, 'odtwarzacz lekcji');
});

test('W pigułce skraca lekcję i odczyt, a powrót do zadania zatrzymuje dźwięk', async ({ page }) => {
  const dialog = await lecture(page);
  await dialog.getByRole('button', { name: 'Przeczytaj lekcję na głos' }).click();
  await dialog.getByRole('button', { name: 'W pigułce', exact: true }).click();
  expect((await harness(page)).cancels).toBe(1);
  await expect(dialog.getByRole('heading', { name: 'W pigułce', exact: true })).toBeVisible();
  await expect(dialog.locator('.lesson__digest .lesson__p')).toHaveCount(4);
  await expect(dialog.getByRole('heading', { name: 'Skąd to się bierze' })).toHaveCount(0);
  await expect(dialog.locator('.katex-error')).toHaveCount(0);
  await expect(dialog.getByLabel('Czytaj od fragmentu').locator('option')).toHaveCount(4);
  await dialog.getByRole('button', { name: 'Przeczytaj skrót na głos' }).click();
  expect((await harness(page)).calls.at(-1)?.text).toContain('najpierw nawiasy');
  await expectNoSideScroll(page, 'lekcja w pigułce');
  await dialog.getByRole('button', { name: 'To już wiem — przejdź do ćwiczeń' }).click();
  await expect(dialog).toHaveCount(0);
  expect((await harness(page)).cancels).toBe(2);
  await expect(page.locator('.karta__pytanie')).toBeVisible();
});

test('wybór głosu i tempa zostaje po ponownym otwarciu wykładu', async ({ page }) => {
  let dialog = await lecture(page);
  await dialog.getByRole('combobox', { name: 'Głos', exact: true }).selectOption('pl-local');
  await dialog.getByRole('combobox', { name: 'Tempo', exact: true }).selectOption('1.25');
  await dialog.getByRole('button', { name: 'Przeczytaj lekcję na głos' }).click();
  expect((await harness(page)).calls.at(-1)).toMatchObject({ voice: 'pl-local', rate: 1.25 });
  await dialog.getByRole('button', { name: '← Wróć do zadania', exact: true }).click();
  await otworzWyklad(page);
  dialog = page.getByRole('dialog', { name: 'Wykład', exact: true });
  await expect(dialog.getByRole('combobox', { name: 'Głos', exact: true })).toHaveValue('pl-local');
  await expect(dialog.getByRole('combobox', { name: 'Tempo', exact: true })).toHaveValue('1.25');
  await expect(dialog.getByText(/Ten głos działa offline/)).toBeVisible();
});

test('brak głosów, późniejsze wczytanie i błąd odczytu mają czytelny stan', async ({ page }) => {
  const dialog = await lecture(page);
  await page.evaluate(() => (window as unknown as { __lessonSpeech: SpeechHarness }).__lessonSpeech.noVoices());
  await expect(dialog.locator('.lesson-player__note[role="status"]')).toContainText('Brak polskiego głosu');
  await expect(dialog.getByRole('button', { name: 'Przeczytaj lekcję na głos' })).toBeDisabled();
  await page.evaluate(() => (window as unknown as { __lessonSpeech: SpeechHarness }).__lessonSpeech.voicesReady());
  await dialog.getByRole('button', { name: 'Przeczytaj lekcję na głos' }).click();
  await page.evaluate(() => (window as unknown as { __lessonSpeech: SpeechHarness }).__lessonSpeech.fail());
  await expect(dialog.getByRole('alert')).toContainText('wybierz inny głos');
  await dialog.getByRole('button', { name: 'Przeczytaj lekcję na głos' }).click();
  await expect(dialog.getByRole('alert')).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Pauza', exact: true })).toBeVisible();
});
