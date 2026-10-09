import { expect, test, type Locator, type Page } from '@playwright/test';
import { MATH_CORPUS } from '../content/math/index';
import { open, otworzPlan, expectNoSideScroll } from './helpers';

test.beforeEach(async ({page}) => {
  // Every teacher route is mocked: this suite never spends API credit.
  await page.route('**/api/nauczyciel**', route => route.fulfill({status:503,json:{dostepny:false,model:null,powod:'Test offline',blad:'Test bez API'}}));
});
async function task(page: Page, id: string, train = false, patch: Partial<(typeof MATH_CORPUS.questions)[number]> = {}) {
  await open(page); await otworzPlan(page);
  await page.getByRole('button', {name:/Diagnoza przekrojowa/}).click();
  await page.getByRole('button', {name:'Zacznij diagnozę'}).click();
  await expect(page.locator('.arena__count')).toBeVisible();
  const question = {...MATH_CORPUS.questions.find(q => q.id === id)!, ...patch};
  const skill = MATH_CORPUS.skills.find(s => s.id === question.skillId)!;
  await page.evaluate(async ({question,skill}) => {
    const db = await new Promise<IDBDatabase>(resolve => { const r=indexedDB.open('forge'); r.onsuccess=()=>resolve(r.result); });
    const tx=db.transaction('preferences','readwrite'), store=tx.objectStore('preferences');
    const request=store.get('learning.activeMission.v1');
    request.onsuccess=()=>{const saved=request.result; const session=JSON.parse(saved.value); session.current={...session.current,question,skill};session.draft=null;store.put({...saved,value:JSON.stringify(session)});};
    await new Promise<void>((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
  },{question,skill});
  await page.reload(); await expect(page.locator('.arena')).toHaveAttribute('data-math-ready','true');
  const assisted=await page.getByRole('region',{name:'Małe kroki zadania'}).isVisible();
  if(assisted&&!train) await page.getByRole('button',{name:'Znam odpowiedź',exact:true}).click();
  return {question,assisted};
}
async function calculator(page: Page) {
  const dialog=page.getByRole('dialog',{name:'Kalkulator',exact:true});
  if(!await dialog.isVisible()) await page.locator('.arena__tools').getByRole('button',{name:'Kalkulator',exact:true}).click();
  await expect(dialog).toBeVisible(); return dialog;
}
async function closeCalculator(page: Page) {
  const dialog=page.getByRole('dialog',{name:'Kalkulator',exact:true});
  if(await dialog.isVisible()) await dialog.getByRole('button',{name:'Wróć do zadania',exact:true}).click();
}
async function notes(page: Page) {
  const dialog=await calculator(page), entry=dialog.getByRole('textbox',{name:'Twoje rachunki i pomysły',exact:true});
  if(!await entry.isVisible()) await dialog.getByRole('button',{name:'Brudnopis',exact:true}).click();
  return entry;
}
async function calculation(page: Page,input: string) {
  const dialog=await calculator(page), entry=dialog.getByRole('textbox',{name:'Działanie do obliczenia',exact:true});
  if(!await entry.isVisible()) await dialog.getByRole('button',{name:'Kalkulator',exact:true}).click();
  await entry.fill(input); await dialog.getByRole('button',{name:'Oblicz',exact:true}).click();
  const result=dialog.locator('.workspace__result').first(); await expect(result).toBeVisible(); return result;
}
async function resume(page: Page) {
  await closeCalculator(page);
  await page.getByRole('button',{name:'Zapisz i wyjdź',exact:true}).click();
  await page.getByRole('button',{name:'Wznów przerwaną sesję',exact:true}).click();
  await expect(page.locator('.arena')).toHaveAttribute('data-math-ready','true');
}
function chooseTex(area: Locator, tex: string) {
  const exact = new RegExp(`^${tex.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`);
  return area.locator('button.choice').filter({has:area.page().locator('annotation').filter({hasText:exact})});
}
async function attemptCount(page: Page,questionId: string) {
  return page.evaluate(async id=>{
    const db=await new Promise<IDBDatabase>(resolve=>{const r=indexedDB.open('forge');r.onsuccess=()=>resolve(r.result);});
    const rows=await new Promise<Array<{questionId:string}>>(resolve=>{const r=db.transaction('attempts').objectStore('attempts').getAll();r.onsuccess=()=>resolve(r.result);});db.close();return rows.filter(row=>row.questionId===id).length;
  },questionId);
}

for(const fixture of [
  {id:'q-disc-1',input:'(-6)^2-4*1*5',result:'16',note:'a=1, b=-6, c=5; zachowuję znaki.'},
  {id:'l-for-6',input:'-3/((-5-3)/2)',result:'0.75',note:'Najpierw wyznaczam a, potem miejsce zerowe.'},
  {id:'f-bas-7',input:'(43-8)/3,5',result:'10',note:'Odejmuję opłatę początkową.'},
]) test(`rachunki ${fixture.id}: modal, zapis i prawidłowe zaliczenie`,async({page})=>{
  const {question}=await task(page,fixture.id);
  await expect(page.getByRole('region',{name:'Miejsce na rachunki'})).toHaveCount(0);
  await expect(page.locator('.arena__answer .choice')).toHaveCount(4);
  await (await notes(page)).fill(fixture.note);
  await (await notes(page)).press('Enter');
  await expect(page.locator('.fb')).toHaveCount(0);
  await resume(page);
  await expect(await notes(page)).toHaveValue(fixture.note+'\n');
  await expect(await calculation(page,fixture.input)).toContainText(fixture.result.replace('.',','));
  await (await calculator(page)).getByRole('button',{name:'Wstaw odpowiedź',exact:true}).click();
  await expect(page.locator('.arena__answer .choice--picked')).toContainText(question.answer);
  await page.reload(); await expect(page.locator('.arena')).toHaveAttribute('data-math-ready','true');
  await expect(page.locator('.arena__answer .choice--picked')).toContainText(question.answer);
  await expect(await notes(page)).toHaveValue(fixture.note+'\n');
  await expect((await calculator(page)).locator('.workspace__result')).toContainText(fixture.result.replace('.',','));
  await expectNoSideScroll(page,'kalkulator w modalu'); await closeCalculator(page);
  await page.getByRole('button',{name:/^Sprawdź odpowiedź/}).click();
  await expect(page.locator('.fb__verdict')).toHaveText('Dobrze');
  await expect(page.locator('.fb__details')).not.toHaveAttribute('open','');
  await expect(page.locator('.fb__meta')).toHaveCount(0);
});

test('sqrt48: krótkie ABCD, błąd bez zaliczenia, powrót do kroku i jedno końcowe zaliczenie',async({page})=>{
  await task(page,'n-root-3',true);
  const micro=page.getByRole('region',{name:'Małe kroki zadania'});
  await expect(micro.locator('button.choice')).toHaveCount(4);
  await expect(page.locator('.arena__question')).toHaveClass(/sr-only/);
  await expect(page.locator('.arena__question')).toHaveCSS('width','1px');
  await expect(page.getByRole('button',{name:'Nauczyciel',exact:true})).toHaveCount(1);
  await expect(page.getByRole('button',{name:'Kalkulator',exact:true})).toHaveCount(1);
  await micro.locator('button.choice').filter({hasNot:page.locator('annotation').filter({hasText:/^16 \\cdot 3$/})}).first().click();
  await expect(micro.getByRole('status')).toHaveText('Spróbuj jeszcze raz.');
  expect(await attemptCount(page,'n-root-3')).toBe(0);
  await chooseTex(micro,'16 \\cdot 3').click();
  await expect(micro).toContainText('Krok 2 z 3');
  await expect(micro.getByRole('heading')).toBeFocused();
  await resume(page); await page.reload();
  await expect(micro).toContainText('Krok 2 z 3');
  await chooseTex(micro,'\\sqrt{16} \\cdot \\sqrt{3}').click();
  await expect(micro).toContainText('Krok 3 z 3');
  await expect(micro.getByRole('heading')).toBeFocused();
  await expectNoSideScroll(page,'krótki quiz pierwiastków');
  await chooseTex(micro,'4\\sqrt{3}').click();
  await expect(page.locator('.fb__verdict')).toHaveText('Dobrze');
  await expect(micro).toHaveCount(0);
  await expect(page.locator('.arena__answer .choice')).toHaveCount(0);
  await expect(page.locator('.fb__meta')).not.toBeVisible();
  await expect(page.locator('.fb__meta')).toContainText('szczebel 5');
  await expect.poll(()=>attemptCount(page,'n-root-3')).toBe(1);
  await page.reload(); await expect(page.locator('.fb__verdict')).toHaveText('Dobrze');
  expect(await attemptCount(page,'n-root-3')).toBe(1);
});

test('samodzielny prosty finał zapisuje dowód małej umiejętności bez zbędnego mikroekranu',async({page})=>{
  await task(page,'q-disc-1',true,{id:'e2e-direct-square',prompt:'Oblicz $(-4)^2$.',answer:'16',steps:['$(-4)^2=16$.']});
  await expect(page.getByRole('region',{name:'Małe kroki zadania'})).toHaveCount(0);
  await chooseTex(page.locator('.arena__answer'),'16').click();
  await page.getByRole('button',{name:/^Sprawdź odpowiedź/}).click();
  await expect(page.locator('.fb__verdict')).toHaveText('Dobrze');
  await expect(page.locator('.fb__meta')).toHaveCount(0);
  const records=await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('forge.workspace.v1:micro-evidence')!).steps).map(raw=>JSON.parse(String(raw))));
  expect(records).toEqual(expect.arrayContaining([expect.objectContaining({questionId:'e2e-direct-square',tags:expect.arrayContaining(['simple-square']),correct:true,assisted:false})]));
  await page.reload();
  expect(await attemptCount(page,'e2e-direct-square')).toBe(1);
});

