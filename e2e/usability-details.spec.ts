import {test,expect} from '@playwright/test';
import {open,otworzWiecej} from './helpers';

test('czytelny kurs, spójna ikona postępu, fokus wyniku i dostępność Wstecz',async({page})=>{
  await open(page);
  await page.getByRole('button',{name:'Wszystkie lekcje w Kursie →'}).click();
  await expect(page.locator('.skill__here').first()).toHaveCSS('background-color','rgb(35, 62, 80)');
  await expect(page.locator('.skill__here').first()).toHaveCSS('color','rgb(232, 238, 246)');
  await expect(page.locator('.skill__details').first()).toHaveCSS('border-top-width','0px');
  await page.getByRole('button',{name:'Ucz się',exact:true}).first().click();
  await page.getByRole('button',{name:/Potęgę.*w nawiasie/}).click();
  await page.getByRole('button',{name:'Sprawdź odpowiedź'}).click();
  await expect(page.locator('.info')).toBeFocused();
  await expect(page.getByRole('button',{name:'← Wstecz',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:/Dalej/}).click();
  await expect(page.locator('.karta__pytanie')).toBeFocused();
  await expect(page.getByRole('button',{name:'← Wstecz',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Wyjdź z lekcji'}).click();
  await page.getByRole('button',{name:'Wszystkie lekcje w Kursie →'}).click();
  const current=page.locator('.skill').filter({hasText:'Ułamki i kolejność działań'});
  await expect(current.locator('.course__dot--learning')).toHaveCount(1);
});

test('Enter na nawigacji fiszek otwiera menu zamiast odsłaniać odpowiedź',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await open(page);
  await page.getByRole('button',{name:'Rozpocznij lekcję',exact:true}).click();
  for(let i=0;i<8;i++)await page.getByRole('button',{name:'Pomiń',exact:true}).click();
  await page.getByRole('group',{name:'Odpowiedzi A–D'}).getByRole('button',{name:/^B\./}).click();
  await page.getByRole('button',{name:'Sprawdź odpowiedź'}).click();
  await page.getByRole('button',{name:/Dalej/}).click();
  await page.getByRole('button',{name:'Wróć do „Dziś”'}).click();
  await otworzWiecej(page,'Powtórki i fiszki');
  const reveal=page.locator('.flash__reveal');
  await expect(reveal).toBeVisible();
  const more=page.getByRole('button',{name:'Więcej',exact:true});
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('1');
  await page.keyboard.press('Escape');
  await expect(reveal).toBeVisible();
});
