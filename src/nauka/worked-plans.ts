/** Local, exact transformations. Only the operation selected by the learner runs. */
export interface WorkedTransformation {
  tex: string;
  calculation: string;
  explanation: string;
  /** Value of the whole expression, used to audit transformations in tests. */
  value: number;
}
export interface WorkedOperation {
  id: string;
  label: string;
  feedback: string;
}
export interface WorkedStep {
  id: string;
  phase: number;
  prompt: string;
  options: WorkedOperation[];
  correctId: string;
  theory: string;
  apply: () => WorkedTransformation;
}
export interface WorkedPlan {
  id: string;
  revision: number;
  skillId: string;
  title: string;
  initialTex: string;
  phases: string[];
  steps: WorkedStep[];
}

const r = String.raw;
function gcd(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; }
  return Math.abs(a);
}
function fraction(numerator: number, denominator: number): string {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator === 0) throw new Error('Nieprawidłowy ułamek.');
  const divisor = gcd(numerator, denominator);
  const n = (denominator < 0 ? -numerator : numerator) / divisor;
  const d = Math.abs(denominator) / divisor;
  return d === 1 ? String(n) : `\\frac{${n}}{${d}}`;
}

const M1: WorkedPlan = {
  id: 'mat-2209-pp-1', revision: 1, skillId: 'num-order',
  title: 'Oblicz wartość wyrażenia',
  initialTex: r`\left(1+3\cdot2^{-1}\right)^{-2}`,
  phases: ['Potęga w nawiasie', 'Wartość nawiasu', 'Potęga całego nawiasu'],
  steps: [
    {
      id: 'reciprocal', phase: 0, prompt: 'Ile wynosi $2^{-1}$?',
      options: [
        { id: 'multiply-exponent', label: '$-2$', feedback: 'Wykładnik nie jest mnożnikiem podstawy.' },
        { id: 'reciprocal', label: r`$\frac12$`, feedback: '' },
        { id: 'negative-base', label: '$2$', feedback: 'Ujemny wykładnik oznacza odwrotność podstawy.' },
        { id: 'negative-reciprocal', label: r`$-\frac12$`, feedback: 'Potęga dodatniej liczby pozostaje dodatnia.' },
      ],
      correctId: 'reciprocal',
      theory: r`Dla $a\ne0$: $a^{-1}=\frac1a$. Minus w wykładniku oznacza odwrotność, a nie liczbę przeciwną.`,
      apply: () => ({
        tex: `\\left(1+3\\cdot${fraction(1, 2)}\\right)^{-2}`,
        calculation: `2^{-1}=${fraction(1, 2)}`,
        explanation: 'Obliczyliśmy potęgę w nawiasie. Reszta wyrażenia zostaje na swoim miejscu.',
        value: (1 + 3 * (1 / 2)) ** -2,
      }),
    },
    {
      id: 'product', phase: 1, prompt: r`Ile wynosi $3\cdot\frac12$?`,
      options: [
        { id: 'add-first', label: '$2$', feedback: 'Dodawanie przed mnożeniem zmieniłoby nawias. Najpierw obliczamy samo mnożenie.' },
        { id: 'outer-first', label: r`$\frac16$`, feedback: 'Liczbę całkowitą mnożymy przez licznik, nie przez mianownik.' },
        { id: 'multiply', label: r`$\frac32$`, feedback: '' },
        { id: 'halve-again', label: r`$\frac34$`, feedback: 'Połowę bierzemy tylko raz.' },
      ],
      correctId: 'multiply',
      theory: 'W nawiasie potęgowanie wykonujemy przed mnożeniem, a mnożenie przed dodawaniem. Obliczoną część zastępujemy jej wartością.',
      apply: () => {
        const numerator = 3 * 1;
        return {
          tex: `\\left(1+${fraction(numerator, 2)}\\right)^{-2}`,
          calculation: `3\\cdot${fraction(1, 2)}=${fraction(numerator, 2)}`,
          explanation: 'Iloczyn zastępuje tylko mnożenie. Jedynka i potęga całego nawiasu pozostają.',
          value: (1 + numerator / 2) ** -2,
        };
      },
    },
    {
      id: 'sum', phase: 1, prompt: r`Ile wynosi $1+\frac32$?`,
      options: [
        { id: 'common-denominator', label: r`$\frac52$`, feedback: '' },
        { id: 'numerator-only', label: r`$\frac42$`, feedback: 'Zwiększenie licznika o jeden dodaje tylko połowę, a nie całą jedynkę.' },
        { id: 'both', label: r`$\frac43$`, feedback: 'Przy dodawaniu ułamków nie dodajemy mianowników.' },
        { id: 'ignore-one', label: r`$\frac32$`, feedback: 'Do ułamka trzeba jeszcze dodać jedynkę.' },
      ],
      correctId: 'common-denominator',
      theory: r`Przy dodawaniu ułamków potrzebujemy wspólnego mianownika: $\frac ab+\frac cb=\frac{a+c}{b}$. Całość można zapisać jako $1=\frac bb$.`,
      apply: () => {
        const numerator = 1 * 2 + 3;
        return {
          tex: `\\left(${fraction(numerator, 2)}\\right)^{-2}`,
          calculation: `1+${fraction(3, 2)}=\\frac{2}{2}+${fraction(3, 2)}=${fraction(numerator, 2)}`,
          explanation: 'Cały nawias ma już jedną wartość. Pozostała potęga zapisana na zewnątrz.',
          value: (numerator / 2) ** -2,
        };
      },
    },
    {
      id: 'outer-power', phase: 2, prompt: 'Jaki jest wynik całego wyrażenia?',
      options: [
        { id: 'negative-square', label: r`$-\frac4{25}$`, feedback: 'Minus w wykładniku nie zmienia wyniku na ujemny.' },
        { id: 'reciprocal-square', label: r`$\frac4{25}$`, feedback: '' },
        { id: 'multiply-minus-two', label: r`$\frac25$`, feedback: 'Po odwróceniu ułamka trzeba jeszcze podnieść go do kwadratu.' },
        { id: 'positive-square', label: r`$\frac{25}4$`, feedback: 'Ujemny wykładnik oznacza potęgowanie odwrotności.' },
      ],
      correctId: 'reciprocal-square',
      theory: r`Dla $a,b\ne0$: $\left(\frac ab\right)^{-2}=\left(\frac ba\right)^2=\frac{b^2}{a^2}$. Do potęgi podnosimy oba elementy ułamka.`,
      apply: () => {
        const numerator = 2 ** 2;
        const denominator = (1 * 2 + 3) ** 2;
        return {
          tex: fraction(numerator, denominator),
          calculation: `\\left(${fraction(5, 2)}\\right)^{-2}=\\left(${fraction(2, 5)}\\right)^2=${fraction(numerator, denominator)}`,
          explanation: 'Wszystkie działania wykonane. Ten ułamek jest wynikiem całego wyrażenia.',
          value: numerator / denominator,
        };
      },
    },
  ],
};