test('przejście do finału zachowuje wyłącznie ostatni wykonany rachunek',async({page})=>{
  await task(page,'n-root-3',true);
  const micro=page.getByRole('region',{name:'Małe kroki zadania'});
  await chooseTex(micro,'16 \\cdot 3').click();
  await page.getByRole('button',{name:'Znam odpowiedź',exact:true}).click();
  await expect(page.locator('.arena__working-result annotation')).toHaveText('16 \\cdot 3');
  expect(await attemptCount(page,'n-root-3')).toBe(0);
  await page.reload();
  await expect(page.locator('.arena__working-result annotation')).toHaveText('16 \\cdot 3');
  await expect(page.locator('.arena__working-result')).not.toContainText('4√3');
  expect(await attemptCount(page,'n-root-3')).toBe(0);
});

test('Znam odpowiedź zachowuje samodzielność, a powtórka krokami nie nadpisuje błędnej oceny',async({page})=>{
  await task(page,'n-root-3',true);
  await page.getByRole('button',{name:'Znam odpowiedź',exact:true}).click();
  await page.reload(); await expect(page.locator('.arena')).toHaveAttribute('data-math-ready','true');
  await expect(page.getByRole('region',{name:'Małe kroki zadania'})).toHaveCount(0);
  await expect(page.locator('.arena__working-result')).toHaveCount(0);
  expect(await attemptCount(page,'n-root-3')).toBe(0);
  const wrong=page.locator('.arena__answer button.choice').filter({hasNot:page.locator('annotation').filter({hasText:/^4\\sqrt\{3\}$/})}).first();
  await wrong.click(); await page.getByRole('button',{name:/^Sprawdź odpowiedź/}).click();
  const verdict=await page.locator('.fb__verdict').innerText(); expect(verdict).not.toBe('Dobrze');
  await expect(page.locator('.fb__meta')).toHaveCount(0);
  await page.getByRole('button',{name:'Rozwiąż krokami',exact:true}).click();
  const review=page.getByRole('dialog',{name:'Rozwiąż krokami',exact:true});
  await chooseTex(review,'16 \\cdot 3').click();
  await chooseTex(review,'\\sqrt{16} \\cdot \\sqrt{3}').click();
  await chooseTex(review,'4\\sqrt{3}').click();
  await review.getByRole('button',{name:'Wróć do oceny',exact:true}).click();
  await expect(page.locator('.fb__verdict')).toHaveText(verdict);
  expect(await attemptCount(page,'n-root-3')).toBe(1);
  await page.reload(); await expect(page.locator('.fb__verdict')).toHaveText(verdict);
  expect(await attemptCount(page,'n-root-3')).toBe(1);
});

