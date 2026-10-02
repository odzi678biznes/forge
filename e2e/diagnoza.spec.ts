import { expect, test, type Page } from '@playwright/test';
import { answerAnything, chooseSubject, open, otworzPlan } from './helpers';

/** Wejście w diagnozę na ekranie planu dnia - jego tekst mówi, czy plan jest przyjęty. */
const diagnosisEntry = (page: Page) => page.getByRole('region', { name: 'Inne formy treningu' });

test('diagnoza biznesu kończy się raportem i planem tylko dla tego przedmiotu', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Biznes i zarządzanie');
  await otworzPlan(page);
  await page.getByRole('button', { name: /Diagnoza przekrojowa/ }).click();
  await expect(page.getByText('Diagnoza · Biznes i zarządzanie')).toBeVisible();
  await page.getByRole('button', { name: 'Zacznij diagnozę' }).click();

  for (let i = 1; i <= 16; i++) {
    await expect(page.getByText(`Pytanie ${i} z 16`)).toBeVisible();
    await answerAnything(page);
  }

  // Raport opisuje działy biznesu, nie matematyki.
  await expect(page.getByText('Wynik diagnozy', { exact: true })).toBeVisible();
  await expect(page.getByText('Rynek pracy i zatrudnienie').first()).toBeVisible();
  await page.getByRole('button', { name: 'Przyjmij ten plan' }).click();
  await expect(page.getByRole('button', { name: /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/ })).toBeVisible();
  await otworzPlan(page);

  // Powrót następuje dopiero po zapisie planu. Z przyjętym planem
  // wejście zaprasza do nowej diagnozy, a nie do wyniku czekającego na plan.
  await expect(diagnosisEntry(page)).toContainText('Diagnoza przekrojowa');
  await expect(diagnosisEntry(page)).not.toContainText('Wynik diagnozy');

  // Plan przetrwał ponowne uruchomienie i dotyczy tylko biznesu.
  await page.reload();
  await chooseSubject(page, 'Matematyka');
  await otworzPlan(page);
  await expect(diagnosisEntry(page)).toContainText('Diagnoza przekrojowa');
  await page.getByRole('button', { name: /Diagnoza przekrojowa/ }).click();
  await expect(page.getByText('Diagnoza · Matematyka')).toBeVisible();
  await expect(page.getByText(/Masz już aktywny plan/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Nie teraz' }).click();

  await chooseSubject(page, 'Biznes i zarządzanie');
  await otworzPlan(page);
  await expect(diagnosisEntry(page)).toContainText('Diagnoza przekrojowa');
  await page.getByRole('button', { name: /Diagnoza przekrojowa/ }).click();
  await expect(page.getByText(/Masz już aktywny plan z tego przedmiotu/)).toBeVisible();
});

test('nowe pytanie nie przejmuje odpowiedzi z poprzedniego', async ({ page }) => {
  await open(page);
  await chooseSubject(page, 'Biznes i zarządzanie');
  await otworzPlan(page);
  await page.getByRole('button', { name: /Diagnoza przekrojowa/ }).click();
  await page.getByRole('button', { name: 'Zacznij diagnozę' }).click();
  await expect(page.getByText('Pytanie 1 z 16')).toBeVisible();

  // Rejestr każdego stanu ekranu: który to numer pytania i czy „Sprawdź” jest aktywne.
  await page.evaluate(() => {
    const w = window as unknown as { stany: string[] };
    w.stany = [];
    const zapisz = () => {
      const licznik = document.querySelector('.arena__count')?.textContent?.trim() ?? '';
      const przycisk = document.querySelector<HTMLButtonElement>('.arena__submit');
      const stan = `${licznik}|${przycisk ? (przycisk.disabled ? 'off' : 'on') : '-'}`;
      if (w.stany[w.stany.length - 1] !== stan) w.stany.push(stan);
    };
    new MutationObserver(zapisz).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    zapisz();
  });
  for (let i = 1; i <= 4; i++) {
    await expect(page.getByText(`Pytanie ${i} z 16`)).toBeVisible();
    await answerAnything(page);
  }
  await expect(page.getByText('Pytanie 5 z 16')).toBeVisible();

  // Pierwsza klatka każdego nowego pytania: puste pole, więc „Sprawdź” nieaktywne.
  const stany = await page.evaluate(() => (window as unknown as { stany: string[] }).stany);
  for (let n = 2; n <= 5; n++) {
    const pierwszy = stany.find((s) => s.startsWith(`Pytanie ${n} z 16|`));
    expect(pierwszy, `pytanie ${n}: ${stany.join(' → ')}`).toBe(`Pytanie ${n} z 16|off`);
  }
});
