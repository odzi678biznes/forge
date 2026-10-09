import { parse, type MathNode } from 'mathjs';
import type { Question } from '@/data/types';
import { grade } from '@/learning-engine/grading';
import type { MicroOption, MicroStep } from './math-learning-types';

type Polynomial = [number, number, number];
type Relation = '<' | '<=' | '>' | '>=' | '=';
interface Interval { low: number; high: number; left: boolean; right: boolean }
type RealSet = Interval[];
const r = String.raw;
const close = (a: number, b: number) => a === b || Math.abs(a - b) < 1e-9;
const all: RealSet = [{ low: -Infinity, high: Infinity, left: false, right: false }];
const clean = (tex: string) => tex.replace(/\$/g, '').replace(/\\(?:left|right)/g, '').replace(/\{,\}/g, '.')
  .replace(/(\d),(\d)/g, '$1.$2').replace(/[−–]/g, '-').replace(/\\(?:leq|le)/g, '<=').replace(/\\(?:geq|ge)/g, '>=')
  .replace(/≤/g, '<=').replace(/≥/g, '>=').trim();
const texRel = (rel: Relation) => rel === '<=' ? r`\le` : rel === '>=' ? r`\ge` : rel;
const reverse = (rel: Relation): Relation => ({ '<': '>', '<=': '>=', '>': '<', '>=': '<=', '=': '=' })[rel] as Relation;
const testRelation = (a: number, rel: Relation, b: number) => rel === '=' ? close(a, b)
  : rel === '<' ? a < b : rel === '<=' ? a <= b : rel === '>' ? a > b : a >= b;

/** Convert only elementary LaTeX; unknown commands are rejected by the parser. */
function source(tex: string): string | null {
  let s = clean(tex).replace(/\\(?:cdot|times)/g, '*').replace(/\\div/g, '/').replace(/\\[,!; ]/g, '');
  const atom = (start: number): [string, number] | null => {
    while (s[start] === ' ') start++;
    if (s[start] !== '{') return /[\dx]/.test(s[start] ?? '') ? [s[start]!, start + 1] : null;
    let depth = 1;
    for (let at = start + 1; at < s.length; at++) {
      if (s[at] === '{') depth++;
      if (s[at] === '}') { depth--; if (depth === 0) return [s.slice(start + 1, at), at + 1]; }
    }
    return null;
  };
  for (let count = 0; /\\(?:[dt]?frac|sqrt)/.test(s) && count < 20; count++) {
    const command = /\\([dt]?frac|sqrt)/.exec(s)!;
    const first = atom(command.index + command[0].length);
    if (!first) return null;
    const a = source(first[0]); if (a === null) return null;
    let replacement = `sqrt(${a})`, end = first[1];
    if (command[1] !== 'sqrt') {
      const second = atom(end); if (!second) return null;
      const b = source(second[0]); if (b === null) return null;
      replacement = `((${a})/(${b}))`; end = second[1];
    }
    s = s.slice(0, command.index) + replacement + s.slice(end);
  }
  s = s.replace(/\{/g, '(').replace(/\}/g, ')');
  return s.length <= 200 && /^[\d.a-z+*/^()\s-]+$/.test(s) ? s : null;
}

