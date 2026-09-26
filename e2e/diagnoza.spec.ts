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
