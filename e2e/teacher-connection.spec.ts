import { expect, test } from '@playwright/test';
import { chooseSubject, open } from './helpers';

test('kod dostępu łączy nauczyciela i wysyła kontekst aktualnej karty', async ({ page }) => {
  await page.route('**/api/nauczyciel/setup', route => route.fulfill({json:{localSetupAvailable:false}}));
  await page.route('**/api/nauczyciel/status', async route => {
    const authorized = route.request().headers().authorization === 'Bearer test-private-code';
    await route.fulfill({status:authorized ? 200 : 401,contentType:'application/json',body:JSON.stringify({dostepny:authorized,model:authorized ? 'test-model' : null,powod:null,wymagaKodu:!authorized})});
  });
  await page.route('**/api/nauczyciel', async route => {
    expect(route.request().headers().authorization).toBe('Bearer test-private-code');
    const data = route.request().postDataJSON();
    expect(data.kontekst.lekcja).toBeTruthy();
    expect(data.kontekst.krok.pytanie).toBeTruthy();
    expect(data.pytanie).toBe('Od czego zacząć?');
    await route.fulfill({json:{tekst:'Zacznij od potęgi w nawiasie.',model:'test-model'}});
  });
  await open(page);
  await chooseSubject(page,'Matematyka');
  await page.getByRole('button',{name:/Rozpocznij lekcję|Kontynuuj lekcję/}).click();
  await page.locator('.feed__dol').getByRole('button',{name:'Zapytaj nauczyciela',exact:true}).click();
  await page.getByText('Połączenie i ustawienia nauczyciela', { exact:true }).click();
  await page.getByLabel('Kod dostępu do nauczyciela', { exact:true }).fill('test-private-code');
  await page.getByRole('button',{name:'Zapisz i sprawdź połączenie'}).click();
  await expect(page.getByText('Nauczyciel AI · test-model')).toBeVisible();
  await page.getByRole('textbox',{name:'Własne pytanie do nauczyciela'}).fill('Od czego zacząć?');
  await page.getByRole('button',{name:'Wyślij',exact:true}).click();
  await expect(page.locator('.dymek--nauczyciel')).toContainText('Zacznij od potęgi w nawiasie.');
});