/** Structural coefficient calculation, not numeric sampling or eval of arbitrary input. */
export function parseMathPolynomial(tex: string, variable = 'x'): Polynomial | null {
  const expression = source(tex); if (!expression) return null;
  let visited = 0;
  const add = (a: Polynomial, b: Polynomial): Polynomial => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const scale = (a: Polynomial, b: number): Polynomial => [a[0] * b, a[1] * b, a[2] * b];
  const multiply = (a: Polynomial, b: Polynomial): Polynomial | null => {
    const product = [0, 0, 0, 0, 0];
    a.forEach((x, i) => b.forEach((y, j) => { product[i + j]! += x * y; }));
    return close(product[3]!, 0) && close(product[4]!, 0) ? product.slice(0, 3) as Polynomial : null;
  };
  const walk = (node: MathNode): Polynomial | null => {
    if (++visited > 80) return null;
    const n = node as unknown as { type: string; value?: unknown; name?: string; content?: MathNode; op?: string; args?: MathNode[] };
    if (n.type === 'ConstantNode' && typeof n.value === 'number' && Number.isFinite(n.value)) return [n.value, 0, 0];
    if (n.type === 'SymbolNode') return n.name === variable ? [0, 1, 0] : null;
    if (n.type === 'ParenthesisNode' && n.content) return walk(n.content);
    const args = n.args?.map(walk); if (!args || args.some(a => a === null)) return null;
    const a = args[0]!, b = args[1];
    if (n.type === 'FunctionNode' && n.name === 'sqrt' && args.length === 1 && a[1] === 0 && a[2] === 0 && a[0] >= 0) {
      const root = Math.sqrt(a[0]); return Number.isInteger(root) ? [root, 0, 0] : null;
    }
    if (n.type !== 'OperatorNode') return null;
    if (args.length === 1) return n.op === '-' ? scale(a, -1) : n.op === '+' ? a : null;
    if (!b) return null;
    if (n.op === '+') return add(a, b);
    if (n.op === '-') return add(a, scale(b, -1));
    if (n.op === '*') return multiply(a, b);
    if (n.op === '/' && b[1] === 0 && b[2] === 0 && b[0] !== 0) return scale(a, 1 / b[0]);
    if (n.op === '^' && b[1] === 0 && b[2] === 0) {
      if (b[0] === 2) return multiply(a, a);
      if (b[0] === 1) return a;
      if (b[0] === 0 && (a[1] !== 0 || a[2] !== 0 || a[0] === 0)) return null; // avoid erasing a possible 0^0
      if (a[1] === 0 && a[2] === 0 && Number.isInteger(b[0])) return [a[0] ** b[0], 0, 0];
    }
    return null;
  };
  try {
    const result = walk(parse(expression));
    return result?.every(v => Number.isFinite(v) && Math.abs(v) < 1e10) ? result : null;
  } catch { return null; }
}
const number = (tex: string): number | null => { const p = parseMathPolynomial(tex); return p && p[1] === 0 && p[2] === 0 ? p[0] : null; };
function fraction(value: number): [number, number] | null {
  for (let d = 1; d <= 10000; d++) if (Math.abs(value * d - Math.round(value * d)) < 1e-8) return [Math.round(value * d), d];
  return null;
}
function num(value: number): string {
  if (value === Infinity) return r`+\infty`;
  if (value === -Infinity) return r`-\infty`;
  const f = fraction(value); if (!f) throw new Error('Inexact coefficient');
  return f[1] === 1 ? String(f[0]) : `${f[0] < 0 ? '-' : ''}\\frac{${Math.abs(f[0])}}{${f[1]}}`;
}
const affine = (a: number, b: number, variable = 'x') => `${a === 1 ? '' : a === -1 ? '-' : num(a)}${variable}${b === 0 ? '' : b > 0 ? '+' + num(b) : num(b)}`;
const point = (value: number): Interval => ({ low: value, high: value, left: true, right: true });
function lineSet(a: number, b: number, rel: Relation): RealSet {
  if (close(a, 0)) return testRelation(b, rel, 0) ? all : [];
  const at = -b / a, direction = a < 0 ? reverse(rel) : rel;
  if (direction === '=') return [point(at)];
  return direction.startsWith('<') ? [{ low: -Infinity, high: at, left: false, right: direction === '<=' }]
    : [{ low: at, high: Infinity, left: direction === '>=', right: false }];
}
function setTex(set: RealSet): string {
  if (set.length === 0) return r`\varnothing`;
  if (sameSet(set, all)) return r`\mathbb{R}`;
  return set.map(i => i.low === i.high ? r`\{${num(i.low)}\}`
    : r`${i.left ? r`\langle` : '('}${num(i.low)},\,${num(i.high)}${i.right ? r`\rangle` : ')'}`).join(r`\cup`);
}
function sameSet(a: RealSet, b: RealSet): boolean {
  return a.length === b.length && a.every((x, i) => { const y = b[i]!; return close(x.low, y.low) && close(x.high, y.high) && x.left === y.left && x.right === y.right; });
}

