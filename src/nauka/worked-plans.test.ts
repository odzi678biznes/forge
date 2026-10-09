import { describe, expect, it, vi } from 'vitest';
import {
  chooseWorkedOperation, finishWorkedCalculation, freshWorkedDraft, getWorkedPlan,
  isWorkedDraft, resumeWorkedDraft, revealWorkedTheory, viewWorkedHistory,
  type WorkedDraft, type WorkedPlan,
} from './worked-plans';

const M1 = getWorkedPlan('mat-2209-pp-1')!;
const M2 = getWorkedPlan('mat-2405-pp-2')!;
function solve(plan: WorkedPlan, initial = freshWorkedDraft(plan)) {
  let draft = initial;
  const results = [];
  for (const step of plan.steps.slice(draft.history.length)) {
    const next = chooseWorkedOperation(plan, draft, step.id, step.correctId);
    draft = next.draft;
    if (next.result) results.push(next.result);
  }
  return { draft, results };
}

describe('realne przekształcenia wzoru', () => {
  it('każdy krok ma cztery różne krótkie odpowiedzi matematyczne i jedno poprawne przekształcenie', () => {
    for (const plan of [M1, M2]) for (const step of plan.steps) {
      expect(step.options).toHaveLength(4);
      expect(new Set(step.options.map(option => option.label)).size).toBe(4);
      expect(step.options.filter(option => option.id === step.correctId)).toHaveLength(1);
      expect(step.options.every(option => option.label.startsWith('$') && option.label.endsWith('$'))).toBe(true);
      expect(step.options.every(option => option.label.length < 35)).toBe(true);
    }
    expect(M1.steps.map(step => step.id)).toEqual(['reciprocal', 'product', 'sum', 'outer-power']);
    expect(M2.steps.map(step => step.id)).toEqual(['common-base', 'powers-of-powers', 'combine']);
  });
  it('M1 ma cztery operacje w trzech fazach, a każdy cały wzór zachowuje wartość', () => {
    expect(M1.steps).toHaveLength(4);
    expect(M1.phases).toHaveLength(3);
    const { draft, results } = solve(M1);
    expect(draft.history.map(h => h.tex)).toEqual([
      '\\left(1+3\\cdot\\frac{1}{2}\\right)^{-2}',
      '\\left(1+\\frac{3}{2}\\right)^{-2}',
      '\\left(\\frac{5}{2}\\right)^{-2}',
      '\\frac{4}{25}',
    ]);
    for (const entry of draft.history) expect(entry.value).toBeCloseTo((1 + 3 * 2 ** -1) ** -2, 14);
    expect(draft.history[2]?.calculation).toContain('\\frac{2}{2}');
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ poprawna: true, assisted: false });
    expect(results[0]?.tekst).toContain('Wynik: \\frac{4}{25}');
  });

  it('M2 wykonuje trzy logiczne przekształcenia i zachowuje wynik w postaci potęgi', () => {
    expect(M2.steps).toHaveLength(3);
    const { draft } = solve(M2);
    expect(draft.history.map(h => h.tex)).toEqual([
      '\\left(2^{-4}\\right)^8\\cdot\\left(2^{3}\\right)^{16}',
      '2^{-32}\\cdot2^{48}',
      '2^{16}',
    ]);
    for (const entry of draft.history) expect(entry.value).toBe((1 / 16) ** 8 * 8 ** 16);
    expect(draft.history.every(h => !h.tex.includes('65536'))).toBe(true);
  });

  it('błędna operacja daje natychmiast wyjaśnienie bez zmiany wzoru ani odsłonięcia wyniku', () => {
    const step = M1.steps[0]!;
    const apply = vi.fn(step.apply);
    const plan = { ...M1, steps: [{ ...step, apply }, ...M1.steps.slice(1)] };
    const original = freshWorkedDraft(plan);
    const next = chooseWorkedOperation(plan, original, step.id, 'multiply-exponent');
    expect(apply).not.toHaveBeenCalled();
    expect(next.draft.history).toEqual([]);
    expect(next.draft.feedback).toMatchObject({ kind: 'incorrect' });
    expect(next.draft.feedback?.text).not.toContain('\\frac{4}{25}');
    expect(next.draft.mistakes).toBe(1);
    expect(next.draft.assisted).toBe(true);
    expect(next.result).toBeNull();
    expect(original.assisted).toBe(false);
    const corrected = chooseWorkedOperation(plan, next.draft, step.id, step.correctId);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(corrected.draft.history).toHaveLength(1);
    expect(corrected.draft.assisted).toBe(true);
  });

  it('błąd nie kończy zadania, a po poprawie ukończenie jest oznaczone jako wspomagane', () => {
    const wrong = chooseWorkedOperation(M1, freshWorkedDraft(M1), 'reciprocal', 'negative-base');
    const { results } = solve(M1, wrong.draft);
    expect(results).toHaveLength(1);
    expect(results[0]?.assisted).toBe(true);
  });

  it('dopiero poprawna operacja uruchamia obliczenie, bez drugiego zatwierdzania', () => {
    const step = M1.steps[0]!;
    const apply = vi.fn(step.apply);
    const plan = { ...M1, steps: [{ ...step, apply }, ...M1.steps.slice(1)] };
    const next = chooseWorkedOperation(plan, freshWorkedDraft(plan), step.id, step.correctId);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(next.draft.history).toHaveLength(1);
    expect(next.draft.viewIndex).toBe(1);
    expect(next.draft.feedback?.kind).toBe('correct');
    // A queued double click from the old rendered step cannot answer the next one.
    expect(chooseWorkedOperation(plan, next.draft, step.id, step.correctId).draft).toBe(next.draft);
  });

  it('wstecz i dalej przegląda historię bez cofania wyniku ani ponownego zaliczenia', () => {
    let draft = solve(M1).draft;
    const originalHistory = draft.history;
    draft = viewWorkedHistory(draft, 0);
    expect(draft.history).toBe(originalHistory);
    expect(draft.submitted).toBe(true);
    expect(chooseWorkedOperation(M1, draft, M1.steps[0]!.id, M1.steps[0]!.correctId).result).toBeNull();
    draft = viewWorkedHistory(draft, originalHistory.length);
    expect(finishWorkedCalculation(M1, draft).result).toBeNull();
    expect(viewWorkedHistory(draft, 999)).toBe(draft);
  });

  it('przegląd wcześniejszego zapisu nie pozwala odpowiedzieć na ukryty bieżący krok', () => {
    const initial = freshWorkedDraft(M2, 1);
    const history = viewWorkedHistory(initial, 0);
    const step = M2.steps[1]!;
    expect(chooseWorkedOperation(M2, history, step.id, step.correctId).draft).toBe(history);
  });

  it('zapis obejmuje rachunki, historię przeglądania, błąd i odsłoniętą teorię', () => {
    let draft = freshWorkedDraft(M1, 2);
    draft = revealWorkedTheory(draft);
    draft = viewWorkedHistory(draft, 1);
    const restored: unknown = JSON.parse(JSON.stringify(draft));
    expect(isWorkedDraft(restored)).toBe(true);
    expect(resumeWorkedDraft(restored as WorkedDraft, M1)).toEqual(draft);
    expect(resumeWorkedDraft(restored as WorkedDraft, M2)).toEqual(freshWorkedDraft(M2));
  });

  it('zaliczone stare kroki są seedem historii, nie nowymi odpowiedziami', () => {
    const seeded = freshWorkedDraft(M1, 3);
    expect(seeded.history).toHaveLength(3);
    expect(seeded.submitted).toBe(false);
    expect(seeded.assisted).toBe(true);
    const { results } = solve(M1, seeded);
    expect(results).toHaveLength(1);
    expect(results[0]?.assisted).toBe(true);
  });

  it('całkowity seed wymaga tylko końcowego zatwierdzenia, które jest jednorazowe', () => {
    const seeded = freshWorkedDraft(M1, 4);
    expect(resumeWorkedDraft(seeded, M1)).toBe(seeded);
    expect(seeded.submitted).toBe(false);
    const complete = finishWorkedCalculation(M1, seeded);
    expect(complete.draft.submitted).toBe(true);
    expect(complete.result?.poprawna).toBe(true);
    expect(finishWorkedCalculation(M1, complete.draft).result).toBeNull();
    const reloaded = JSON.parse(JSON.stringify(complete.draft)) as WorkedDraft;
    expect(finishWorkedCalculation(M1, resumeWorkedDraft(reloaded, M1)).result).toBeNull();
  });

  it('podgląd ukończonego zadania nie tworzy nowego zaliczenia', () => {
    const completed = freshWorkedDraft(M2, 0, true);
    expect(completed.history).toHaveLength(3);
    expect(completed.submitted).toBe(true);
    expect(finishWorkedCalculation(M2, completed).result).toBeNull();
  });

  it('odrzuca uszkodzony checkpoint i nie udaje że zna inne zadania', () => {
    expect(isWorkedDraft({})).toBe(false);
    expect(isWorkedDraft({ ...freshWorkedDraft(M1), viewIndex: 1 })).toBe(false);
    expect(resumeWorkedDraft({ ...freshWorkedDraft(M1), submitted: true }, M1)).toEqual(freshWorkedDraft(M1));
    expect(getWorkedPlan('unknown')).toBeNull();
  });
});
