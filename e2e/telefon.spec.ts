import { expect, test } from '@playwright/test';
import { chooseSubject, expectNoSideScroll, open, otworzWiecej } from './helpers';

test.skip(({ isMobile }) => !isMobile, 'Układ telefonu sprawdzamy tylko na wąskim ekranie.');

test('każdy ekran mieści się w szerokości telefonu', async ({ page }) => {
  await open(page);
  // Zakładki aktywujemy klawiaturą: headless Chromium na CI źle wyznacza punkt
  // dotyku dla paska fixed (patrz helpers.otworzWiecej). Test sprawdza układ ekranów.
  const nav = page.getByRole('navigation', { name: 'Nawigacja' });

  for (const subject of ['Matematyka', 'Informatyka', 'Biznes i zarządzanie'] as const) {
    await nav.getByRole('button', { name: 'Dziś' }).press('Enter');
    await chooseSubject(page, subject);
    await expectNoSideScroll(page, `${subject}: Dziś`);
    await nav.getByRole('button', { name: 'Kurs' }).press('Enter');
    await expectNoSideScroll(page, `${subject}: Kurs`);
    for (const screen of ['Statystyki', 'Powtórki i fiszki', 'Arkusze CKE']) {
      await otworzWiecej(page, screen);
      await expectNoSideScroll(page, `${subject}: ${String(screen)}`);
    }
  }

  // Feed kart na całym ekranie.
  await nav.getByRole('button', { name: 'Dziś' }).press('Enter');
  await page.getByRole('button', { name: /Kontynuuj/ }).click();
  await expect(page.locator('.karta__pytanie')).toBeVisible();
  await expectNoSideScroll(page, 'feed');
});