/** Exact endpoint/closure comparison allows final choices to be verified independently of their answer letter. */
export function parseMathSet(tex: string): RealSet | null {
  let s = tex.replace(/\$/g, '').replace(/\\(?:left|right)/g, '').replace(/\\[,!; ]/g, '').replace(/\s/g, '')
    .replace(/\{,\}/g, '.').replace(/\\langle|⟨|</g, '[').replace(/\\rangle|⟩|>/g, ']')
    .replace(/^x\\in/, '').replace(/[−–]/g, '-');
  if (/^(?:\\varnothing|\\emptyset|∅|\{\}|\\\{\\\})$/.test(s)) return [];
  if (/^(?:\\mathbb\{R\}|\\mathbbR|ℝ|R|x\\in\\mathbb\{R\})$/.test(s)) return all;
  const parts = s.split(/\\cup|∪/);
  const result: RealSet = [];
  for (s of parts) {
    const singleton = /^(?:\\\{|\{)(.*?)(?:\\\}|\})$/.exec(s);
    if (singleton) { const v = number(singleton[1]!); if (v === null) return null; result.push(point(v)); continue; }
    const match = /^([[(])(.*)([\])])$/.exec(s); if (!match) return null;
    // Separator commas occur outside fraction braces only.
    let depth = 0, at = -1;
    for (let i = 0; i < match[2]!.length; i++) { const c = match[2]![i]; if (c === '{') depth++; if (c === '}') depth--; if ((c === ',' || c === ';') && depth === 0) { at = i; break; } }
    if (at < 0) return null;
    const endpoint = (raw: string) => /^[-+]?(?:\\infty|∞)$/.test(raw) ? raw.startsWith('-') ? -Infinity : Infinity : number(raw);
    const low = endpoint(match[2]!.slice(0, at)), high = endpoint(match[2]!.slice(at + 1));
    if (low === null || high === null || low > high || (!Number.isFinite(low) && match[1] === '[') || (!Number.isFinite(high) && match[3] === ']')) return null;
    if (low === high && !(match[1] === '[' && match[3] === ']')) continue;
    result.push({ low, high, left: match[1] === '[', right: match[3] === ']' });
  }
  return result.sort((a, b) => a.low - b.low);
}

