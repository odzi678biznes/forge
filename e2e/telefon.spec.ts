import { expect, test } from '@playwright/test';
import { chooseSubject, expectNoSideScroll, open } from './helpers';

test.skip(({ isMobile }) => !isMobile, 'Układ telefonu sprawdzamy tylko na wąskim ekranie.');

test('każdy ekran mieści się w szerokości telefonu', async ({ page }) => {
  await open(page);
  const nav = page.getByRole('navigation', { name: 'Nawigacja' });

  for (const subject of ['Matematyka', 'Informatyka', 'Biznes i zarządzanie'] as const) {
    await nav.getByRole('button', { name: 'Dziś' }).click();
    await chooseSubject(page, subject);
    await expectNoSideScroll(page, `${subject}: Dziś`);
    for (const screen of ['Kurs', /^Fiszki/, 'Kalendarz', 'Postęp']) {
      await nav.getByRole('button', { name: screen }).click();
      await expectNoSideScroll(page, `${subject}: ${String(screen)}`);
    }
  }

  await nav.getByRole('button', { name: 'Dziś' }).click();
  await page.getByRole('button', { name: 'Zacznij lekcję' }).click();
  await expect(page.getByRole('heading', { name: 'Jak to zrobić' })).toBeVisible();
  await expectNoSideScroll(page, 'lekcja');
});