test('kalkulator offline tłumaczy działanie i Enter nie wysyła całego zadania',async({page,context})=>{
  await task(page,'f-bas-7'); await calculation(page,'43 minus 8');
  await context.setOffline(true);
  const dialog=await calculator(page), input=dialog.getByRole('textbox',{name:'Działanie do obliczenia'});
  await input.fill('35 dzielone przez 3,5'); await input.press('Enter');
  await expect(dialog.locator('.workspace__result')).toContainText('10');
  await input.fill('1/0'); await input.press('Enter');
  await expect(dialog.getByText(/Brak skończonego wyniku/)).toBeVisible();
  await expect(page.locator('.fb')).toHaveCount(0);
});

test('zapis słowny nauczyciela wraca po wznowieniu i nie jest pomocą w metodzie',async({page})=>{
  let calls=0;
  await page.route('**/api/nauczyciel/status',route=>route.fulfill({json:{dostepny:true,model:'mock',powod:null}}));
  await page.route('**/api/nauczyciel',async route=>{
    calls++; expect(route.request().postDataJSON().prosba).toBe('zapis');
    await route.fulfill({json:{tekst:'Twój zapis: $(-6)^2-4\\cdot1\\cdot5$.',model:'mock',struktura:{rodzaj:'inne',ujawniaWynik:false,pytanieKontrolne:'',misconception:'',zapisKalkulatora:'(-6)^2-4*1*5'}}});
  });
  await task(page,'q-disc-1');
  const dialog=await calculator(page);
  await dialog.getByRole('button',{name:'Zapytaj nauczyciela',exact:true}).click();
  const teacher=page.getByRole('dialog',{name:'Nauczyciel',exact:true});
  await teacher.getByLabel('Własne pytanie do nauczyciela').fill('minus sześć w nawiasie do kwadratu minus cztery razy jeden razy pięć');
  await teacher.getByRole('button',{name:'Zapisz matematycznie'}).click();
  await teacher.getByRole('button',{name:'Wstaw do kalkulatora'}).click();
  await dialog.getByRole('button',{name:'Oblicz',exact:true}).click();
  await expect(dialog.locator('.workspace__result')).toContainText('16');
  await dialog.getByRole('button',{name:'Wstaw odpowiedź'}).click();
  await resume(page); await page.reload();
  await (await calculator(page)).getByRole('button',{name:'Zapytaj nauczyciela',exact:true}).click();
  await expect(teacher.getByRole('button',{name:'Wstaw do kalkulatora'})).toBeVisible();
  expect(calls).toBe(1);
  await teacher.getByRole('button',{name:'Zamknij nauczyciela'}).click(); await closeCalculator(page);
  await page.getByRole('button',{name:/^Sprawdź odpowiedź/}).click();
  await expect(page.locator('.fb__verdict')).toHaveText('Dobrze');
  await expect(page.locator('.fb__meta')).toHaveCount(0);
});