function shuffle(options: MicroOption[], seed: string): MicroOption[] {
  let hash = [...seed].reduce((n, c) => Math.imul(n, 31) + c.charCodeAt(0) | 0, 13);
  return options.map(option => ({ option, order: (hash = Math.imul(hash, 1664525) + 1013904223 | 0) >>> 0 }))
    .sort((a, b) => a.order - b.order).map(item => item.option);
}
function stage(q: Question, key: string, prompt: string, lhs: string, rhs: string, alternatives: string[], value?: number): MicroStep {
  const options = [...new Set([rhs, ...alternatives])].slice(0, 4).map(tex => ({ tex, answer: tex }));
  if (options.length < 3) throw new Error('Too few distinct alternatives');
  return { id: `${q.id}:family:${key}`, prompt, lhs, rhs, stageKind: 'transform', load: 2, complexity: 'multi', skills: [q.skillId], tags: ['strategy'], options: shuffle(options, `${q.id}:${key}`), ...(value === undefined ? {} : { value }) };
}
function numericStage(q: Question, key: string, prompt: string, lhs: string, value: number): MicroStep {
  return stage(q, key, prompt, lhs, num(value), [num(value + 1), num(value - 1), num(-value), num(value + 2)], value);
}
function finalNumber(q: Question, value: number, lhs: string): MicroStep | null {
  const f = fraction(value); if (!f) return null;
  const answer = f[1] === 1 ? String(f[0]) : `${f[0]}/${f[1]}`;
  if (q.format === 'numeric') {
    if (grade(q, answer).correctness !== 'correct') return null;
    const last = numericStage(q, 'answer', 'Jaka jest odpowiedź?', lhs, value);
    return { ...last, rhs: q.answer, finalAnswer: q.answer, stageKind: 'final', options: last.options.map(option => ({ ...option, answer: option.answer === num(value) ? q.answer : option.answer })) };
  }
  return finalChoice(q, lhs, tex => { const n = number(tex); return n !== null && close(n, value); }, value);
}
function finalChoice(q: Question, lhs: string, valid: (tex: string) => boolean, value?: number): MicroStep | null {
  if (q.format !== 'choice' || !q.choices || q.choices.length < 3 || q.choices.length > 4) return null;
  const correct = q.choices.flatMap((choice, index) => valid(choice) ? [index] : []);
  if (correct.length !== 1) return null;
  const rhs = 'ABCD'[correct[0]!]!;
  if (grade(q, rhs).correctness !== 'correct') return null;
  return { id: `${q.id}:family:answer`, prompt: 'Która odpowiedź pasuje?', lhs, rhs, finalAnswer: q.answer, stageKind: 'final', complexity: 'multi', load: 1, skills: [q.skillId],
    options: q.choices.map((tex, i) => ({ tex: !tex.includes('$') && /rozwiąza/.test(tex) ? r`\text{${tex}}` : tex.replace(/^\$|\$$/g, ''), answer: 'ABCD'[i]! })), ...(value === undefined ? {} : { value }) };
}
function finalSet(q: Question, set: RealSet, lhs: string): MicroStep | null {
  if (q.format === 'choice') return finalChoice(q, lhs, tex => { const parsed = parseMathSet(tex); return parsed !== null && sameSet(parsed, set); })
    ?? (set.length === 1 && set[0]!.low === set[0]!.high ? finalNumber(q, set[0]!.low, lhs) : null);
  if (q.format === 'numeric') {
    let value: number;
    if (/ile (?:jest )?liczb całkowitych/i.test(q.prompt)) {
      if (set.some(i => !Number.isFinite(i.low) || !Number.isFinite(i.high))) return null;
      value = set.reduce((n, i) => n + Math.max(0, (i.right ? Math.floor(i.high) : Math.ceil(i.high) - 1) - (i.left ? Math.ceil(i.low) : Math.floor(i.low) + 1) + 1), 0);
    } else if (/najmniejsz\S* liczb\S* całkowit/i.test(q.prompt)) {
      const first = set[0]; if (!first || !Number.isFinite(first.low)) return null;
      value = first.left ? Math.ceil(first.low) : Math.floor(first.low) + 1;
      if (!set.some(i => value >= i.low && value <= i.high && (i.left || value !== i.low) && (i.right || value !== i.high))) return null;
    } else if (set.every(i => i.low === i.high)) {
      const roots = set.map(i => i.low);
      if (/ile rozwiązań/i.test(q.prompt)) value = roots.length;
      else if (/sum[ęa]/i.test(q.prompt)) value = roots.reduce((a, b) => a + b, 0);
      else if (/iloczyn/i.test(q.prompt) && roots.length > 0) value = roots.reduce((a, b) => a * b, 1);
      else if (/większe|największe/i.test(q.prompt) && roots.length > 0) value = Math.max(...roots);
      else if (/mniejsze|najmniejsze/i.test(q.prompt) && roots.length > 0) value = Math.min(...roots);
      else if (roots.length === 1) value = roots[0]!;
      else return null;
    } else return null;
    return finalNumber(q, value, lhs);
  }
  if (q.format !== 'exact-text') return null;
  const candidates = [q.answer, ...q.acceptedVariants];
  const answer = candidates.find(candidate => { const parsed = parseMathSet(candidate); return parsed !== null && sameSet(parsed, set); });
  if (!answer || grade(q, answer).correctness !== 'correct') return null;
  const alternatives = [r`\varnothing`, r`\mathbb{R}`, setTex(set.map(i => ({ ...i, left: !i.left && Number.isFinite(i.low), right: !i.right && Number.isFinite(i.high) }))), r`\{0\}`]
    .filter(tex => { const parsed = parseMathSet(tex); return parsed !== null && !sameSet(parsed, set); });
  const result = stage(q, 'answer', 'Który zbiór jest rozwiązaniem?', lhs, setTex(set), alternatives);
  return { ...result, rhs: q.answer, finalAnswer: q.answer, stageKind: 'final', options: result.options.map(o => ({ ...o, answer: o.answer === setTex(set) ? q.answer : o.answer })) };
}

