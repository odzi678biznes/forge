import {test,expect} from '@playwright/test';
import {open,otworzPlan,enterArenaAnswer} from './helpers';
import type {Page} from '@playwright/test';
import {mockLearningApis} from './worked-helpers';

test.beforeEach(async({page})=>mockLearningApis(page));

// Numeryczne odpowiedzi są teraz A–D. Rachunki i edycję zapisu nadal
// wykonuje ta sama klawiatura matematyczna w kalkulatorze zadania.
async function otworzKlawiatureRachunkow(page:Page){
  await open(page);
  await otworzPlan(page);
  await page.getByRole('button',{name:'Mapa',exact:true}).click();
  await page.getByRole('button',{name:/^Trenuj: Dowody: podzielność i reszty/}).click();
  await enterArenaAnswer(page);
  await page.getByRole('button',{name:'Kalkulator',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Działanie do obliczenia',exact:true})).toHaveAttribute('inputmode','text');
  await page.getByRole('button',{name:'Klawiatura matematyczna',exact:true}).click();
}

test('klawiatura matematyczna wpisuje ułamek i nie otwiera trybu tekstowego',async({page},info)=>{
  await page.setViewportSize({width:390,height:844});
  await otworzKlawiatureRachunkow(page);
  const input=page.getByRole('textbox',{name:'Działanie do obliczenia',exact:true});
  const pad=page.getByRole('group',{name:'Klawiatura matematyczna',exact:true});
  await expect(input).toHaveAttribute('inputmode','none');
  for(const name of ['1','Ułamek /','2'])await pad.getByRole('button',{name,exact:true}).click();
  await expect(input).toHaveValue('1/2');
  await page.screenshot({path:info.outputPath('klawiatura.png')});
});

test('edycja kursorem, zamiana zaznaczenia, kasowanie i przełącznik zachowują wpis',async({page})=>{
  await otworzKlawiatureRachunkow(page);
  const input=page.getByRole('textbox',{name:'Działanie do obliczenia',exact:true});
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
  await page.getByRole('button',{name:'Schowaj klawiaturę',exact:true}).click();
  await expect(pad).toHaveCount(0);
  await page.getByRole('button',{name:'Pokaż cyfry',exact:true}).click();
  await expect(pad).toBeVisible();
});
