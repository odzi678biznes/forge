import { expect, test } from '@playwright/test';
import { chooseSubject, open } from './helpers';

test.skip(({ isMobile }) => isMobile, 'Wystarczy raz - service worker jest ten sam.');

test('po pierwszej wizycie aplikacja działa bez sieci', async ({ page, context }) => {
  await open(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('radiogroup', { name: 'Przedmiot' })).toBeVisible();

  // Lekcje wszystkich przedmiotów są w pamięci podręcznej, nie tylko ostatnio otwarte.
  await chooseSubject(page, 'Informatyka');
  await page.getByRole('button', { name: 'Zacznij lekcję' }).click();
  await expect(page.getByRole('heading', { name: 'Jak to zrobić' })).toBeVisible();
});