function absolutePlan(q: Question, formula: string): MicroStep[] | null {
  const match = /^\|([^|]+)\|\s*(<=|>=|<|>|=)\s*(.+)$/.exec(clean(formula)); if (!match) return null;
  const p = parseMathPolynomial(match[1]!); const radius = number(match[3]!); const rel = match[2] as Relation;
  if (!p || p[2] !== 0 || p[1] === 0 || radius === null) return null;
  const a = p[1], b = p[0], inner = affine(a, b), center = -b / a;
  let set: RealSet, condition: string;
  if (radius <= 0) {
    set = radius < 0 ? (rel.startsWith('>') ? all : []) : rel === '>=' ? all : rel === '<' ? []
      : rel === '=' || rel === '<=' ? [point(center)]
      : [{ low: -Infinity, high: center, left: false, right: false }, { low: center, high: Infinity, left: false, right: false }];
    condition = setTex(set);
    const reason = stage(q, 'absolute-sign', 'Który zbiór spełnia ten warunek?', formula, condition,
      [r`\varnothing`, r`\mathbb{R}`, setTex([point(center)]), setTex([{ low: center - 1, high: center + 1, left: true, right: true }])]);
    const last = finalSet(q, set, condition);
    if (!last) return null;
    // Empty/all-real conclusions are the entire decision, not a prelude to
    // choosing the same conclusion again under a different label.
    if (q.format !== 'numeric' || set.length === 0 || sameSet(set, all))
      return [{ ...last, lhs: formula, prompt: q.format === 'numeric' ? 'Ile jest rozwiązań?' : 'Który zbiór spełnia ten warunek?' }];
    return [reason, last];
  }
  const strict = rel === '<' || rel === '>';
  const low = center - radius / Math.abs(a), high = center + radius / Math.abs(a);
  const inside = `${num(-radius)}${strict ? '<' : r`\le `}${inner}${strict ? '<' : r`\le `}${num(radius)}`;
  const outside = r`${inner}${strict ? '<' : r`\le`}${num(-radius)}\;\text{lub}\;${inner}${strict ? '>' : r`\ge`}${num(radius)}`;
  const equalCondition = r`${inner}=${num(-radius)}\;\text{lub}\;${inner}=${num(radius)}`;
  if (rel === '=') { condition = equalCondition; set = close(low, high) ? [point(low)] : [point(low), point(high)]; }
  else if (rel.startsWith('<')) { condition = inside; set = low === high ? strict ? [] : [point(low)] : [{ low, high, left: !strict, right: !strict }]; }
  else { condition = outside; set = [{ low: -Infinity, high: low, left: false, right: !strict }, { low: high, high: Infinity, left: !strict, right: false }]; }
  const first = stage(q, 'remove-absolute', 'Jak zapisać warunek bez modułu?', formula, condition,
    [inside, outside, equalCondition, `${num(-radius - 1)}<${inner}<${num(radius + 1)}`].filter(candidate => candidate !== condition));
  const boundCondition = (lo: number, hi: number) => rel === '=' ? r`x=${num(lo)}\;\text{lub}\;x=${num(hi)}` : rel.startsWith('<')
    ? `${num(lo)}${strict ? '<' : r`\le `}x${strict ? '<' : r`\le `}${num(hi)}`
    : r`x${strict ? '<' : r`\le`}${num(lo)}\;\text{lub}\;x${strict ? '>' : r`\ge`}${num(hi)}`;
  const simplified = boundCondition(low, high);
  const last = finalSet(q, set, simplified);
  if (!last) return null;
  // A unit coefficient only shifts two endpoints. Let that decision be the
  // terminal interval choice instead of asking the same bounds twice.
  if ((Math.abs(a) === 1 && q.format !== 'numeric') || condition === simplified)
    return [first, { ...last, lhs: condition }];
  const second = stage(q, 'isolate-x', 'Jaki warunek otrzymasz dla x?', condition, simplified,
    [boundCondition(low - 1, high + 1), boundCondition(low + 1, high + 1), boundCondition(low - 1, high - 1)]);
  return [first, second, last];
}