const M2: WorkedPlan = {
  id: 'mat-2405-pp-2', revision: 1, skillId: 'num-powers',
  title: 'Uprość iloczyn potęg',
  initialTex: r`\left(\frac1{16}\right)^8\cdot8^{16}`,
  phases: ['Wspólna podstawa', 'Potęgi potęg', 'Iloczyn potęg'],
  steps: [
    {
      id: 'common-base', phase: 0, prompt: r`Zapisz $\frac1{16}$ i $8$ jako potęgi dwójki.`,
      options: [
        { id: 'positive-reciprocal', label: '$2^4$, $2^3$', feedback: 'Pierwsza liczba jest mniejsza od jedności, więc potrzebuje ujemnego wykładnika.' },
        { id: 'reversed-signs', label: '$2^4$, $2^{-3}$', feedback: 'Pierwsza liczba jest mniejsza od jedności, druga większa. Sprawdź znaki wykładników.' },
        { id: 'powers-of-two', label: '$2^{-4}$, $2^3$', feedback: '' },
        { id: 'both-negative', label: '$2^{-4}$, $2^{-3}$', feedback: 'Druga liczba jest większa od jedności, więc potrzebuje dodatniego wykładnika.' },
      ],
      correctId: 'powers-of-two',
      theory: r`Szukamy liczby czynników $2$ w podstawach. Odwrotność zapisujemy jako potęgę z ujemnym wykładnikiem: $\frac1{a^m}=a^{-m}$.`,
      apply: () => {
        const leftExponent = -Math.log2(16);
        const rightExponent = Math.log2(8);
        return {
          tex: `\\left(2^{${leftExponent}}\\right)^8\\cdot\\left(2^{${rightExponent}}\\right)^{16}`,
          calculation: `\\frac1{16}=2^{${leftExponent}},\\qquad8=2^{${rightExponent}}`,
          explanation: 'Zmieniliśmy zapis obu podstaw. Zewnętrzne wykładniki nadal dotyczą całych potęg w nawiasach.',
          value: (2 ** leftExponent) ** 8 * (2 ** rightExponent) ** 16,
        };
      },
    },
    {
      id: 'powers-of-powers', phase: 1, prompt: 'Jaki zapis otrzymasz bez nawiasów?',
      options: [
        { id: 'multiply-exponents', label: r`$2^{-32}\cdot2^{48}$`, feedback: '' },
        { id: 'add-exponents', label: r`$2^4\cdot2^{19}$`, feedback: 'W potędze potęgi mnożymy wykładniki, zamiast je dodawać.' },
        { id: 'subtract-exponents', label: r`$2^{-12}\cdot2^{-13}$`, feedback: 'W potędze potęgi mnożymy wykładniki, zamiast je odejmować.' },
        { id: 'lost-negative', label: r`$2^{32}\cdot2^{48}$`, feedback: 'Ujemny wykładnik pomnożony przez dodatni pozostaje ujemny.' },
      ],
      correctId: 'multiply-exponents',
      theory: r`Potęga potęgi: $(a^m)^n=a^{m\cdot n}$. To inna sytuacja niż iloczyn dwóch potęg. Znaki wykładników pozostają częścią rachunku.`,
      apply: () => {
        const left = -4 * 8;
        const right = 3 * 16;
        return {
          tex: `2^{${left}}\\cdot2^{${right}}`,
          calculation: `(-4)\\cdot8=${left},\\qquad3\\cdot16=${right}`,
          explanation: 'Każdy nawias uprościliśmy regułą potęgi potęgi. Teraz mamy iloczyn potęg o tej samej podstawie.',
          value: 2 ** left * 2 ** right,
        };
      },
    },
    {
      id: 'combine', phase: 2, prompt: 'Która potęga jest wynikiem?',
      options: [
        { id: 'multiply-exponents', label: '$2^{-1536}$', feedback: 'Przy mnożeniu potęg dodajemy wykładniki, zamiast je mnożyć.' },
        { id: 'add-exponents', label: '$2^{16}$', feedback: '' },
        { id: 'subtract-exponents', label: '$2^{-80}$', feedback: 'Odejmowanie wykładników odpowiada dzieleniu potęg.' },
        { id: 'lost-negative', label: '$2^{80}$', feedback: 'Dodajemy wykładniki ze znakami: pierwszy jest ujemny.' },
      ],
      correctId: 'add-exponents',
      theory: r`Iloczyn potęg o tej samej podstawie: $a^m\cdot a^n=a^{m+n}$. Podstawa nie zmienia się. Wykładnik ujemny dodajemy ze znakiem.`,
      apply: () => {
        const exponent = -4 * 8 + 3 * 16;
        return {
          tex: `2^{${exponent}}`,
          calculation: `2^{-32}\\cdot2^{48}=2^{-32+48}=2^{${exponent}}`,
          explanation: 'Wynik jest jedną potęgą dwójki. Nie trzeba zamieniać jej na dużą liczbę dziesiętną.',
          value: 2 ** exponent,
        };
      },
    },
  ],
};

