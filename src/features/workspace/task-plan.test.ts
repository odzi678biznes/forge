import { describe, expect, it } from 'vitest';
import { MATH_QUESTIONS, MATH_SKILLS } from '@content/math';
import { makeQuestion } from '@/learning-engine/testing';
import { getTaskPlan } from './task-plan';

function question(id: string) {
  const found = MATH_QUESTIONS.find(q => q.id === id);
  if (!found) throw new Error(`Missing content fixture: ${id}`);
  return found;
}

describe('plany etapów zadań', () => {
  it('dzieli wyróżnik na niezależne rachunki bez ujawniania wyniku w poleceniach', () => {
    const result = getTaskPlan(question('q-disc-1'));
    expect(result.steps.map(s => s.expected)).toEqual([undefined, 36, 20, 16]);
    expect(result.steps.map(s => s.prompt).join(' ')).not.toMatch(/36|20|16/);
    expect(result.steps[0]?.prompt).toContain('znaki');
  });

  it('oddziela wyznaczenie współczynnika od znalezienia miejsca zerowego', () => {
    const result = getTaskPlan(question('l-for-6'));
    expect(result.steps.map(s => s.id)).toEqual(['point', 'coefficient', 'zero-equation', 'zero', 'check']);
    expect(result.steps[1]?.expected).toBe(-4);
    expect(result.steps[3]?.expected).toBe(0.75);
    expect(result.steps.map(s => s.prompt).join(' ')).not.toMatch(/-4|0[.,]75|3\/4/);
  });

  it('zachowuje osobno koszt kilometrów i liczbę kilometrów', () => {
    const result = getTaskPlan(question('f-bas-7'));
    expect(result.steps.map(s => s.expected)).toEqual([undefined, 35, 10, undefined]);
    expect(result.steps.map(s => s.prompt).join(' ')).not.toMatch(/35|10/);
    expect(result.steps.at(-1)?.prompt).toContain('jednostkę');
  });

  it('nie używa klucza odpowiedzi, podpowiedzi ani rozwiązania', () => {
    const guarded = new Proxy(question('l-for-6'), {
      get(target, field, receiver) {
        if (['answer', 'solution', 'steps', 'hints', 'acceptedVariants', 'commonErrors'].includes(String(field))) {
          throw new Error(`Forbidden answer field: ${String(field)}`);
        }
        return Reflect.get(target, field, receiver);
      },
    });
    expect(getTaskPlan(guarded).steps).toHaveLength(5);
  });

  it('nie przypisuje starej weryfikacji po zmianie danych w treści tego samego zadania', () => {
    for (const id of ['q-disc-1', 'l-for-6', 'f-bas-7']) {
      const original = question(id);
      const edited = { ...original, prompt: original.prompt.replace(/\d/, '9') };
      expect(getTaskPlan(edited).steps.every(s => s.expected === undefined)).toBe(true);
    }
  });

  it('nie myli parametrów z prostym wyróżnikiem ani logarytmów z równaniami liniowymi', () => {
    expect(getTaskPlan(makeQuestion({ skillId: 'quad-param' })).title).toContain('parametrem');
    expect(getTaskPlan(makeQuestion({ skillId: 'log-equations' })).title).toBe('Logarytmy');
    expect(getTaskPlan(makeQuestion({ skillId: 'eq-rational' })).steps[0]?.title).toBe('Dziedzina');
    expect(getTaskPlan(makeQuestion({ skillId: 'ineq-linear' })).steps[2]?.prompt).toContain('ujemną');
  });

  it('dla nieznanego tematu proponuje uczciwy plan bez automatycznej oceny', () => {
    const result = getTaskPlan(makeQuestion({ skillId: 'unknown' }), 'Nowy temat');
    expect(result.title).toContain('Nowy temat');
    expect(result.steps.every(s => s.expected === undefined)).toBe(true);
    expect(result.steps.at(-1)?.prompt).toContain('nie potwierdza poprawności');
  });

  it('obejmuje każdą kompetencję aktualnego kursu matematyki metodą tematyczną', () => {
    for (const skill of MATH_SKILLS) {
      const result = getTaskPlan(makeQuestion({ skillId: skill.id }), skill.name);
      expect(result.title, skill.id).not.toMatch(/^Plan pracy:|^Twój plan/);
      expect(result.steps.length, skill.id).toBeGreaterThanOrEqual(3);
      expect(new Set(result.steps.map(s => s.id)).size, skill.id).toBe(result.steps.length);
    }
  });

  it('plany nie modyfikują danych kursu i nie współdzielą stanu ucznia', () => {
    const original = question('f-bas-7');
    const before = JSON.stringify(original);
    const first = getTaskPlan(original);
    first.steps[0]!.prompt = 'Zmienione';
    expect(getTaskPlan(original).steps[0]?.prompt).not.toBe('Zmienione');
    expect(JSON.stringify(original)).toBe(before);
  });
});