function affinePlan(q: Question, formula: string, variable = 'x', prefix: MicroStep[] = []): MicroStep[] | null {
  const parts = clean(formula).split(/(<=|>=|<|>|=)/); if (parts.length !== 3) return null;
  const left = parseMathPolynomial(parts[0]!, variable), right = parseMathPolynomial(parts[2]!, variable), rel = parts[1] as Relation;
  if (!left || !right || left[2] !== 0 || right[2] !== 0) return null;
  const a = left[1] - right[1], target = right[0] - left[0];
  if (close(a, 0)) return null; // identity/contradiction needs a different conceptual plan
  const set = lineSet(a, -target, rel);
  const gathered = `${affine(a, 0, variable)}${texRel(rel)}${num(target)}`;
  const move = stage(q, 'collect', 'Zbierz niewiadomą po jednej stronie.', formula, gathered,
    [`${affine(a, 0, variable)}${texRel(rel)}${num(right[0] + left[0])}`, `${affine(a, 0, variable)}${texRel(reverse(rel))}${num(target + 1)}`, `${affine(a, 0, variable)}${texRel(rel)}${num(target - 1)}`, `${affine(a, 0, variable)}${texRel(rel)}${num(target + 2)}`]);
  const condition = a === 0 ? setTex(set) : `${variable}${texRel(a < 0 ? reverse(rel) : rel)}${num(target / a)}`;
  const divide = stage(q, 'divide', a < 0 && rel !== '=' ? 'Podziel przez współczynnik. Co ze znakiem?' : 'Jaki warunek otrzymasz po podzieleniu?', gathered, condition,
    [`${variable}${texRel(rel)}${num(a === 0 ? 1 : -target / a)}`, `${variable}${texRel(reverse(rel))}${num(a === 0 ? 2 : target / a + 1)}`, `${variable}${texRel(rel)}${num(a === 0 ? 3 : target / a - 1)}`, r`\varnothing`, r`\mathbb{R}`]);
  const last = finalSet(q, set, condition);
  if (!last) return null;
  // Asking x=5 and then 5 repeats the same decision. Use the original graded
  // final choice directly for equations with one requested numeric root.
  const alreadyCollected = clean(formula).replace(/\s/g, '') === clean(gathered).replace(/\s/g, '');
  if (rel === '=' && set.length === 1 && last.value !== undefined && close(last.value, set[0]!.low)) {
    if (a === 1 || alreadyCollected) return [...prefix, { ...last, lhs: formula, prompt: `Ile wynosi ${variable}?` }];
    return [...prefix, move, { ...last, lhs: gathered, prompt: `Ile wynosi ${variable}?` }];
  }
  return [...prefix, ...(alreadyCollected ? [] : [move]), ...(a === 1 ? [] : [divide]), last];
}

