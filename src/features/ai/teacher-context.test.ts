import { describe, expect, it } from 'vitest';
import { teacherQuestionContext, teacherLessonContext } from './teacher-context';
import { demo } from '@/nauka/nauczyciel-klient';
import { waliduj } from '../../../server/nauczyciel';
import type { Question, Skill } from '@/data/types';

const question: Question = {
  id: 'test-delta', skillId: 'quadratic', kind: 'typical', prompt: 'Oblicz wyróżnik $x^2-6x+5=0$.',
  format: 'numeric', answer: '16', acceptedVariants: [], solution: '36-20=16', steps: ['36-20=16'],
  hints: [{ level: 1, text: 'Odczytaj współczynniki a, b, c.' }, { level: 6, text: 'Odpowiedź to 16.' }],
  commonErrors: [], difficulty: 3, source: 'FORGE', verified: true,
};

describe('teacher in regular lessons and exercises', () => {
  it('passes scratch work, current step and an ungraded answer without declaring it incorrect', () => {
    const context = teacherQuestionContext(question, { answer: '36', notes: 'b = -6\nb² = 36', step: 'Oblicz b²' });
    expect(context.czyPoprawna).toBeNull();
    expect(context.odpowiedzUcznia).toBe('36');
    expect(context.krok.kontekst).toContain('b² = 36');
    expect(context.krok.pytanie).toBe('Oblicz b²');
    expect(waliduj({ kontekst: context, prosba: 'pytanie', pytanie: 'Czy mój zapis jest poprawny?', historia: [] })).not.toBeNull();
  });
  it('local next-step assistance does not fall back to the worked solution', () => {
    const context = teacherQuestionContext(question);
    expect(context.sesja?.podpowiedzi).toEqual(['Odczytaj współczynniki a, b, c.']);
    expect(demo(context, 'nastepny-krok').tekst).not.toContain('16');
    expect(demo(context, 'nastepny-krok').tekst).toContain('współczynniki');
    expect(demo(context, 'inaczej').tekst).not.toContain('16');
    expect(demo(context, 'pelne').struktura?.ujawniaWynik).toBe(true);
  });
  it('sends the meaning of an error category, not just its identifier', () => {
    const context = teacherQuestionContext({ ...question, commonErrors: [{ id: 'no-four', matches: ['31'], cause: 'Pominięto czynnik 4.', rule: 'Delta to b² − 4ac.' }] });
    expect(context.sesja?.opisyBledow?.['no-four']).toContain('Pominięto czynnik 4.');
    expect(waliduj({ kontekst: context, prosba: 'co-zle', historia: [] })).not.toBeNull();
  });
  it('recognises an already correct final answer without mistaking an intermediate result for it', () => {
    expect(teacherQuestionContext(question, {answer:'16'}).czyPoprawna).toBe(true);
    expect(teacherQuestionContext(question, {answer:'16',step:'Oblicz b²'}).czyPoprawna).toBeNull();
    expect(teacherQuestionContext(question, {answer:'-36'}).czyPoprawna).toBeNull();
  });
  it('accepts a math-notation request only with the student’s own wording', () => {
    const base = { kontekst: teacherQuestionContext(question), prosba: 'zapis', historia: [] };
    expect(waliduj(base)).toBeNull();
    expect(waliduj({ ...base, pytanie: 'minus sześć w nawiasie do kwadratu' })).not.toBeNull();
    expect(demo(base.kontekst, 'zapis').tekst).toContain('potrzebne jest połączenie');
  });
  it('provides the actual lesson formulas and method to the teacher', () => {
    const context = teacherLessonContext({ skillId: 'quadratic', intro: 'Wyróżnik', blocks: [{ kind: 'formula', tex: '\\Delta=b^2-4ac' }], examples: [], pitfalls: [], minutes: 4, method: ['Odczytaj współczynniki.'] }, { name: 'Równania kwadratowe' } as Skill);
    expect(context.krok.kontekst).toContain('b^2-4ac');
    expect(context.krok.kontekst).toContain('Odczytaj');
    expect(waliduj({ kontekst: context, prosba: 'nie-rozumiem', historia: [] })).not.toBeNull();
  });
});
