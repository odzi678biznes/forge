import {test,expect} from '@playwright/test';
import {open,otworzPlan} from './helpers';
import type {Page} from '@playwright/test';

// Karty feedu nie wymagają już wpisywania (wybór wariantu) — klawiaturę
// matematyczną sprawdzamy w zadaniu otwartym z treningu na mapie.
async function zadanieOtwarte(page:Page){
  await open(page);
  await otworzPlan(page);
  await page.getByRole('button',{name:'Mapa',exact:true}).click();
  await page.getByRole('button',{name:/^Trenuj: Dowody: podzielność i reszty/}).click();
}

test('klawiatura matematyczna wpisuje ułamek i nie otwiera trybu tekstowego',async({page},info)=>{
  await page.setViewportSize({width:390,height:844});
  await zadanieOtwarte(page);
  const input=page.getByRole('textbox',{name:'Twoja odpowiedź',exact:true});
  const pad=page.getByRole('group',{name:'Klawiatura matematyczna',exact:true});
  await expect(input).toHaveAttribute('inputmode','none');
  for(const name of ['1','Ułamek /','2'])await pad.getByRole('button',{name,exact:true}).click();
  await expect(input).toHaveValue('1/2');
  await page.screenshot({path:info.outputPath('klawiatura.png')});
});

test('edycja kursorem, zamiana zaznaczenia, kasowanie i przełącznik zachowują wpis',async({page})=>{
  await zadanieOtwarte(page);
  const input=page.getByRole('textbox',{name:'Twoja odpowiedź',exact:true});
  const pad=page.getByRole('group',{name:'Klawiatura matematyczna',exact:true});
  for(const name of ['1','2','Kursor w lewo','3'])await pad.getByRole('button',{name,exact:true}).click();
  await expect(input).toHaveValue('132');
  await input.selectText();
  await pad.getByRole('button',{name:'9',exact:true}).click();
  await expect(input).toHaveValue('9');
  await pad.getByRole('button',{name:'Usuń znak',exact:true}).click();
  await expect(input).toHaveValue('');
  for(const name of ['Minus','2','Potęga','3'])await pad.getByRole('button',{name,exact:true}).click();
  await expect(input).toHaveValue('-2^3');
  await page.getByRole('button',{name:'Klawiatura telefonu',exact:true}).click();
  await expect(input).toHaveAttribute('inputmode','text');
  await expect(input).toHaveValue('-2^3');
  await expect(pad).toHaveCount(0);
  await input.fill('0,5');
  await page.getByRole('button',{name:'Klawiatura matematyczna',exact:true}).click();
  await expect(input).toHaveAttribute('inputmode','none');
  await expect(input).toHaveValue('0,5');
  await pad.getByRole('button',{name:'Wyczyść odpowiedź',exact:true}).click();
  await expect(input).toHaveValue('');
  await page.getByRole('button',{name:'Cofnij wyczyszczenie',exact:true}).click();
  await expect(input).toHaveValue('0,5');
  await page.getByRole('button',{name:'Schowaj',exact:true}).click();
  await expect(pad).toHaveCount(0);
  await page.getByRole('button',{name:'Pokaż cyfry',exact:true}).click();
  await expect(pad).toBeVisible();
});