function quadraticPlan(q: Question, formula: string): MicroStep[] | null {
  const parts = clean(formula).split('='); if (parts.length !== 2) return null;
  const left = parseMathPolynomial(parts[0]!), right = parseMathPolynomial(parts[1]!);
  if (!left || !right) return null;
  const a = left[2] - right[2], b = left[1] - right[1], c = left[0] - right[0]; if (a === 0) return null;
  const delta = b * b - 4 * a * c;
  const calculation = r`(${num(b)})^2-4\cdot(${num(a)})\cdot(${num(c)})`;
  const substitution = stage(q, 'delta-formula', 'Który zapis oblicza wyróżnik?', formula, calculation,
    [r`(${num(b)})^2+4\cdot(${num(a)})\cdot(${num(c)})`, r`(${num(a)})^2-4\cdot(${num(b)})\cdot(${num(c)})`, r`(${num(c)})^2-4\cdot(${num(a)})\cdot(${num(b)})`, r`(${num(b + 1)})^2-4\cdot(${num(a)})\cdot(${num(c)})`, r`(${num(b)})^2-4\cdot(${num(a)})\cdot(${num(c + 1)})`]
      .filter(candidate => { const n = number(candidate); return n !== null && !close(n, delta); }));
  // Primitive arithmetic has separate evidence tags: mastery of a small square
  // may shorten this calculation, never the choice of the discriminant method.
  const arithmetic = (key: string, prompt: string, lhs: string, value: number, tag: string, simple: boolean): MicroStep => ({
    ...numericStage(q, key, prompt, lhs, value), stageKind: 'arithmetic', load: 1,
    complexity: simple ? 'simple' : 'multi', tags: simple ? ['routine', tag] : ['arithmetic'],
  });
  const small = (n: number) => Number.isInteger(n) && Math.abs(n) <= 12;
  const square = arithmetic('square-b', 'Ile wynosi kwadrat?', r`(${num(b)})^2`, b * b, 'simple-square', small(b));
  const products: MicroStep[] = [];
  // Multiplication by 1 is a substitution detail, not another exercise.
  if (Math.abs(a) !== 1) products.push(arithmetic('four-a', 'Ile wynosi iloczyn?', r`4\cdot(${num(a)})`, 4 * a, 'simple-product', small(a)));
  products.push(arithmetic('four-ac', 'Ile wynosi iloczyn?', r`${num(4 * a)}\cdot(${num(c)})`, 4 * a * c, 'simple-product', small(4 * a) && small(c)));
  const deltaCalculation = `${num(b * b)}-${4 * a * c < 0 ? `(${num(4 * a * c)})` : num(4 * a * c)}`;
  const prefix = [substitution, square, ...products];
  if (/wyróżnik|delt[ęa]/i.test(q.prompt)) {
    const final = finalNumber(q, delta, deltaCalculation);
    return final ? [...prefix, { ...final, prompt: 'Ile wynosi wyróżnik?', tags: ['discriminant'] }] : null;
  }
  const deltaStep = { ...numericStage(q, 'delta', 'Ile wynosi wyróżnik?', deltaCalculation, delta), tags: ['discriminant'] };
  if (/ile rozwiązań|równanie.*ma\s*$/i.test(q.prompt)) {
    const count = delta < 0 ? 0 : delta === 0 ? 1 : 2;
    const final = q.format === 'choice' ? finalChoice(q, r`\Delta=${num(delta)}`, tex => count === 1 ? /^(dokładnie )?jedno rozwiązanie$/.test(tex) : count === 2 ? /^dwa rozwiązania$/.test(tex) : /^(zero rozwiązań|brak rozwiązań)$/.test(tex), count) : finalNumber(q, count, r`\Delta=${num(delta)}`);
    return final ? [...prefix, deltaStep, final] : null;
  }
  if (delta < 0) return null;
  const root = Math.sqrt(delta); if (!fraction(root)) return null;
  const values = [...new Set([(-b - root) / (2 * a), (-b + root) / (2 * a)])].sort((x, y) => x - y);
  const roots = values.map(point);
  const squareRoot = { ...numericStage(q, 'sqrt-delta', 'Ile wynosi pierwiastek?', r`\sqrt{${num(delta)}}`, root), tags: ['roots'] };
  const rootSteps: MicroStep[] = [];
  // Keep the root method visible, but carry each calculated numerator forward.
  // The learner never has to remember two numerators while dividing them.
  for (const [index, sign] of (root === 0 ? [-1] : [-1, 1]).entries()) {
    const numerator = -b + sign * root, value = numerator / (2 * a);
    const numeratorTex = `${num(-b)}${sign < 0 ? '-' : '+'}${num(root)}`;
    const name = root === 0 ? 'x' : `x_${index + 1}`;
    rootSteps.push({ ...numericStage(q, `root-${index + 1}-numerator`, `Ile wynosi licznik ${root === 0 ? 'x' : index === 0 ? 'x₁' : 'x₂'}?`, r`${name}=\frac{${numeratorTex}}{${num(2 * a)}}`, numerator), tags: ['roots'] });
    rootSteps.push({ ...numericStage(q, index === (root === 0 ? 0 : 1) ? 'roots' : 'root-1', `Ile wynosi ${root === 0 ? 'x' : index === 0 ? 'x₁' : 'x₂'}?`, r`${name}=\frac{${num(numerator)}}{${num(2 * a)}}`, value), tags: ['roots'] });
  }
  const last = finalSet(q, roots, setTex(roots));
  if (!last || last.finalAnswer !== q.answer) return null;
  // finalSet independently checked the whole solution set and its graded key.
  // For set answers the final division completes the work; selecting those
  // same roots again adds no mathematical decision. Scalar aggregates still
  // need their own final operation (sum/product/etc.).
  if (last.value === undefined) {
    const terminal = rootSteps.at(-1)!;
    rootSteps[rootSteps.length - 1] = { ...terminal, stageKind: 'final', finalAnswer: q.answer };
    return [...prefix, deltaStep, squareRoot, ...rootSteps];
  }
  return [...prefix, deltaStep, squareRoot, ...rootSteps, last];
}

