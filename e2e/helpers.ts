import { expect, type Page } from '@playwright/test';

export type SubjectName = 'Matematyka' | 'Informatyka' | 'Biznes i zarządzanie';

/** Start aplikacji na ekranie „Dziś”. */
export async function open(page: Page): Promise<void> {
  await page.goto('./');
  await expect(page.getByRole('radiogroup', { name: 'Przedmiot' })).toBeVisible();
}

export async function chooseSubject(page: Page, name: SubjectName): Promise<void> {
  const radio = page.getByRole('radio', { name });
  await radio.click();
  await expect(radio).toBeChecked();
}

/**
 * Odpowiada na bieżące pytanie czymkolwiek i przechodzi dalej - test
 * sprawdza przepływ, a nie wiedzę.
 */
export async function answerAnything(page: Page): Promise<void> {
  const input = page.locator('#answer');
  if (await input.isVisible()) await input.fill('1');
  else await page.locator('button.choice').first().click();
  await page.getByRole('button', { name: /^Sprawdź/ }).click();
  await page.getByRole('button', { name: /^Dalej/ }).click();
}

/** Strona nie przewija się w bok - na telefonie to znak rozjechanego układu. */
export async function expectNoSideScroll(page: Page, where: string): Promise<void> {
  const width = page.viewportSize()?.width;
  const overflow = await page.evaluate((viewportWidth) =>
    document.documentElement.scrollWidth - (viewportWidth ?? document.documentElement.clientWidth), width);
  expect(overflow, `${where}: strona szersza od ekranu o ${overflow}px`).toBeLessThanOrEqual(0);
}

/**
 * Ekran spod „Więcej” (prototyp nauki): na komputerze pozycja w bocznym menu,
 * na telefonie — zakładka „Więcej” i arkusz z listą.
 */
export async function otworzWiecej(page: Page, nazwa: string | RegExp): Promise<void> {
  const pozycja = page.getByRole('button', { name: nazwa }).first();
  if (!(await pozycja.isVisible())) {
    await page.getByRole('navigation', { name: 'Nawigacja' }).getByRole('button', { name: 'Więcej' }).click();
  }
  await page.getByRole('button', { name: nazwa }).first().click();
}

/** Wykład jest w arkuszu pod ikoną 📄 — razem z treścią zadania i źródłem. */
export async function otworzWyklad(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Zadanie i wykład', exact: true }).click();
  await page.getByRole('button', { name: /Wykład do lekcji/ }).click();
  await expect(page.getByRole('dialog', { name: 'Wykład', exact: true })).toBeVisible();
}

/** Dotychczasowy „Dziś” (plan dnia, diagnoza) jest teraz pod „Więcej”. */
export const otworzPlan = (page: Page) => otworzWiecej(page, 'Statystyki');
