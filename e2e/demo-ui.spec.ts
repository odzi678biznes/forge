import { test, expect } from '@playwright/test';
import { open, expectNoSideScroll } from './helpers';

const start = /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/;

test('wybór wymaga zatwierdzenia, scroll nie pomija, wynik czeka na Dalej', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: start }).click();
  const check = page.getByRole('button', { name: 'Sprawdź odpowiedź' });
  await expect(check).toBeDisabled();
  const question = await page.locator('.karta__pytanie').textContent();
  await page.locator('.opcja').first().click();
  await expect(page.locator('.info')).toHaveCount(0);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','0');
  await page.getByRole('button', { name: /Potęgę.*w nawiasie/ }).click();
  const scene = page.locator('.feed__scena');
  await scene.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 180, clientY: 600 });
  await scene.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 180, clientY: 120 });
  await page.mouse.wheel(0,600);
  await expect(page.locator('.karta__pytanie')).toHaveText(question!);
  await check.click();
  await expect(page.locator('.info')).toContainText('Dobrze');
  await expect(page.locator('.opcja--poprawna')).toContainText('Poprawna odpowiedź');
  await expect(check).toHaveCount(0);
  await page.mouse.wheel(0,600);
  await expect(page.locator('.karta__pytanie')).toHaveText(question!);
  await page.getByRole('button', { name: /Dalej/ }).click();
  await expect(page.locator('.karta__pytanie')).not.toHaveText(question!);
  await expect(page.getByRole('button', { name: 'Sprawdź odpowiedź' })).toBeDisabled();
});

test('wpis zachowuje się po wykładzie i modalnej pomocy, Escape przywraca fokus', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: start }).click();
  for (let i=0;i<2;i++) await page.getByRole('button', { name: 'Pomiń' }).click();
  const answer = page.getByRole('textbox', { name: 'Twoja odpowiedź', exact:true });
  await answer.fill('1/2');
  const lecture = page.getByRole('button', { name: 'Wykład', exact:true });
  await lecture.click();
  await expect(page.getByRole('dialog', { name: 'Wykład', exact:true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(lecture).toBeFocused();
  await expect(answer).toHaveValue('1/2');
  const help = page.getByRole('button', { name: 'Zapytaj nauczyciela' });
  await help.click();
  const dialog = page.getByRole('dialog', { name: 'Nauczyciel' });
  await expect(dialog).toBeVisible();
  for (let i=0;i<14;i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  }
  await lecture.evaluate((el:HTMLElement)=>el.focus());
  expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(help).toBeFocused();
  await expect(answer).toHaveValue('1/2');
  await page.getByRole('button', { name: 'Sprawdź odpowiedź' }).click();
  await expect(page.locator('.info')).toContainText('Dobrze');
});

test('menu Więcej ma fokus modalny i wraca do przycisku', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await open(page);
  const more=page.getByRole('button',{name:'Więcej',exact:true});
  await more.click();
  const dialog=page.getByRole('dialog');
  for(let i=0;i<18;i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(more).toBeFocused();
});

test('układ na sześciu szerokościach, większy tekst i odstępy', async ({ page }, info) => {
  test.skip(info.project.name !== 'komputer', 'Szerokości sprawdzane raz w tej samej przeglądarce.');
  for (const width of [320,360,390,768,1024,1440]) {
    await page.setViewportSize({width,height:1000});
    await open(page);
    await expectNoSideScroll(page,`Dziś ${width}`);
    await page.getByRole('button',{name:start}).click();
    await expectNoSideScroll(page,`Karta ${width}`);
    await page.getByRole('button',{name:'Wykład',exact:true}).click();
    await expectNoSideScroll(page,`Wykład ${width}`);
    const modal=page.getByRole('dialog');
    expect(await modal.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Wyjdź z lekcji'}).click();
    await page.getByRole('button',{name:'Wszystkie lekcje w Kursie →'}).click();
    await expectNoSideScroll(page,`Kurs ${width}`);
  }
  await page.setViewportSize({width:390,height:844});
  await open(page);
  await page.addStyleTag({content:'html {font-size:200% !important} * {line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p {margin-bottom:2em !important}'});
  await expectNoSideScroll(page,'Dziś powiększony tekst');
  await page.getByRole('button',{name:start}).click();
  await expectNoSideScroll(page,'Karta powiększony tekst');
  await page.getByRole('button',{name:'Sprawdź odpowiedź'}).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button',{name:'Sprawdź odpowiedź'})).toBeInViewport();
  await page.screenshot({path:info.outputPath('tekst-200.png')});
});