function functionPlan(q: Question, formulas: string[]): MicroStep[] | null {
  const definition = formulas.map(formula => /^f\(([xk])\)\s*=\s*(.+)$/.exec(clean(formula))).find(Boolean);
  if (!definition) return null;
  const variable = definition[1]!, expression = definition[2]!;
  const poly = parseMathPolynomial(expression, variable);
  const evaluation = /oblicz\s*\$f\(([^()]+)\)\$/i.exec(q.prompt);
  if (poly && evaluation) {
    const x = number(evaluation[1]!); if (x === null) return null;
    const substituted = expression.replace(new RegExp(variable, 'g'), `(${num(x)})`);
    const value = poly[0] + poly[1] * x + poly[2] * x * x;
    const alternatives = [x + 1, x - 1, -x, x + 2].map(wrong => expression.replace(new RegExp(variable, 'g'), `(${num(wrong)})`))
      .filter(tex => { const n = number(tex); return n !== null && !close(n, value); });
    const insert = stage(q, 'substitute', 'Jak podstawisz argument do wzoru?', r`f(${variable})=${expression},\quad ${variable}=${num(x)}`, substituted, alternatives);
    const last = finalNumber(q, value, substituted);
    return last ? [insert, last] : null;
  }
  if (poly && poly[2] === 0 && poly[1] !== 0) {
    let target: number | null = null;
    if (/miejsce zerowe/i.test(q.prompt)) target = 0;
    else {
      const value = /przyjmuje wartość \$([^$]+)\$|zapłacono \$([^$]+)\$/i.exec(q.prompt);
      if (value) target = number(value[1] ?? value[2]!);
    }
    if (target !== null) {
      const equation = `${expression}=${num(target)}`;
      const stage1 = stage(q, 'model', /miejsce zerowe/i.test(q.prompt) ? 'Które równanie wyznacza miejsce zerowe?' : `Które równanie daje wartość ${String(target).replace('.', ',')}?`, formulas.find(f => clean(f).startsWith(`f(${variable})`))!, equation,
        [`${expression}=${num(target + 1)}`, `${expression}=${num(target - 1)}`, `${affine(poly[1], -poly[0], variable)}=${num(target + 2)}`]);
      return affinePlan(q, equation, variable, [stage1]);
    }
  }
  // Unknown slope from one point: f(x)=a*x+b, with literal b and literal coordinates.
  if (!/miejsce zerowe/i.test(q.prompt) || variable !== 'x') return null;
  const symbolic = /^a\s*\*?\s*x\s*([+-].+)?$/.exec(expression); if (!symbolic) return null;
  const intercept = number(symbolic[1] ?? '0');
  const coordinates = /punkt\s*\$\(\s*([^,]+),\s*([^()]+)\)\$/i.exec(q.prompt);
  if (intercept === null || !coordinates) return null;
  const x = number(coordinates[1]!), y = number(coordinates[2]!); if (x === null || x === 0 || y === null) return null;
  const a = (y - intercept) / x; if (a === 0) return null;
  const substitution = `${affine(x, intercept, 'a')}=${num(y)}`;
  const pointStep = stage(q, 'point', 'Podstaw współrzędne punktu.', r`f(x)=${expression},\quad P=(${num(x)},${num(y)})`, substitution,
    [`${affine(y, intercept, 'a')}=${num(x)}`, `${affine(x, -intercept, 'a')}=${num(y)}`, `${affine(x, intercept, 'a')}=${num(y + 1)}`]);
  const slope = numericStage(q, 'slope', 'Ile wynosi współczynnik a?', substitution, a);
  return affinePlan(q, `${affine(a, intercept)}=0`, 'x', [pointStep, slope]);
}

/** Returns null rather than manufacturing steps for an unrecognised question or mismatching answer key. */
export function specializedMathPlan(question: Question): MicroStep[] | null {
  if (question.format === 'code' || question.format === 'multi-step' || question.figure) return null;
  const formulas = [...question.prompt.matchAll(/\$([^$]+)\$/g)].map(m => m[1]!);
  try {
    const fn = functionPlan(question, formulas); if (fn) return fn;
    const relations = formulas.filter(formula => /[=<>]|\\(?:le|ge)|[≤≥]/.test(formula));
    if (relations.length !== 1) return null;
    const formula = relations[0]!;
    if (formula.includes('|')) return absolutePlan(question, formula);
    if (/f\(|y\s*=|\\begin|\\text|\\mathrm/.test(formula)) return null;
    return affinePlan(question, formula) ?? quadraticPlan(question, formula);
  } catch { return null; }
}
