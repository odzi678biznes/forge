import { test, expect } from '@playwright/test';
import { open, expectNoSideScroll, otworzWyklad } from './helpers';
import { M1, operation, mockLearningApis } from './worked-helpers';

test.beforeEach(async ({ page }) => mockLearningApis(page));

const start = /Rozpocznij lekcję|Kontynuuj lekcję|Zrób powtórkę/;

test('operacja odpowiada natychmiast, scroll nie wykonuje kolejnych działań', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: start }).click();
  await expect(page.locator('.worked-calculation h2')).toBeVisible();
  await expect(page.locator('.worked-calculation__option')).toHaveCount(4);
  await expect(page.locator('.worked-calculation__letter')).toHaveText(['A', 'B', 'C', 'D']);
  await expect(page.locator('.worked-calculation__history')).not.toHaveAttribute('open', '');
  await expect(page.getByRole('button', { name: 'Teoria — przypomnij regułę', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: '← Poprzedni zapis', exact: true })).toBeHidden();
  await expect(page.getByRole('complementary', { name: 'Rachunki obok zadania', exact: true })).toHaveCount(0);
  const formula = page.getByLabel('Aktualny zapis wyrażenia', { exact:true });
  const initial = await formula.textContent();
  await operation(page, M1, 0, false);
  await expect(page.locator('.worked-calculation__feedback')).toHaveText('Spróbuj jeszcze raz');
  await expect(formula).toHaveText(initial!);
  await operation(page, M1, 0);
  await expect(formula).not.toHaveText(initial!);
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow','1');
  const after = await formula.textContent();
  const scene = page.locator('.feed__scena');
  await scene.dispatchEvent('pointerdown', { pointerType:'touch',clientX:180,clientY:600 });
  await scene.dispatchEvent('pointerup', { pointerType:'touch',clientX:180,clientY:120 });
  await page.mouse.wheel(0,600);
  await expect(formula).toHaveText(after!);
  await expect(page.getByRole('button', { name:'Sprawdź odpowiedź',exact:true })).toHaveCount(0);
});

test('obliczenia zostają po arkuszu i modalnej pomocy, Escape przywraca fokus', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name:start }).click();
  await operation(page, M1, 0);
  const formula=page.getByLabel('Aktualny zapis wyrażenia',{exact:true});
  const after=await formula.textContent();
  const lecture=page.getByRole('button',{name:'Zadanie i wykład',exact:true});
  await lecture.click();
  await expect(page.getByRole('dialog',{name:'Zadanie',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(lecture).toBeFocused();
  await expect(formula).toHaveText(after!);
  const help=page.locator('.feed__dol').getByRole('button',{name:'Zapytaj nauczyciela',exact:true});
  await help.click();
  const dialog=page.getByRole('dialog',{name:'Nauczyciel',exact:true});
  for(let i=0;i<14;i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  }
  await lecture.evaluate((el:HTMLElement)=>el.focus());
  expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(help).toBeFocused();
  await expect(formula).toHaveText(after!);
  const calculator=page.getByRole('button',{name:'Rachunki i kalkulator',exact:true});
  await calculator.click();
  const notebook=page.getByRole('dialog',{name:'Rachunki w lekcji',exact:true});
  await expect(notebook).toBeVisible();
  for(let i=0;i<14;i++) {
    await page.keyboard.press('Tab');
    expect(await notebook.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(notebook).toHaveCount(0);
  await expect(calculator).toBeFocused();
  await expect(formula).toHaveText(after!);
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
    await otworzWyklad(page);
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
  await page.locator('.worked-calculation__option').first().scrollIntoViewIfNeeded();
  await expect(page.locator('.worked-calculation__option').first()).toBeInViewport();
  await page.screenshot({path:info.outputPath('tekst-200.png')});
});