test('schowana odpowiedź AI nie ujawnia wyniku przed świadomym wyborem',async({page})=>{
  await page.route('**/api/nauczyciel/status',route=>route.fulfill({json:{dostepny:true,model:'mock',powod:null}}));
  await page.route('**/api/nauczyciel',route=>route.fulfill({json:{tekst:'Wyróżnik wynosi 16.',model:'mock',struktura:{rodzaj:'rozwiazanie',ujawniaWynik:true,pytanieKontrolne:'',misconception:''}}}));
  await task(page,'q-disc-1');
  await page.getByRole('button',{name:'Nauczyciel',exact:true}).click();
  const teacher=page.getByRole('dialog',{name:'Nauczyciel',exact:true});
  await teacher.getByRole('button',{name:/Pomóż mi zrobić następny krok/}).click();
  await expect(teacher.getByText('Ta odpowiedź zawiera wynik — pokaż mimo to')).toBeVisible();
  await expect(teacher.getByText('Wyróżnik wynosi 16.',{exact:true})).not.toBeVisible();
  await teacher.getByText('Ta odpowiedź zawiera wynik — pokaż mimo to').click();
  await expect(teacher.getByText('Wyróżnik wynosi 16.',{exact:true})).toBeVisible();
  await teacher.getByRole('button',{name:'Zamknij nauczyciela'}).click();
  await chooseTex(page.locator('.arena__answer'),'16').click();
  await page.getByRole('button',{name:/^Sprawdź odpowiedź/}).click();
  await expect(page.locator('.fb__meta')).toContainText('szczebel 6');
});

test('odpowiedź AI po zamknięciu nie kosztuje ponownie',async({page})=>{
  let release!:()=>void; const pending=new Promise<void>(resolve=>{release=resolve;});let calls=0;
  await page.route('**/api/nauczyciel/status',route=>route.fulfill({json:{dostepny:true,model:'mock',powod:null}}));
  await page.route('**/api/nauczyciel',async route=>{calls++;await pending;await route.fulfill({json:{tekst:'Zachowana wskazówka: sprawdź znak.',model:'mock',struktura:{rodzaj:'podpowiedz',ujawniaWynik:false,pytanieKontrolne:'Jaki będzie znak?',misconception:''}}});});
  await task(page,'q-disc-1');
  await page.getByRole('button',{name:'Nauczyciel',exact:true}).click();
  const teacher=page.getByRole('dialog',{name:'Nauczyciel',exact:true});
  await teacher.getByRole('button',{name:/Pomóż mi zrobić następny krok/}).click();
  await expect(teacher.getByText('Przygotowuję odpowiedź…')).toBeVisible();
  await teacher.getByRole('button',{name:'Zamknij nauczyciela'}).click();release();
  await expect.poll(()=>page.evaluate(()=>Object.entries(localStorage).filter(([key])=>key.startsWith('forge.teacher.chat:')).map(([,value])=>value).join(''))).toContain('Zachowana wskazówka');
  await page.getByRole('button',{name:'Nauczyciel',exact:true}).click();
  await expect(teacher.getByText('Zachowana wskazówka: sprawdź znak.')).toBeVisible();
  expect(calls).toBe(1);
});
