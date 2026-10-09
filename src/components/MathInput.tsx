import { forwardRef, useId, useImperativeHandle, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import './math-input.css';

const preference = 'forge.math-keyboard';
function readMode(): boolean {
  try { return sessionStorage.getItem(preference) !== 'system'; } catch { return true; }
}
const keys = [
  ['7','7'],['8','8'],['9','9'],['/','Ułamek /'],['⌫','Usuń znak'],
  ['4','4'],['5','5'],['6','6'],['−','Minus'],['C','Wyczyść odpowiedź'],
  ['1','1'],['2','2'],['3','3'],[',','Przecinek dziesiętny'],['^','Potęga'],
  ['0','0'],['(','Otwórz nawias'],[')','Zamknij nawias'],['←','Kursor w lewo'],['→','Kursor w prawo'],
] as const;

/** The input stays editable for hardware keyboards, paste and selection.
 * inputMode=none suppresses the mobile IME; the explicit switch restores it. */
export const MathInput = forwardRef<HTMLInputElement, {
  value: string; onChange: (value: string) => void; disabled?: boolean;
  id?: string; label?: string; placeholder?: string; className?: string;
  focusOnly?: boolean;
  /** A quiet toolbar and an explicitly opened keypad for the course workpad. */
  compact?: boolean;
  /** Dodatkowy rząd klawiszy: [napis, nazwa dla czytnika, wstawiany tekst]. */
  extraKeys?: ReadonlyArray<readonly [string, string, string]>;
}>(function MathInput({value,onChange,disabled=false,id,label='Twoja odpowiedź',placeholder='np. 3/4',className='wpis__pole',focusOnly=false,compact=false,extraKeys=[]}, forwarded) {
  const field=useRef<HTMLInputElement>(null);
  useImperativeHandle(forwarded,()=>field.current!,[]);
  const [math,setMath]=useState(()=>compact ? false : readMode());
  const [open,setOpen]=useState(!compact && !focusOnly);
  const [cleared,setCleared]=useState<string|null>(null);
  const padId=useId();
  const edit=(key:string,insertText?:string)=>{
    const el=field.current;
    if(!el||disabled)return;
    let a=el.selectionStart??value.length, b=el.selectionEnd??a;
    let next=value;
    if(key==='←')a=b=a===b?Math.max(0,a-1):a;
    else if(key==='→')a=b=a===b?Math.min(value.length,b+1):b;
    else if(key==='C'){if(value)setCleared(value);next='';a=0;}
    else if(key==='⌫'){
      if(a===b)a=Math.max(0,a-1);
      next=value.slice(0,a)+value.slice(b);
    }else{
      const insert=insertText??(key==='−'?'-':key);
      next=value.slice(0,a)+insert+value.slice(b);a+=insert.length;
    }
    flushSync(()=>onChange(next));
    el.focus({preventScroll:true});
    el.setSelectionRange(a,a);
  };
  const switchMode=()=>{
    const selection=[field.current?.selectionStart??value.length,field.current?.selectionEnd??value.length];
    const next=!math;
    try{if(!compact)sessionStorage.setItem(preference,next?'math':'system');}catch{/* Ephemeral mode still works. */}
    field.current?.blur();
    flushSync(()=>{setMath(next);setOpen(compact ? next : true);});
    field.current?.focus({preventScroll:true});
    field.current?.setSelectionRange(selection[0]!,selection[1]!);
  };
  return <div className="math-entry" onBlur={e=>{
    if(focusOnly&&!e.currentTarget.contains(e.relatedTarget))setOpen(false);
  }}>
    <input ref={field} id={id} className={className} value={value}
      onChange={e=>onChange(e.target.value)} disabled={disabled}
      inputMode={math?'none':'text'} autoComplete="off" autoCapitalize="off" spellCheck={false}
      enterKeyHint="done" aria-label={label} placeholder={placeholder}
      onFocus={()=>{if(!compact)setOpen(true);}} />
    {!disabled&&<>
      <div className="math-entry__tools">
        <button type="button" className="math-entry__mode" onClick={switchMode}
          aria-label={math?'Klawiatura telefonu':'Klawiatura matematyczna'} title={math?'Klawiatura telefonu':'Klawiatura matematyczna'}>
          {compact ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M5 9h2m3 0h2m3 0h4M5 12h2m3 0h2m3 0h4M7 16h10"/></svg> : math?'Klawiatura telefonu':'Klawiatura matematyczna'}
        </button>
        {math&&<button type="button" className="math-entry__mode" aria-controls={padId}
          aria-expanded={open} aria-label={compact ? open?'Schowaj klawiaturę':'Pokaż cyfry' : undefined} title={open?'Schowaj klawiaturę':'Pokaż cyfry'} onClick={()=>setOpen(v=>!v)}>{compact ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={open ? 'm6 9 6 6 6-6' : 'm6 15 6-6 6 6'}/></svg> : open?'Schowaj':'Pokaż cyfry'}</button>}
      </div>
      {cleared!==null&&value===''&&<button type="button" className="math-entry__mode" onClick={()=>{
        flushSync(()=>onChange(cleared));setCleared(null);field.current?.focus({preventScroll:true});
      }}>Cofnij wyczyszczenie</button>}
      {math&&open&&<div id={padId} className="math-pad" role="group" aria-label="Klawiatura matematyczna">
        {extraKeys.map(([key,name,insert])=><button type="button" key={`x-${key}`} aria-label={name} title={name}
          className="math-pad__symbol math-pad__extra" onPointerDown={e=>e.preventDefault()} onClick={()=>edit(key,insert)}>{key}</button>)}
        {keys.map(([key,name])=><button type="button" key={key} aria-label={name} title={name}
          className={/^[0-9]$/.test(key)?'math-pad__digit':'math-pad__symbol'}
          onPointerDown={e=>e.preventDefault()} onClick={()=>edit(key)}>{key}</button>)}
      </div>}
    </>}
  </div>;
});