// Stable per-step order survives resume, without a repeating correct-position pattern.
function optionOrder(stepId: string, optionId: string): number {
  let hash = 2166136261;
  for (const char of `${stepId}:${optionId}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}
const PLANS = [M1, M2].map(plan => ({ ...plan, steps: plan.steps.map(step => ({
  ...step, options: [...step.options].sort((a, b) => optionOrder(step.id, a.id) - optionOrder(step.id, b.id)),
})) }));
export function getWorkedPlan(taskId: string): WorkedPlan | null {
  return PLANS.find(plan => plan.id === taskId) ?? null;
}

export interface WorkedHistoryEntry extends WorkedTransformation { stepId: string; operation: string }
export interface WorkedDraft {
  planId: string;
  revision: number;
  history: WorkedHistoryEntry[];
  viewIndex: number;
  mistakes: number;
  assisted: boolean;
  submitted: boolean;
  theoryOpen: boolean;
  feedback: { kind: 'correct' | 'incorrect'; text: string } | null;
}
export interface WorkedResult { poprawna: boolean; tekst: string; assisted: boolean }

export function freshWorkedDraft(plan: WorkedPlan, completedSteps = 0, completed = false): WorkedDraft {
  const count = completed ? plan.steps.length : Math.max(0, Math.min(plan.steps.length, Number.isInteger(completedSteps) ? completedSteps : 0));
  const history = plan.steps.slice(0, count).map(step => ({ ...step.apply(), stepId: step.id, operation: step.options.find(o => o.id === step.correctId)!.label }));
  return { planId: plan.id, revision: plan.revision, history, viewIndex: history.length, mistakes: 0, assisted: count > 0, submitted: completed, theoryOpen: false, feedback: null };
}
export function isWorkedDraft(value: unknown): value is WorkedDraft {
  if (!value || typeof value !== 'object') return false;
  const d = value as WorkedDraft;
  return typeof d.planId === 'string' && Number.isInteger(d.revision) && Array.isArray(d.history) && d.history.length <= 20
    && d.history.every(h => h && typeof h.stepId === 'string' && typeof h.operation === 'string' && typeof h.tex === 'string'
      && typeof h.calculation === 'string' && typeof h.explanation === 'string' && Number.isFinite(h.value))
    && Number.isInteger(d.viewIndex) && d.viewIndex >= 0 && d.viewIndex <= d.history.length
    && Number.isInteger(d.mistakes) && d.mistakes >= 0 && typeof d.assisted === 'boolean' && typeof d.submitted === 'boolean'
    && typeof d.theoryOpen === 'boolean' && (d.feedback === null || (!!d.feedback && typeof d.feedback.text === 'string'
      && ['correct', 'incorrect'].includes(d.feedback.kind)));
}
export function resumeWorkedDraft(saved: WorkedDraft | null, plan: WorkedPlan): WorkedDraft {
  if (!saved || saved.planId !== plan.id || saved.revision !== plan.revision || saved.history.length > plan.steps.length
    || saved.history.some((h, i) => h.stepId !== plan.steps[i]?.id)
    || (saved.submitted && saved.history.length !== plan.steps.length)) return freshWorkedDraft(plan);
  return saved;
}

/** Selecting an operation is the answer; never add a second “check” confirmation. */
export function chooseWorkedOperation(plan: WorkedPlan, draft: WorkedDraft, stepId: string, operationId: string): { draft: WorkedDraft; result: WorkedResult | null } {
  const step = plan.steps[draft.history.length];
  if (draft.submitted || draft.viewIndex !== draft.history.length || !step || step.id !== stepId) return { draft, result: null };
  const operation = step.options.find(o => o.id === operationId);
  if (!operation) return { draft, result: null };
  if (operation.id !== step.correctId) return {
    draft: { ...draft, mistakes: draft.mistakes + 1, assisted: true, feedback: { kind: 'incorrect', text: operation.feedback } }, result: null,
  };
  const transformed = step.apply();
  const history = [...draft.history, { ...transformed, stepId, operation: operation.label }];
  const next: WorkedDraft = {
    ...draft, history, viewIndex: history.length, theoryOpen: false,
    feedback: { kind: 'correct', text: transformed.explanation },
  };
  return history.length === plan.steps.length ? finishWorkedCalculation(plan, next) : { draft: next, result: null };
}

/** Also used to acknowledge a fully completed migration without redoing any sums. */
export function finishWorkedCalculation(plan: WorkedPlan, draft: WorkedDraft): { draft: WorkedDraft; result: WorkedResult | null } {
  if (draft.submitted || draft.history.length !== plan.steps.length) return { draft, result: null };
  return { draft: { ...draft, submitted: true }, result: {
    poprawna: true,
    tekst: [plan.initialTex, ...draft.history.map(h => `${h.operation}: ${h.calculation}`), `Wynik: ${draft.history.at(-1)!.tex}`].join('\n'),
    assisted: draft.assisted,
  } };
}

/** History navigation never changes answers, advances the task or submits again. */
export function viewWorkedHistory(draft: WorkedDraft, index: number): WorkedDraft {
  if (!Number.isInteger(index) || index < 0 || index > draft.history.length) return draft;
  return { ...draft, viewIndex: index, theoryOpen: false };
}
export function revealWorkedTheory(draft: WorkedDraft): WorkedDraft {
  return { ...draft, assisted: true, theoryOpen: true };
}
