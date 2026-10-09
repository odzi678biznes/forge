import { evaluate, simplify } from 'mathjs';
import type { Question } from '@/data/types';
import type { MicroOption, MicroStep } from './math-learning-types';
import { numericMicrostepsForQuestion } from './math-numeric-plans';
import { exactExpressionIdentity } from './math-expression-proof';

const clean = (s: string) => s.trim().replace(/\\(?:left|right)/g, '').replace(/\\[,!; ]/g, '').replace(/\{,\}/g, '.').replace(/\s+/g, '');

/** Bounded expression grammar for comparing alternatives, not a general TeX interpreter. */
function expression(tex: string): string | null {
  let source = clean(tex.replace(/\\mathrm\{tg\}/g,'\\tan'))
    .replace(/\\alpha/g,'u').replace(/\\beta/g,'v').replace(/\\gamma/g,'w').replace(/\\theta/g,'z');
  const argument = (start: number): [string, number] | null => {
    if (source[start] !== '{') return source[start] && /[\da-z]/i.test(source[start]!) ? [source[start]!, start + 1] : null;
    let depth = 1;
    for (let i = start + 1; i < source.length; i++) {
      if (source[i] === '{') depth++;
      if (source[i] === '}') { depth--; if (depth === 0) return [source.slice(start + 1, i), i + 1]; }
    }
    return null;
  };
  for (let i = 0; i < 16; i++) {
    const command = /\\([dt]?frac|sqrt)/.exec(source);
    if (!command) break;
    const a = argument(command.index + command[0].length);
    if (!a) return null;
    const numerator = expression(a[0]);
    if (numerator === null) return null;
    let end = a[1], replacement = `sqrt(${numerator})`;
    if (command[1] !== 'sqrt') {
      const b = argument(end); if (!b) return null;
      const denominator = expression(b[0]); if (denominator === null) return null;
      replacement = `((${numerator})/(${denominator}))`; end = b[1];
    }
    source = source.slice(0, command.index) + replacement + source.slice(end);
  }
  // Function arguments are deliberately narrow and explicit; no arbitrary
  // functions, assignments, units or code survive this whitelist.
  for (let i=0;i<12;i++) {
    const command=/\\(sin|cos|tan|tg|ln|log)/.exec(source); if (!command) break;
    let at=command.index+command[0].length, power='',base='';
    for (let suffix=0;suffix<2;suffix++) {
      if (!['^','_'].includes(source[at]??'')) break;
      const kind=source[at++], arg=argument(at); if (!arg) return null;
      const parsed=expression(arg[0]); if (parsed===null) return null;
      if (kind==='^') power=parsed; else base=parsed;
      at=arg[1];
    }
    let raw='',end=at;
    if (source[at]==='(') {
      let depth=1;
      for (end=at+1;end<source.length;end++) {
        if (source[end]==='(') depth++;
        if (source[end]===')' && --depth===0) break;
      }
      if (depth!==0) return null;
      raw=source.slice(at+1,end++);
    } else if (source[at]==='{') {
      const arg=argument(at); if (!arg) return null; raw=arg[0];end=arg[1];
    } else {
      const arg=/^(?:\d+(?:\.\d+)?[a-z]?|[a-z])(?:\^\\circ)?/i.exec(source.slice(at));
      if (!arg) return null;raw=arg[0];end=at+raw.length;
      // In log_2 3^2 the exponent belongs to the argument, not to the
      // logarithm. Function powers have already been read before its argument.
      if (!raw.endsWith('\\circ') && source[end]==='^') {
        const exponent=argument(end+1); if (!exponent) return null;
        raw+=`^{${exponent[0]}}`; end=exponent[1];
      }
    }
    const degrees=/\^\\circ$/.test(raw);raw=raw.replace(/\^\\circ$/,'');
    const parsed=expression(raw);if(parsed===null)return null;
    const fn=command[1]==='tg'?'tan':command[1]==='ln'?'log':command[1];
    const arg=degrees?`(${parsed})*pi/180`:parsed;
    const functionBase=fn==='log'?(base|| (command[1]==='ln'?'':'10')):'';
    let replacement=`${fn}(${arg}${functionBase?`,${functionBase}`:''})`;
    if(power)replacement=`(${replacement})^(${power})`;
    source=source.slice(0,command.index)+replacement+source.slice(end);
  }
  if ((source.match(/\|/g)?.length??0)===2) source=source.replace(/\|([^|]+)\|/,'abs($1)');
  source = source.replace(/\\(?:cdot|times)/g, '*').replace(/\\pi/g, 'pi').replace(/[{}]/g, (c) => c === '{' ? '(' : ')');
  if (source.length > 160 || /[^\da-z.,+*/^()\-]/i.test(source)) return null;
  if (/\^(?:\(?-?\d{2,}|\(?[a-z])/i.test(source)) return null;
  // Explicit products prevent mathjs treating ab as a single unrelated symbol.
  source = source.replace(/[a-z]+/gi, (s) => ['sqrt','abs','sin','cos','tan','log','pi'].includes(s) ? s : s.split('').join('*'));
  return source;
}

function expressionValues(tex: string): number[] | null {
  const parsed = expression(tex); if (!parsed) return null;
  const values: number[] = [];
  for (const base of [0.37, 1.19, 2.43, 4.71, -0.83, -2.17]) {
    const scope = Object.fromEntries('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, i) => [letter, base + i * 0.23]));
    try { const value: unknown = evaluate(parsed, scope); values.push(typeof value === 'number' && Number.isFinite(value) ? value : NaN); }
    catch { values.push(NaN); }
  }
  return values.some(Number.isFinite) ? values : null;
}
const different = (a: number, b: number) => Math.abs(a - b) > 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

interface Interval { lo: number; hi: number; left: boolean; right: boolean }
function intervalSet(tex: string): Interval[] | null {
  const parts = clean(tex).replace(/^\w\\in/, '').replace(/;/g,',').split('\\cup');
  const result: Interval[] = [];
  for (const part of parts) {
    const finiteSet = /^\\\{(-?\d+(?:[.,]-?\d+)*)\\\}$/.exec(part);
    if (finiteSet) { result.push(...finiteSet[1]!.split(',').map(Number).map(x => ({ lo: x, hi: x, left: true, right: true }))); continue; }
    const interval = /^(\(|\[|\\langle)(-?\d+(?:\.\d+)?|-?\\infty),([+-]?\d+(?:\.\d+)?|[+-]?\\infty)(\)|\]|\\rangle)$/.exec(part);
    if (!interval) return null;
    const endpoint = (s: string) => /infty/.test(s) ? (s.startsWith('-') ? -Infinity : Infinity) : Number(s);
    const lo = endpoint(interval[2]!), hi = endpoint(interval[3]!);
    const left = interval[1] !== '(', right = interval[4] !== ')';
    if (lo >= hi || (left && !Number.isFinite(lo)) || (right && !Number.isFinite(hi))) return null;
    result.push({ lo, hi, left, right });
  }
  return result.length ? result : null;
}
const contains = (set: Interval[], x: number) => set.some(i => (x > i.lo || i.left && x === i.lo) && (x < i.hi || i.right && x === i.hi));

/** A concrete counterexample proves expressions differ; interval comparison includes every boundary. */
export function authoredAlternativesDiffer(a: string, b: string): boolean {
  const leftSet = intervalSet(a), rightSet = intervalSet(b);
  if (leftSet || rightSet) {
    if (!leftSet || !rightSet) return false;
    const ends = [...new Set([...leftSet, ...rightSet].flatMap(i => [i.lo, i.hi]).filter(Number.isFinite))].sort((x, y) => x - y);
    const probes = [...ends, (ends[0] ?? 0) - 1, (ends.at(-1) ?? 0) + 1, ...ends.slice(1).map((end, i) => (end + ends[i]!) / 2)];
    return probes.some(x => contains(leftSet, x) !== contains(rightSet, x));
  }
  // Reject exact identities before floating-point probes (cancellation can
  // otherwise make a large-coefficient identity look slightly unequal).
  if (identity(a,b)) return false;
  const left = expressionValues(a), right = expressionValues(b);
  return !!left && !!right && left.some((x, i) => Number.isFinite(x) && Number.isFinite(right[i]) && different(x, right[i]!));
}

function relation(tex: string): { difference: string; operator: string } | null {
  const parts = clean(tex).split(/(\\leq?|\\geq?|\\ne|[=<>])/);
  if (parts.length !== 3) return null;
  const left = expression(parts[0]!), right = expression(parts[2]!);
  if (!left || !right) return null;
  return {difference:`(${left})-(${right})`,operator:parts[1]!};
}
function relatedAlternativesDiffer(a: string, b: string): boolean {
  const ra = relation(a), rb = relation(b);
  if (!ra || !rb || ra.operator !== rb.operator) return false;
  // Exact simplification rejects proportional equations (x=2 and 2x=4).
  try {
    const ratio = simplify(`(${ra.difference})/(${rb.difference})`).toString();
    if (/^-?\d+(?:\.\d+)?(?: \/ \d+)?$/.test(ratio)) return false;
  } catch { return false; }
  // Accept only one-variable linear relations: their boundary is exactly determined.
  const variables = [...new Set((ra.difference + rb.difference).match(/[a-z]/g))];
  if (variables.length !== 1) return false;
  const variable = variables[0]!;
  try {
    const coefficients = (s: string) => {
      const constant = Number(evaluate(s,{[variable]:0})), atOne = Number(evaluate(s,{[variable]:1}));
      const slope = atOne - constant;
      if (!Number.isFinite(constant) || !Number.isFinite(slope) || slope === 0
        || simplify(`(${s})-((${slope})*${variable}+(${constant}))`).toString() !== '0') return null;
      return {root:-constant/slope,slope};
    };
    const x = coefficients(ra.difference), y = coefficients(rb.difference);
    return !!x && !!y && (different(x.root,y.root) || (!['=','\\ne'].includes(ra.operator) && x.slope*y.slope<0));
  } catch { return false; }
}
function equivalentRelations(a: string, b: string): boolean {
  const left=relation(a),right=relation(b);
  if (!left || !right || left.operator!==right.operator) return false;
  try {
    const ratio=simplify(`(${left.difference})/(${right.difference})`).toString();
    if (!/^-?\d+(?:\.\d+)?(?: \/ \d+)?$/.test(ratio)) return false;
    const scale=Number(evaluate(ratio));
    return Number.isFinite(scale) && scale!==0 && (['=','\\ne'].includes(left.operator) || scale>0);
  } catch {return false;}
}

function variants(rhs: string, seed: string, relational = false): MicroOption[] {
  const candidates: string[] = [];
  // Preserve the shape of a formula. Never turn an exponent/subscript into prose.
  for (const number of rhs.matchAll(/\d+(?:\.\d+)?/g)) {
    if (/_\{?$/.test(rhs.slice(0, number.index))) continue;
    for (const delta of [1, -1, 2, -2]) {
      const n = Number(number[0]) + delta;
      if (n >= 0) candidates.push(rhs.slice(0, number.index) + n + rhs.slice(number.index! + number[0].length));
    }
  }
  if (intervalSet(rhs)) {
    candidates.push(rhs.replace(/\\langle/, '('), rhs.replace(/\\rangle/, ')'), rhs.replace(/^\(/, '\\langle'), rhs.replace(/\)$/, '\\rangle'));
  }
  for (const sign of rhs.matchAll(/[+-]/g)) candidates.push(rhs.slice(0, sign.index) + (sign[0] === '+' ? '-' : '+') + rhs.slice(sign.index! + 1));
  const accepted = [rhs];
  for (const candidate of candidates) {
    if (candidate.length > 110 || !accepted.every(other => relational ? relatedAlternativesDiffer(other, candidate) : authoredAlternativesDiffer(other, candidate))) continue;
    accepted.push(candidate); if (accepted.length === 4) break;
  }
  if (accepted.length < 3) return [];
  let hash = [...seed].reduce((n, c) => Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const result = accepted.map(tex => ({ tex, answer: tex }));
  for (let i = result.length - 1; i > 0; i--) { hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0; const j = hash % (i + 1); [result[i], result[j]] = [result[j]!, result[i]!]; }
  return result;
}

function identity(a: string, b: string): boolean {
  const x = expression(a), y = expression(b); if (!x || !y) return false;
  const exact = exactExpressionIdentity(x, y);
  if (exact !== null) return exact;
  try { return simplify(`(${x})-(${y})`).toString() === '0'; } catch { return false; }
}

interface AuthoredRecipe { anchor: string; stages: { lhs: string; rhs: string; prompt?: string; kind?: 'transform' | 'condition' | 'domain' }[] }
/** Reviewed bridges where the original solution compresses an important operation. */
const RECIPES: Record<string, AuthoredRecipe> = {
  'p-circ-3': {anchor:'bok $AB$ jest średnicą',stages:[
    {lhs:'\\angle ACB',rhs:'90',prompt:'Ile stopni ma kąt wpisany oparty na średnicy $AB$?'},
    {lhs:'180-90-35',rhs:'55',prompt:'W trójkącie suma kątów wynosi $180^\\circ$. Oblicz $180-90-35$.'},
  ]},
  'g-fig-5': {anchor:'$C = (6, 5)$',stages:[
    {lhs:'x_D',rhs:'1+6-5',prompt:'W równoległoboku $D=A+C-B$. Które podstawienie wyznacza pierwszą współrzędną $D$?'},
    {lhs:'1+6-5',rhs:'2'},
    {lhs:'1+5-2',rhs:'4',prompt:'Oblicz drugą współrzędną $y_D=1+5-2$.'},
    {lhs:'2+4',rhs:'6',prompt:'Dodaj otrzymane współrzędne $D=(2,4)$.'},
  ]},
  'u-vec-8': {anchor:'3\\overrightarrow{MB}',stages:[
    {lhs:'x_M',rhs:'\\frac{1+3\\cdot5}{4}',prompt:'$AM=3MB$, więc $M=(A+3B)/4$. Jak podstawisz dane do pierwszej współrzędnej?'},
    {lhs:'\\frac{1+3\\cdot5}{4}',rhs:'4'},
    {lhs:'\\frac{1+3\\cdot9}{4}',rhs:'7',prompt:'Oblicz drugą współrzędną $y_M=(1+3\\cdot9)/4$.'},
    {lhs:'4+7',rhs:'11',prompt:'Dodaj współrzędne $M=(4,7)$.'},
  ]},
  'st-pr-7': {anchor:'krawędź podstawy $6$',stages:[
    {lhs:'P_p',rhs:'\\frac{6^2\\sqrt3}{4}',prompt:'Podstawa to trójkąt równoboczny. Które podstawienie do $P_p=a^2\\sqrt3/4$ jest właściwe?'},
    {lhs:'\\frac{6^2\\sqrt3}{4}',rhs:'9\\sqrt3'},
    {lhs:'9\\sqrt3\\cdot10',rhs:'90\\sqrt3',prompt:'Pomnóż pole podstawy przez wysokość graniastosłupa $10$.'},
  ]},
  'st-adv-5': {anchor:'krawędzie ostrosłupa prawidłowego czworokątnego',stages:[
    {lhs:'R^2',rhs:'\\frac{4^2+4^2}{4}',prompt:'$R$ to połowa przekątnej kwadratu podstawy. Jak wyznaczysz $R^2$?'},
    {lhs:'\\frac{4^2+4^2}{4}',rhs:'8'},
    {lhs:'4^2-8',rhs:'8',prompt:'Krawędź boczna ma długość $4$. Oblicz $H^2=4^2-R^2$.'},
    {lhs:'\\sqrt8',rhs:'2\\sqrt2',prompt:'Wysokość jest dodatnia. Uprość $H=\\sqrt8$.'},
  ]},
  'st-adv-7': {anchor:'o promieniu podstawy $6$ i wysokości $8$',stages:[
    {lhs:'\\sqrt{6^2+8^2}',rhs:'10',prompt:'Przekrój osiowy ma ramiona długości $l$. Oblicz $l=\\sqrt{6^2+8^2}$.'},
    {lhs:'\\frac{12\\cdot8}{2}',rhs:'48',prompt:'Oblicz pole przekroju osiowego: podstawa $12$, wysokość $8$.'},
    {lhs:'\\frac{12+10+10}{2}',rhs:'16',prompt:'Oblicz połowę obwodu przekroju osiowego.'},
    {lhs:'48/16',rhs:'3',prompt:'Promień okręgu wpisanego to pole podzielone przez połowę obwodu. Oblicz $r=48/16$.'},
  ]},
  'u-gprf-8': {anchor:'$|AD| = 4$ i $|DB| = 9$',stages:[
    {lhs:'|CD|^2',rhs:'4\\cdot9',prompt:'Z podobieństwa trójkątów $|CD|^2=|AD|\\cdot|DB|$. Jak podstawisz dane?'},
    {lhs:'4\\cdot9',rhs:'36'},
    {lhs:'\\sqrt{36}',rhs:'6',prompt:'Długość wysokości jest dodatnia. Oblicz $|CD|=\\sqrt{36}$.'},
  ]},
  't-val-3': {anchor:'\\alpha = 2$',stages:[
    {lhs:'\\sqrt{1^2+2^2}',rhs:'\\sqrt5',prompt:'Dla tangensa $2$ wybierz przyprostokątne $1$ i $2$. Oblicz przeciwprostokątną.'},
    {lhs:'\\sin\\alpha\\cos\\alpha',rhs:'\\frac2{\\sqrt5}\\cdot\\frac1{\\sqrt5}',prompt:'Jak podstawisz sinus i cosinus z tego trójkąta do ich iloczynu?'},
    {lhs:'\\frac2{\\sqrt5}\\cdot\\frac1{\\sqrt5}',rhs:'\\frac25'},
  ]},
  't-id-3': {anchor:'\\alpha = 3$',stages:[
    {lhs:'\\frac{\\sin\\alpha+\\cos\\alpha}{\\sin\\alpha-\\cos\\alpha}',rhs:'\\frac{\\tan\\alpha+1}{\\tan\\alpha-1}',prompt:'Podziel licznik i mianownik przez $\\cos\\alpha$ (kąt jest ostry). Jaki wzór otrzymasz?'},
    {lhs:'\\frac{3+1}{3-1}',rhs:'2',prompt:'Podstaw $\\tan\\alpha=3$ i oblicz $(3+1)/(3-1)$.'},
  ]},
  'x-le-3': {anchor:'\\log_2 (x - 1)',stages:[
    {lhs:'x',rhs:'(1, +\\infty)',prompt:'Dla jakich $x$ oba logarytmy istnieją?',kind:'domain'},
    {lhs:'(x-1)(x+1)',rhs:'x^2-1'},
    {lhs:'x^2=9',rhs:'\\{-3,3\\}',prompt:'Jakie są rozwiązania równania $x^2=9$ przed sprawdzeniem dziedziny?',kind:'condition'},
  ]},
  'x-le-7': {anchor:'\\log_2^2 x',stages:[
    {lhs:'t^2-3t+2',rhs:'(t-1)(t-2)',prompt:'Podstaw $t=\\log_2 x$. Jak rozłożysz $t^2-3t+2$ na czynniki?'},
    {lhs:'t\\in\\{1,2\\}',rhs:'\\{2,4\\}',prompt:'Jakie wartości $x=2^t$ odpowiadają $t=1$ i $t=2$?',kind:'condition'},
  ]},
  's-ser-8': {anchor:'(x - 1)^3',stages:[
    {lhs:'|x-1|<1',rhs:'(0,2)',prompt:'Dla jakich $x$ iloraz szeregu spełnia $|x-1|<1$?',kind:'domain'},
    {lhs:'S',rhs:'\\frac1{2-x}',prompt:'Jaki jest wzór sumy szeregu z $a_1=1$ i $q=x-1$?'},
    {lhs:'2x(2-x)-1',rhs:'-2x^2+4x-1'},
  ]},
  's-mix-8': {anchor:'b + 1',stages:[
    {lhs:'(5-r)(10+r)',rhs:'50-5r-r^2',prompt:'Dla $a=5-r$, $b=5$, $c=5+r$ uprość iloczyn $a(c+5)$.'},
    {lhs:'r^2+5r-14',rhs:'(r-2)(r+7)'},
    {lhs:'a=5-r',rhs:'\\{3,12\\}',prompt:'Jakie wartości $a=5-r$ otrzymasz dla $r=2$ lub $r=-7$?',kind:'condition'},
  ]},
  'k-prm-6': {anchor:'x^2 - 2mx + m + 2',stages:[
    {lhs:'(-2m)^2-4(m+2)',rhs:'4m^2-4m-8',prompt:'Uprość wyróżnik $(-2m)^2-4(m+2)$.'},
    {lhs:'4m^2-4m-8',rhs:'4(m-2)(m+1)'},
    {lhs:'m',rhs:'(2,+\\infty)',prompt:'Połącz: $\\Delta>0$, suma $2m>0$, iloczyn $m+2>0$. Jaki zbiór $m$ pozostaje?',kind:'condition'},
  ]},
  'k-prm-8': {anchor:'mx^2 + 2x + 1',stages:[
    {lhs:'2^2-4m',rhs:'4-4m',prompt:'Uprość wyróżnik równania ($m\\ne0$).'},
    {lhs:'m',rhs:'(0,1)',prompt:'Połącz: $\\Delta>0$, suma $-2/m<0$, iloczyn $1/m>0$. Jaki zbiór $m$ pozostaje?',kind:'condition'},
  ]},
  't-frm-8': {anchor:'\\cos 2x + \\sin x',stages:[
    {lhs:'1-2t^2+t',rhs:'(1-t)(2t+1)',prompt:'Po użyciu $\\cos 2x=1-2\\sin^2x$ podstaw $t=\\sin x$. Rozłóż $1-2t^2+t$.'},
  ]},
  't-eq-4': {anchor:'\\sin 2x = \\cos x',stages:[
    {lhs:'2sc-c',rhs:'c(2s-1)',prompt:'Użyj $s=\\sin x$, $c=\\cos x$. Jak rozłożysz $2sc-c$ bez dzielenia przez $c$?'},
    {lhs:'x',rhs:'\\{30,90,150\\}',prompt:'Dla $\\cos x=0$ lub $\\sin x=1/2$, jakie są kąty w $[0^\\circ,180^\\circ]$ (w stopniach)?',kind:'condition'},
  ]},
  'd-rul-7': {anchor:'\\frac{x^2 - 3}{x - 2}',stages:[
    {lhs:'2x(x-2)-(x^2-3)',rhs:'x^2-4x+3',prompt:'Uprość licznik pochodnej wyznaczonej regułą ilorazu.'},
    {lhs:'x^2-4x+3',rhs:'(x-1)(x-3)'},
  ]},
  'd-rul-8': {anchor:'x\\sqrt{4 - x}',stages:[
    {lhs:"f'(x)",rhs:'\\frac{8-3x}{2\\sqrt{4-x}}',prompt:'Zastosuj regułę iloczynu do $x\\sqrt{4-x}$. Jaka jest pochodna?'},
  ]},
  'd-opt-7': {anchor:'16\\pi',stages:[
    {lhs:'h',rhs:'\\frac{16}{r^2}',prompt:'Z $\\pi r^2h=16\\pi$ wyznacz wysokość $h$ dla $r>0$.'},
    {lhs:'P/\\pi',rhs:'2r^2+\\frac{32}{r}',prompt:'Podstaw wysokość do $P=2\\pi r^2+2\\pi rh$. Jaki jest wzór $P/\\pi$?'},
    {lhs:"(P/\\pi)'",rhs:'4r-\\frac{32}{r^2}',prompt:'Wyznacz pochodną $2r^2+32/r$.'},
  ]},
  'w-eq-8': {anchor:'x^4 - 2x^3 - x^2 + 2x',stages:[
    {lhs:'x^4-2x^3-x^2+2x',rhs:'x(x-2)(x-1)(x+1)'},
    {lhs:'x',rhs:'\\{-1,0,1,2\\}',prompt:'Jakie są rozwiązania $x(x-2)(x-1)(x+1)=0$?',kind:'condition'},
  ]},
};

export function authoredMathClassification(question: Question): { complexity: 'simple' | 'multi'; family: string; reason: string } {
  const formulas = [...new Set((question.steps ?? [question.solution]).flatMap(line => [...line.matchAll(/\$([^$]+)\$/g)].map(m => clean(m[1]!))))];
  const operations = formulas.reduce((sum, formula) => sum + (formula.match(/\\(?:frac|dfrac|sqrt|log|sin|cos|cdot|times|iff|Rightarrow)|[+*/^]|(?<=[\da-z})])-/g)?.length ?? 0), 0);
  const conditional = /param|ineq|proof|optim|conditional|compound|equations|eq-system|eq-rational|eq-abs|fn-compose|seq-mixed|seq-series|deriv-monotonic|deriv-extrema|deriv-tangent|stereo-angles|stereo-advanced|geo-point-line/.test(question.skillId);
  const multi = operations >= 2 || conditional || (question.steps?.length ?? 0) >= 3 || /sumę.*rozwiązań|ile liczb całkowitych|jednocześnie|podaj.*i.*podaj/i.test(question.prompt);
  return { complexity: multi ? 'multi' : 'simple', family: question.skillId,
    reason: `${operations} jawnych operatorów w różnych formułach rozwiązania${conditional ? '; rozumowanie z warunkiem/dziedziną' : ''}. To konserwatywny szacunek obciążenia kroków, nie zdolności ucznia.` };
}

/** Derive short authored stages only from the shipped, trusted worked solution. */
export function authoredMathSteps(question: Question): MicroStep[] {
  if (question.format === 'code') return [];
  const result: MicroStep[] = [];
  const complexity = authoredMathClassification(question).complexity;
  let previous: string | null = null;
  const add = (lhs: string, rhs: string, kind: 'transform' | 'condition' | 'domain', prompt?: string, relational = false, definition = false) => {
    if (result.length>=5 || !rhs || rhs.length > 100 || lhs.length > 150 || result.some(s => clean(s.lhs) === clean(lhs) && clean(s.rhs) === clean(rhs))) return;
    const options = variants(rhs, `${question.id}:${result.length}`, relational); if (!options.length) return;
    result.push({ id: `${question.id}:authored:${result.length}`, lhs, rhs, options, stageKind: kind, load: 1, complexity,
      skills: [question.skillId], tags: ['trusted-solution', 'parallel-options', ...(relational ? ['linear-relation'] : []), ...(definition ? ['authored-substitution'] : [])], ...(prompt ? { prompt } : {}) });
  };
  const recipe = RECIPES[question.id];
  if (recipe && question.prompt.includes(recipe.anchor)) {
    for (const stage of recipe.stages) add(stage.lhs,stage.rhs,stage.kind??'transform',stage.prompt);
    // The reviewed sequence replaces extraction; it is never prepended to a
    // second sequence repeating the same facts from the original solution.
    return result;
  }
  for (const line of question.steps ?? [question.solution]) {
    for (const match of line.matchAll(/\$([^$]+)\$/g)) {
      const formula = match[1]!.trim();
      const numericalFormula=formula.startsWith('=') && previous ? previous+formula : formula;
      try {
      const implications = formula.split(/\\(?:Rightarrow|iff)/).map(s=>s.trim());
      if (implications.length > 1) {
        for (let i=1;i<implications.length;i++) {
          const from=implications[i-1]!, to=implications[i]!;
          if (equivalentRelations(from,to))
            add(from,to,'condition',`Który warunek otrzymasz z $${from}$?`,true);
          const member=/^([xmnt])\s*\\in\s*(.+)$/.exec(to);
          if (member && intervalSet(member[2]!)) add(from,member[2]!,'condition',`Dla jakiego zbioru $${member[1]}$ zachodzi $${from}$?`);
        }
        previous=null; continue;
      }
      const member = /^([xmnt])\s*\\in\s*(.+)$/.exec(formula);
      if (member && intervalSet(member[2]!)) {
        add(question.prompt.match(/\$([^$]*(?:<|>|\\le|\\ge)[^$]*)\$/)?.[1] ?? member[1]!, member[2]!, /dziedzin/i.test(line) ? 'domain' : 'condition',
          /dziedzin/i.test(line) ? 'Jaka jest dziedzina?' : `Do jakiego zbioru należy $${member[1]}$?`);
        previous = null; continue;
      }
      const assignment = /^(f'\(x\)|g'\(x\)|f\(x\)|g\(x\)|P\(x\)|a_n)\s*=\s*([^=]+)$/.exec(formula);
      if (assignment && expressionValues(assignment[2]!) && !clean(question.prompt).includes(clean(formula))) {
        add(assignment[1]!, assignment[2]!, 'transform'); previous = null; continue;
      }
      const parts = formula.split('=').map(x => x.trim());
      if (parts[0] === '' && previous) parts[0] = previous;
      if (parts.length >= 2 && parts.every(p => p.length > 0 && p.length <= 100)) {
        const label=parts[0]!,rhs=parts[1]!;
        const named=/^(?:[A-Za-z](?:_(?:\{[A-Za-z0-9]+\}|[A-Za-z0-9]))?(?:\^\{?\d+\}?)?'?|\\(?:Delta|delta)|\\(?:sin|cos|tan)(?:\^\{?\d+\}?)?\\(?:alpha|beta|gamma)|\\mathrm\{tg\}\\?,?\\(?:alpha|beta|gamma))$/.test(clean(label));
        const calculation=/\\(?:[dt]?frac|cdot|times|log|sin|cos|tan)|[+*/^]|\d\s*-/.test(rhs);
        const symbolic=/[a-z]/i.test(clean(rhs).replace(/\\\w+/g,''));
        if (named && (calculation || symbolic) && expressionValues(rhs) && !clean(question.prompt).includes(clean(formula))) {
          add(label,rhs,'transform',symbolic?`Który wzór opisuje $${label}$ w tym zadaniu?`:`Które podstawienie wyznacza $${label}$ w tym zadaniu?`,false,true);
        }
        for (let i = 1; i < parts.length; i++) {
          const lhs = parts[i - 1]!, rhs = parts[i]!;
          if (/[a-z]/i.test(clean(lhs).replace(/\\\w+/g, '')) && clean(lhs) !== clean(rhs) && identity(lhs, rhs)) add(lhs, rhs, 'transform');
        }
        previous = parts.at(-1)!;
      } else previous = null;
      } finally {
        // Keep the actual arithmetic directly after its substitution. Never
        // make the learner carry a number mentally into the final answer.
        for (const step of numericMicrostepsForQuestion({...question,steps:[`$${numericalFormula}$`]})) {
          if (result.length>=5) break;
          if (/^-?\d+(?:[.,]\d+)?$/.test(clean(step.lhs))) continue;
          if (result.some(s=>clean(s.lhs)===clean(step.lhs)&&clean(s.rhs)===clean(step.rhs))) continue;
          result.push({...step,id:`${question.id}:authnumeric:${result.length}`,stageKind:'arithmetic',complexity,
            load:1,skills:[question.skillId],tags:['trusted-solution','authored-arithmetic']});
        }
      }
      if (result.length >= 5) break;
    }
    if (result.length >= 5) break;
  }
  // Leave purely numeric questions with the numeric planner and its terminal
  // answer checks. This module owns plans containing at least one authored step.
  if (!result.some(s=>!s.tags?.includes('authored-arithmetic'))) return [];
  const last = result.at(-1);
  if (last && question.format === 'choice' && !last.tags?.some(tag=>['authored-substitution','authored-arithmetic'].includes(tag))) {
    const expected = question.choices?.['ABCD'.indexOf(question.answer)]?.replace(/^\$|\$$/g,'').replace(/^[xmnt]\s*\\in\s*/,'');
    const equivalent = expected && ((intervalSet(expected) && intervalSet(last.rhs) && !authoredAlternativesDiffer(expected,last.rhs))
      || identity(expected,last.rhs));
    if (equivalent) {
      const rhs=last.rhs;
      last.options=last.options.map((o,i)=>({...o,answer:o.answer===rhs?question.answer:`wrong:${i}`}));
      last.rhs=question.answer; last.finalAnswer=question.answer; last.stageKind='final';
    }
  }
  return result;
}

export const authoredRelationAlternativesDiffer = relatedAlternativesDiffer;
