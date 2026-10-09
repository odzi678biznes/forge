import { expect, test, type Page } from '@playwright/test';
import { expectNoSideScroll } from './helpers';
// The HTTP engine, persistence and cross-device synchronization are real. Only the external LLM is doubled.
const API = 'http://127.0.0.1:4181/api/tutor';
async function connect(page: Page) {
  await page.goto('./#tutor');
  await page.getByLabel('Adres serwera korepetytora').fill(API);
  await page.getByLabel('Prywatny kod dostępu').fill('test-forge-access-code-at-least-24');
  await page.getByRole('button', { name: 'Połącz Claude i utwórz profil' }).click();
  await expect(page.getByRole('heading', { name: 'Indywidualne korepetycje' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rozpocznij korepetycje', exact: true })).toBeEnabled();
}
test('onboarding handles a missing Claude key honestly', async ({ page }) => {
  await page.goto('./#tutor');
  await expect(page.getByRole('heading', { name: 'Nauczyciel, który poznaje Twój sposób myślenia.' })).toBeVisible();
  await expect(page.getByText('Klucz Anthropic pozostaje na serwerze.', { exact: false })).toBeVisible();
  await expectNoSideScroll(page, 'Tutor onboarding');
});
test('desktop and phone complete a real synchronized session with upload, refresh and next task', async ({ page, browser }) => {
  await connect(page);
  await page.getByRole('button', { name: 'Rozpocznij korepetycje', exact: true }).click();
  await expect(page.getByText('ZADANIE 1', { exact: true })).toBeVisible();
  await page.getByText('Telefon jako aparat', { exact: true }).click();
  await page.getByRole('button', { name: 'Utwórz link do telefonu' }).click();
  const link = await page.getByLabel('Link parowania').inputValue();
  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const phone = await phoneContext.newPage(); await phone.goto(link);
  await expect(phone.getByRole('heading', { name: 'Twój skaner rozwiązania' })).toBeVisible();
  await expect(phone.getByText('Nauka · Zadanie 1', { exact: true })).toBeVisible();
  // Generate a local photo fixture through canvas: tests the real image normalization code.
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 1800; canvas.height = 1200;
    const context = canvas.getContext('2d')!; context.fillStyle = 'white'; context.fillRect(0, 0, 1800, 1200);
    context.fillStyle = 'black'; context.font = '70px sans-serif'; context.fillText('1/2 + 1/2 = 2/2 = 1', 100, 200);
    return canvas.toDataURL('image/png').split(',')[1]!;
  });
  await phoneContext.setOffline(true);
  await expect(phone.getByText('Brak połączenia · ostatni zapis', { exact: true })).toBeVisible({ timeout: 20_000 });
  await phone.getByLabel('Zdjęcie kartki').setInputFiles({ name: 'kartka.png', mimeType: 'image/png', buffer: Buffer.from(image, 'base64') });
  await expect(phone.getByAltText('Podgląd Twojej kartki przed wysłaniem')).toBeVisible();
  await phone.getByRole('button', { name: 'Obróć zdjęcie' }).click();
  await expect.poll(() => phone.getByAltText('Podgląd Twojej kartki przed wysłaniem').evaluate((img: HTMLImageElement) => img.naturalHeight > img.naturalWidth)).toBe(true);
  await phoneContext.setOffline(false);
  await expect(phone.getByText('Sesja zsynchronizowana', { exact: true })).toBeVisible();
  await phone.reload();
  await expect(phone.getByAltText('Podgląd Twojej kartki przed wysłaniem')).toBeVisible();
  // Lose the acknowledgment after the real server saves the photo. Retrying must remain idempotent.
  let dropped = false;
  await phone.route(API, async route => {
    if (!dropped && route.request().method() === 'POST' && route.request().postDataJSON()?.action === 'upload') {
      dropped = true; await route.fetch(); await route.abort();
    } else await route.continue();
  });
  await phone.getByRole('button', { name: 'Wyślij rozwiązanie', exact: true }).click();
  await expect(phone.getByText('Zdjęcie czeka na urządzeniu.', { exact: false })).toBeVisible();
  await phone.unroute(API); await phone.reload();
  await expect(phone.getByAltText('Podgląd Twojej kartki przed wysłaniem')).toBeVisible();
  await phone.getByRole('button', { name: 'Wyślij rozwiązanie', exact: true }).click();
  await expect(phone.getByText('Zdjęcie zapisane na serwerze.', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Poprawne rozumowanie' })).toBeVisible({ timeout: 20_000 });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Poprawne rozumowanie' })).toBeVisible();
  await page.getByRole('button', { name: 'Następne dopasowane zadanie' }).click();
  await expect(phone.getByText('Nauka · Zadanie 2', { exact: true })).toBeVisible();
  await expectNoSideScroll(page, 'Tutor desktop/session'); await expectNoSideScroll(phone, 'Tutor scanner');
  await page.getByRole('button', { name: 'Zakończ sesję' }).click();
  await expect(page.getByText('Na następnej sesji', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Historia', exact: true }).click();
  await page.getByLabel('Sesja', { exact: true }).selectOption({ index: 1 });
  await expect(page.getByAltText('Zapisane zdjęcie rozwiązania')).toBeVisible();
  await phoneContext.close();
});
test('home starts tutoring with one click and refresh preserves the active session', async ({ page }) => {
  await connect(page);
  await page.getByRole('button', { name: '← Forge', exact: true }).click();
  await page.getByRole('button', { name: 'Rozpocznij korepetycje', exact: true }).click();
  await expect(page.getByText('ZADANIE 1', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#tutor$/);
  await page.reload();
  await expect(page.getByText('ZADANIE 1', { exact: true })).toBeVisible();
});
test('exam mode disables teacher assistance and waits until finish for feedback', async ({ page }) => {
  await connect(page);
  await page.getByLabel('Tryb pracy').selectOption('exam');
  await page.getByRole('button', { name: 'Rozpocznij korepetycje', exact: true }).click();
  await expect(page.getByText('ZADANIE 1', { exact: true })).toBeVisible();
  await expect(page.getByText('Pracujesz samodzielnie. Czat, podpowiedzi i analiza są wyłączone do zakończenia arkusza.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Podpowiedź/ })).toHaveCount(0);
  await expect(page.getByLabel('Pozostały czas')).toBeVisible();
  await page.getByRole('button', { name: 'Zakończ sesję' }).click();
  await expect(page.getByRole('heading', { name: 'Analiza arkusza' })).toBeVisible();
  await expect(page.getByText('Na następnej sesji', { exact: true })).toBeVisible();
});
