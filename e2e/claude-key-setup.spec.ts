import { expect, test } from '@playwright/test';
import { open } from './helpers';

test('klucz Claude trafia wyłącznie do lokalnego setup, bez localStorage i model completion', async ({ page }) => {
  let configured = false, setupCalls = 0, completions = 0;
  const dummy = 'sk-ant-ui-test-not-a-real-key-1234567890';
  await page.route('**/api/nauczyciel/status', route => route.fulfill({json:{dostepny:configured,model:configured?'test-model':null,powod:configured?null:'Brak klucza',localSetupAvailable:true,providerVerified:configured}}));
  await page.route('**/api/nauczyciel/setup', async route => {
    if (route.request().method() === 'POST') {
      expect(route.request().postDataJSON()).toEqual({key:dummy});
      configured = true; setupCalls++;
      await route.fulfill({json:{saved:true,persisted:true,configured:true,providerVerified:true,message:'Klucz zapisany w magazynie Windows.'}});
    } else await route.fulfill({json:{localSetupAvailable:true,configured,persisted:configured}});
  });
  await page.route('**/api/nauczyciel', route => { completions++; return route.abort(); });
  await open(page);
  await page.getByRole('button',{name:'Połącz nauczyciela',exact:true}).click();
  const key = page.getByRole('textbox',{name:'Klucz API Claude',exact:true});
  await expect(key).toHaveAttribute('type','password');
  await key.fill(dummy);
  await page.getByRole('button',{name:'Zapisz klucz Claude bezpiecznie'}).click();
  await expect(key).toHaveCount(0);
  await expect(page.getByText('AI połączone · będzie dostępne w lekcjach')).toBeVisible();
  expect(setupCalls).toBe(1); expect(completions).toBe(0);
  const stored = await page.evaluate(() => JSON.stringify([Object.values(localStorage),Object.values(sessionStorage)]));
  expect(stored).not.toContain(dummy);
  await page.reload();
  await page.getByRole('button',{name:'Ustawienia nauczyciela',exact:true}).click();
  await expect(page.getByText('Klucz jest zapisany w magazynie Windows. Nauczyciel odczytuje go automatycznie po uruchomieniu aplikacji.')).toBeVisible();
  await expect(key).toHaveCount(0);
  expect(setupCalls).toBe(1);
});
