import { expect, test } from '@playwright/test';
import { chooseSubject, expectNoSideScroll, open, otworzWiecej } from './helpers';

test.skip(({ isMobile }) => !isMobile, 'Układ telefonu sprawdzamy tylko na wąskim ekranie.');

test('każdy ekran mieści się w szerokości telefonu', async ({ page }) => {
  await open(page);
  const nav = page.getByRole('navigation', { name: 'Nawigacja' });

  for (const subject of ['Matematyka', 'Informatyka', 'Biznes i zarządzanie'] as const) {
    await nav.getByRole('button', { name: 'Dziś' }).click();
    await chooseSubject(page, subject);
    await expectNoSideScroll(page, `${subject}: Dziś`);
    await nav.getByRole('button', { name: 'Kurs' }).click();
    await expectNoSideScroll(page, `${subject}: Kurs`);
    for (const screen of ['Plan dnia i statystyki', /^Fiszki/, 'Kalendarz', 'Postęp']) {
      await otworzWiecej(page, screen);
      await expectNoSideScroll(page, `${subject}: ${String(screen)}`);
    }
  }

  // Feed kart na całym ekranie.
  await nav.getByRole('button', { name: 'Dziś' }).click();
  await page.getByRole('button', { name: /Kontynuuj/ }).click();
  await expect(page.locator('.karta__pytanie')).toBeVisible();
  await expectNoSideScroll(page, 'feed');
});
