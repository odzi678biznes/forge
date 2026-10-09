import {test,expect} from '@playwright/test';
import {open,expectNoSideScroll} from './helpers';
import {M1,operation,mockLearningApis} from './worked-helpers';

test.beforeEach(async({page})=>mockLearningApis(page));

test('kontrast faktycznych styli tekstu i kontrolki oraz powiększenie układu',async({page},info)=>{
  test.skip(info.project.name !== 'komputer','Obliczenia styli wystarczą w jednym projekcie.');
  await page.emulateMedia({reducedMotion:'reduce'});
  await open(page);
  const readings: unknown[]=[];
  const audit=async(label:string)=>{
    const values=await page.evaluate(()=>{
      const rgb=(s:string)=>s.match(/[\d.]+/g)!.map(Number);
      const blend=(a:number[],b:number[])=>a.slice(0,3).map((x,i)=>x*(a[3]??1)+b[i]!*(1-(a[3]??1)));
      const lum=(c:number[])=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i]!,0);
      const ratio=(a:number[],b:number[])=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
      const result=[];
      for(const e of document.querySelectorAll<HTMLElement>('p,button,summary,h1,h2,label,span,strong')){
        if(!e.checkVisibility()||e.matches(':disabled')||e.closest('.katex, [aria-hidden="true"]')||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent?.trim()))continue;
        const st=getComputedStyle(e);
        let bg=[7,10,15],opacity=1;
        const parents:Element[]=[];
        for(let p:Element|null=e;p;p=p.parentElement)parents.unshift(p);
        for(const p of parents){const s=getComputedStyle(p);bg=blend(rgb(s.backgroundColor),bg);opacity*=Number(s.opacity);if(s.backgroundImage.includes('gradient'))bg=[21,38,49];}
        const fg=blend([...rgb(st.color).slice(0,3),opacity],bg);
        const size=parseFloat(st.fontSize);const big=size>=24||(size>=18.66&&Number(st.fontWeight)>=700);
        result.push({text:e.textContent!.trim().slice(0,50),cls:e.className,ratio:ratio(fg,bg),minimum:big?3:4.5});
      }
      const root=getComputedStyle(document.documentElement);
      for(const color of ['--text','--text-muted','--text-faint'])for(const bg of ['--bg-abyss','--bg-deep','--bg-raised','--bg-overlay']){
        const hex=(s:string)=>s.trim().slice(1).match(/../g)!.map(v=>parseInt(v,16));
        result.push({text:color+' / '+bg,cls:'token',ratio:ratio(hex(root.getPropertyValue(color)),hex(root.getPropertyValue(bg))),minimum:4.5});
      }
      return result;
    });
    readings.push({label,values});
    expect(values.filter(v=>v.ratio<v.minimum),label).toEqual([]);
  };
  await audit('Dziś');
  await page.getByRole('button',{name:'Kurs',exact:true}).click();
  await audit('Kurs — rekomendacja, stany i metadane');
  await page.getByRole('button',{name:'Dziś',exact:true}).click();
  await page.getByRole('button',{name:'Rozpocznij lekcję',exact:true}).click();
  await audit('Karta bez wyboru');
  await operation(page,M1,0,false);
  await audit('Błędna operacja i wyjaśnienie');
  await operation(page,M1,0);
  await audit('Poprawna operacja i aktualny wzór');
  await page.getByRole('button',{name:'Zadanie i wykład',exact:true}).click();
  await audit('Arkusz zadania');
  await page.getByRole('button',{name:/Wykład do lekcji/}).click();
  await audit('Wykład');
  await page.keyboard.press('Escape');
  await page.locator('.feed__dol').getByRole('button',{name:'Zapytaj nauczyciela',exact:true}).click();
  await audit('Nauczyciel');
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:768,height:1000});
  await page.addStyleTag({content:'html {zoom:2}'});
  await expectNoSideScroll(page,'Powiększenie układu 200%');
  await page.locator('.worked-calculation__option').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:info.outputPath('zoom-200.png')});
  await expect(page.locator('.worked-calculation__option').first()).toBeInViewport();
  await info.attach('kontrast.json',{body:JSON.stringify(readings,null,2),contentType:'application/json'});
});
