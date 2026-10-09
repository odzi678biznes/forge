import { describe, expect, it } from 'vitest';
import katex from 'katex';
import type { Question } from '@/data/types';
import { grade } from '@/learning-engine/grading';
import { MATH_CORPUS } from '../../../content/math';
import { parseMathPolynomial, parseMathSet, specializedMathPlan } from './math-specialized-plans';
import { scaffoldingOmissions } from './math-scaffolding-policy';
const r = String.raw;
const question = (prompt: string, answer: string, choices?: string[]): Question => ({
  id: 'custom-equation', skillId: 'num-abs', prompt, answer, format: choices ? 'choice' : 'exact-text', ...(choices ? { choices } : {}),
  kind: 'typical', difficulty: 2, acceptedVariants: [], solution: 'Nie używaj rozwiązania do zgadywania etapów.', hints: [], commonErrors: [], source: 'test', verified: true,
});
const find = (id: string) => MATH_CORPUS.questions.find(q => q.id === id)!;
function satisfies(condition: string, x: number): boolean {
  const set = parseMathSet(condition);
  if (set) return set.some(i => x >= i.low && x <= i.high && (i.left || x !== i.low) && (i.right || x !== i.high));
  return condition.split(/\\;\\text\{lub\}\\;/).some(part => {
    const pieces = part.replace(/\\le/g, '<=').replace(/\\ge/g, '>=').split(/(<=|>=|<|>|=)/);
    if (pieces.length < 3) throw new Error(`Unsupported condition: ${condition}`);
    const value = (tex: string) => { const p = parseMathPolynomial(tex)!; if (!p) throw new Error(tex); return p[0] + p[1] * x + p[2] * x * x; };
    for (let i = 1; i < pieces.length; i += 2) {
      const a = value(pieces[i - 1]!), b = value(pieces[i + 1]!);
      const difference = Math.abs(a - b) < 1e-9 ? 0 : a - b;
      const valid = pieces[i] === '<' ? difference < 0 : pieces[i] === '<=' ? difference <= 0 : pieces[i] === '>' ? difference > 0 : pieces[i] === '>=' ? difference >= 0 : difference === 0;
      if (!valid) return false;
    }
    return true;
  });
}
describe('wyspecjalizowane etapy matematyczne', () => {
  it('kończy pełny zbiór ostatnim dzieleniem, ale sprawdza cały zbiór i kanoniczny klucz', () => {
    const correct = r`\{1\}\cup\{5\}`;
    const variants = [question('Rozwiąż $x^2-6x+5=0$.', correct),
      question('Rozwiąż $x^2-6x+5=0$.', 'B', [r`\{1\}\cup\{4\}`, correct, r`\{2\}\cup\{5\}`, r`\{5\}`])];
    for (const q of variants) {
      const plan = specializedMathPlan(q)!;
      expect(plan).not.toBeNull();
      const last = plan.at(-1)!;
      expect(last).toMatchObject({ id: `${q.id}:family:roots`, lhs: r`x_2=\frac{10}{2}`, rhs: '5', value: 5, stageKind: 'final', finalAnswer: q.answer });
      expect(last.options.filter(option => option.answer === last.rhs)).toHaveLength(1);
      expect(plan.some(step => step.id.endsWith(':answer'))).toBe(false);
      expect(grade(q, last.finalAnswer!).correctness).toBe('correct');
      // An answer key that only agrees with x₂ is insufficient.
      expect(specializedMathPlan({ ...q, answer: q.format === 'choice' ? 'D' : r`\{5\}` })).toBeNull();
    }
  });
  it('delta nie wymaga przechowywania kwadratu i iloczynu w pamięci', () => {
    const q = find('q-disc-1'), plan = specializedMathPlan(q)!;
    expect(plan.map(step => step.id.split(':').at(-1))).toEqual(['delta-formula', 'square-b', 'four-ac', 'answer']);
    expect(plan[1]).toMatchObject({ lhs: '(-6)^2', rhs: '36', stageKind: 'arithmetic', load: 1, complexity: 'simple', tags: ['routine', 'simple-square'] });
    expect(plan[2]).toMatchObject({ lhs: r`4\cdot(5)`, rhs: '20', stageKind: 'arithmetic', load: 1, complexity: 'simple', tags: ['routine', 'simple-product'] });
    expect(plan[3]).toMatchObject({ lhs: '36-20', rhs: q.answer, stageKind: 'final', finalAnswer: q.answer, tags: ['discriminant'] });
    const evidence = { skillId: q.skillId, attempts: [], stageAnswers: {}, completed: [], stepEvidence: [1, 2, 3].map(at => ({ questionId: `prior-${at}`, at, correct: true, assisted: false, tags: ['simple-square', 'simple-product'] })) };
    expect(scaffoldingOmissions(plan, evidence)).toEqual([plan[1]!.id, plan[2]!.id]);
    expect(scaffoldingOmissions(plan, { ...evidence, stepEvidence: [] })).toEqual([]);
  });
  it('oddziela oba mnożenia w 4ac i chroni trudną arytmetykę przed pomijaniem', () => {
    const q = { ...question('Oblicz wyróżnik równania $2x^2-20x-3=0$.', '424'), format: 'numeric' as const };
    const plan = specializedMathPlan(q)!;
    expect(plan.map(step => step.id.split(':').at(-1))).toEqual(['delta-formula', 'square-b', 'four-a', 'four-ac', 'answer']);
    expect(plan[1]).toMatchObject({ rhs: '400', complexity: 'multi', tags: ['arithmetic'] });
    expect(plan[2]).toMatchObject({ lhs: r`4\cdot(2)`, rhs: '8' });
    expect(plan[3]).toMatchObject({ lhs: r`8\cdot(-3)`, rhs: '-24' });
    expect(plan[4]).toMatchObject({ lhs: '400-(-24)', rhs: '424' });
  });
  it.each([
    ['x^2-6x+5=0', '6'], ['2x^2-6x+4=0', '3'], ['-x^2+6x-5=0', '6'], ['x^2-4x+4=0', '2'],
  ])('każdy pierwiastek %s korzysta z gotowego licznika i pierwiastka delty', (formula, answer) => {
    const q = { ...question(`Oblicz sumę rozwiązań równania $${formula}$.`, answer), format: 'numeric' as const };
    const plan = specializedMathPlan(q)!;
    expect(plan).not.toBeNull();
    const squareRootAt = plan.findIndex(step => step.id.endsWith(':sqrt-delta'));
    expect(squareRootAt).toBeGreaterThan(0);
    const rootStages = plan.slice(squareRootAt + 1, -1);
    expect(rootStages.length).toBe(formula.includes('4x+4') ? 2 : 4);
    for (const [index, step] of rootStages.entries()) {
      expect(step.lhs).not.toContain('sqrt');
      expect(step.tags).toEqual(['roots']);
      const numerator = /\\frac\{([^{}]+)\}\{([^{}]+)\}/.exec(step.lhs)!;
      expect(numerator).not.toBeNull();
      const calculated = parseMathPolynomial(index % 2 === 0 ? numerator[1]! : r`\frac{${numerator[1]}}{${numerator[2]}}`)![0];
      expect(step.value).toBeCloseTo(calculated, 10);
      if (index % 2 === 1) expect(numerator[1]).toMatch(/^-?\d+$/);
      expect(step.options.filter(option => parseMathPolynomial(option.tex)?.[0] === step.value)).toHaveLength(1);
    }
    expect(plan.at(-2)!.id).toBe(`${q.id}:family:roots`);
    expect(plan.at(-1)!.finalAnswer).toBe(answer);
    expect(grade(q, plan.at(-1)!.rhs).correctness).toBe('correct');
  });
  it('dla różnych środków, znaków współczynnika i operatorów każdy etap modułu zachowuje zbiór rozwiązań', () => {
    for (const a of [-2, -1, 1, 3]) for (const b of [-6, 0, 4]) for (const relation of ['<', '<=', '>', '>=']) {
      const radius = 6, lo = (-b - radius) / a, hi = (-b + radius) / a;
      const low = Math.min(lo, hi), high = Math.max(lo, hi), closed = relation.includes('=');
      const tex = (n: number) => Number.isInteger(n) ? `${n}` : `${n}`;
      const expected = relation.startsWith('<') ? `${closed ? '[' : '('}${tex(low)},${tex(high)}${closed ? ']' : ')'}`
        : `(-\\infty,${tex(low)}${closed ? ']' : ')'}\\cup${closed ? '[' : '('}${tex(high)},+\\infty)`;
      const q = question(`Rozwiąż $|${a}x${b < 0 ? b : '+' + b}|${relation}6$.`, expected);
      const plan = specializedMathPlan(q)!; expect(plan, q.prompt).not.toBeNull();
      const samples = [low - 1, low - .01, low, low + .01, (low + high) / 2, high - .01, high, high + .01, high + 1];
      for (const stage of plan.slice(0, -1)) {
        const matches = (condition: string) => samples.every(x => {
          const v = Math.abs(a * x + b), difference = Math.abs(v - radius) < 1e-9 ? 0 : v - radius;
          const truth = relation === '<' ? difference < 0 : relation === '<=' ? difference <= 0 : relation === '>' ? difference > 0 : difference >= 0;
          return satisfies(condition, x) === truth;
        });
        expect(matches(stage.rhs), stage.rhs).toBe(true);
        expect(stage.options.filter(option => matches(option.tex)), stage.id).toHaveLength(1);
      }
    }
  });
  it('parsuje strukturę wielomianu, nawiasy i ułamki; odrzuca zmienne mianowniki i nieznane symbole', () => {
    const fractional = parseMathPolynomial(r`\frac{x-1}{2}-\frac{x+1}{3}`)!;
    expect(fractional[0]).toBeCloseTo(-5 / 6, 14);
    expect(fractional[1]).toBeCloseTo(1 / 6, 14);
    expect(fractional[2]).toBe(0);
    expect(parseMathPolynomial('2(x+3)-4x+2')).toEqual([8, -2, 0]);
    expect(parseMathPolynomial('(x-2)^2')).toEqual([4, -4, 1]);
    expect(parseMathPolynomial(r`\frac1x`)).toBeNull();
    expect(parseMathPolynomial('x^3')).toBeNull();
    expect(parseMathPolynomial('m*x+2')).toBeNull();
    expect(parseMathPolynomial('sin(x)')).toBeNull();
  });
  it('rozróżnia końce otwarte/domknięte, ułamki, sumy przedziałów i zbiory jednoelementowe', () => {
    expect(parseMathSet(r`$\langle -3,7\rangle$`)).toEqual([{ low: -3, high: 7, left: true, right: true }]);
    expect(parseMathSet(r`$(-\infty,\frac12)\cup\langle 3,+\infty)$`)).toEqual([
      { low: -Infinity, high: .5, left: false, right: false }, { low: 3, high: Infinity, left: true, right: false },
    ]);
    expect(parseMathSet(r`\{2\}`)).toEqual([{ low: 2, high: 2, left: true, right: true }]);
    expect(parseMathSet(r`[-\infty,3)`)).toBeNull();
  });
  it('zadanie z modułem wybiera prawdziwy warunek i przesuwa oba końce, a nie odgaduje literę', () => {
    const q = find('n-abs-3'), plan = specializedMathPlan(q)!;
    expect(plan).not.toBeNull();
    expect(plan[0]!.rhs).toBe('-5<x-2<5');
    expect(plan).toHaveLength(2);
    expect(plan[1]!.lhs).toBe('-5<x-2<5');
    const correctInterval = plan[1]!.options.find(option => option.answer === plan[1]!.rhs)!;
    expect(parseMathSet(correctInterval.tex)).toEqual([{ low: -3, high: 7, left: false, right: false }]);
    expect(plan.at(-1)!.rhs).toBe(q.answer);
    expect(plan.at(-1)!.finalAnswer).toBe(q.answer);
    expect(specializedMathPlan({ ...q, answer: q.answer === 'A' ? 'B' : 'A', acceptedVariants: [] })).toBeNull();
  });
  it('liczba etapów odpowiada rachunkom, a zbiory puste i rzeczywiste nie są pytane dwukrotnie', () => {
    const simple = question(r`Rozwiąż $|x-2|<5$.`, '(-3,7)');
    expect(specializedMathPlan(simple)).toHaveLength(2);
    const nonunit = question(r`Rozwiąż $|3x+6|\ge9$.`, r`(-\infty,-5]\cup[1,+\infty)`);
    const three = specializedMathPlan(nonunit)!;
    expect(three).toHaveLength(3);
    expect(three[1]!.id).toContain('isolate-x');
    for (const [formula, answer] of [[r`|x-2|<-1`, r`\varnothing`], [r`|x-2|\ge-1`, r`\mathbb{R}`], [r`|x-2|<0`, r`\varnothing`], [r`|x-2|\ge0`, r`\mathbb{R}`]]) {
      const plan = specializedMathPlan(question(`Rozwiąż $${formula}$.`, answer!))!;
      expect(plan).toHaveLength(1);
      expect(plan[0]!.stageKind).toBe('final');
      expect(plan[0]!.lhs).toBe(formula);
    }
    expect(specializedMathPlan(find('n-abs-2'))).toHaveLength(2); // already -3≤x≤3, then count
  });
  it('nie każe powtórzyć x=5 jako 5, ale zachowuje metodę miejsca zerowego i delty', () => {
    const q = { ...question('Rozwiąż $x+2=7$.', '5'), format: 'numeric' as const };
    const plan = specializedMathPlan(q)!;
    expect(plan).toHaveLength(1);
    expect(plan[0]!.lhs).toBe('x+2=7');
    expect(plan[0]!.finalAnswer).toBe('5');
    const division = specializedMathPlan({ ...q, prompt: 'Rozwiąż $3x=15$.' })!;
    expect(division).toHaveLength(1);
    expect(division[0]!.lhs).toBe('3x=15');
    expect(specializedMathPlan(find('q-disc-1'))![0]!.id).toContain('delta-formula');
    expect(specializedMathPlan(find('l-for-2'))![0]!.id).toContain('model');
  });
  it.each([
    [r`|x-2|<5`, '(-3,7)'], [r`|x-2|\le5`, '[-3,7]'],
    [r`|x-2|>5`, r`(-\infty,-3)\cup(7,+\infty)`], [r`|x-2|\ge5`, r`(-\infty,-3]\cup[7,+\infty)`],
    [r`|x-2|<0`, r`\varnothing`], [r`|x-2|\le0`, r`\{2\}`],
    [r`|x-2|>0`, r`(-\infty,2)\cup(2,+\infty)`], [r`|x-2|\ge0`, r`\mathbb{R}`],
    [r`|x-2|<-1`, r`\varnothing`], [r`|x-2|\le-1`, r`\varnothing`],
    [r`|x-2|>-1`, r`\mathbb{R}`], [r`|x-2|\ge-1`, r`\mathbb{R}`],
    [r`|-2x+4|<6`, '(-1,5)'], [r`|3x+6|\ge9`, r`(-\infty,-5]\cup[1,+\infty)`],
    [r`|x-2|=0`, r`\{2\}`], [r`|x-2|=-1`, r`\varnothing`],
  ])('obsługuje rzeczywiste parametry i przypadki graniczne %s', (formula, answer) => {
    const q = question(`Rozwiąż $${formula}$.`, answer);
    const plan = specializedMathPlan(q);
    expect(plan, formula).not.toBeNull();
    expect(plan!.at(-1)!.rhs).toBe(answer);
    expect(grade(q, plan!.at(-1)!.rhs).correctness).toBe('correct');
    for (const step of plan!) expect(step.options.filter(o => o.answer === step.rhs)).toHaveLength(1);
  });
  it.each(['e-lin-1', 'e-lin-2', 'e-lin-3', 'e-lin-4', 'e-ineq-3', 'e-ineq-5', 'e-ineq-6', 'q-disc-1', 'k-dis-5', 'k-dis-6', 'l-for-2', 'l-for-5', 'l-for-6', 'f-bas-1', 'f-bas-4', 'f-bas-7', 'n-abs-2', 'n-abs-4', 'e-abs-1', 'e-abs-2'])('buduje zgodny z grade plan prawdziwego zadania %s', id => {
    const q = find(id); expect(q, id).toBeDefined();
    const plan = specializedMathPlan(q);
    expect(plan, id).not.toBeNull();
    expect(plan!.at(-1)!.finalAnswer).toBe(q.answer);
    expect(grade(q, plan!.at(-1)!.rhs).correctness).toBe('correct');
  });
  it('ujemny współczynnik odwraca znak; ułamki są obliczane po obu stronach', () => {
    const q = question(r`Rozwiąż $-3x+2\ge11$.`, r`(-\infty,-3]`);
    const plan = specializedMathPlan(q)!;
    expect(plan[0]!.rhs).toBe(r`-3x\ge9`);
    expect(plan[1]!.rhs).toBe(r`x\le-3`);
  });
  it('żaden wspierany plan całego korpusu nie ma niepoprawnego finału ani zepsutego TeX', () => {
    let covered = 0;
    for (const q of MATH_CORPUS.questions) {
      const plan = specializedMathPlan(q); if (!plan) continue; covered++;
      expect(grade(q, plan.at(-1)!.rhs).correctness, q.id).toBe('correct');
      expect(plan.at(-1)!.finalAnswer, q.id).toBe(q.answer);
      for (const step of plan) {
        expect(step.options.length, step.id).toBeGreaterThanOrEqual(3);
        expect(step.options.length, step.id).toBeLessThanOrEqual(4);
        expect(step.options.filter(o => o.answer === step.rhs), step.id).toHaveLength(1);
        for (const option of step.options) expect(() => katex.renderToString(option.tex, { throwOnError: true }), `${step.id}: ${option.tex}`).not.toThrow();
      }
    }
    expect(covered).toBeGreaterThanOrEqual(18);
  });
  it('nie dorabia etapów do nierozpoznanych problemów i nie ufa zmienionemu kluczowi', () => {
    expect(specializedMathPlan(question(r`Rozwiąż $|x-1|+|x+2|=5$.`, '2'))).toBeNull();
    expect(specializedMathPlan(question(r`Dla jakiego m równanie $mx=3$ ma rozwiązanie?`, '3'))).toBeNull();
    expect(specializedMathPlan({ ...find('f-bas-7'), answer: '1000', acceptedVariants: [] })).toBeNull();
  });
});
