import { describe, expect, it } from 'vitest';
import {
  MAX_PRIOR_ERRORS,
  MAX_REASONING_LENGTH,
  buildAiContext,
  describeContext,
  hintLeaksAnswer,
  parseAiAssessment,
  parseAiHint,
  type ContextInput,
} from './ai-context';
import { makeQuestion } from './testing';

const question = makeQuestion({
  prompt: 'Oblicz wyróżnik równania $x^2 - 6x + 5 = 0$.',
  answer: '16',
  solution: 'Delta = 36 - 20 = 16.',
  hints: [
    { level: 1, text: 'Który współczynnik to b?' },
    { level: 2, text: 'Podstaw do wzoru na deltę.' },
    { level: 3, text: 'Wzór to b kwadrat minus 4ac.' },
  ],
});

const catalogue = [
  { id: 'e-1', matches: ['31'], cause: 'Pominięta czwórka we wzorze.', rule: 'r' },
  { id: 'e-2', matches: ['-16'], cause: 'Zły znak kwadratu.', rule: 'r' },
  { id: 'e-3', matches: ['0'], cause: 'Trzecia przyczyna.', rule: 'r' },
  { id: 'e-4', matches: ['1'], cause: 'Czwarta przyczyna.', rule: 'r' },
];

const input = (over: Partial<ContextInput> = {}): ContextInput => ({
  task: 'hint',
  question,
  answer: '31',
  hintLevel: 0,
  recentErrorIds: [],
  errorCatalogue: catalogue,
  ...over,
});

describe('kontekst AI zawiera wylacznie piec pol z sek. 11', () => {
  it('ma dokladnie te klucze i nic wiecej', () => {
    const ctx = buildAiContext(input());
    expect(Object.keys(ctx).sort()).toEqual(
      ['answer', 'hintsUsed', 'priorErrors', 'question', 'reasoning', 'rubric', 'task'].sort(),
    );
    expect(Object.keys(ctx.rubric).sort()).toEqual(['correctAnswer', 'solution']);
  });

  it('nie przenosi niczego, co opisuje osobe ani jej postep', () => {
    const json = JSON.stringify(buildAiContext(input({ recentErrorIds: ['e-1'] })));
    for (const zakazane of ['level', 'streak', 'reviewDue', 'mission', 'attempt', 'email', 'plan', 'deadline', 'skillId']) {
      expect(json, zakazane).not.toContain(zakazane);
    }
  });

  it('podpowiedzi obejmuja tylko te, ktore uczen juz zobaczyl', () => {
    expect(buildAiContext(input({ hintLevel: 0 })).hintsUsed).toEqual([]);
    expect(buildAiContext(input({ hintLevel: 2 })).hintsUsed).toHaveLength(2);
  });

  it('wczesniejsze bledy to przyczyny, nie identyfikatory, i najwyzej kilka', () => {
    const ctx = buildAiContext(input({ recentErrorIds: ['e-1', 'e-2', 'e-3', 'e-4'] }));
    expect(ctx.priorErrors).toHaveLength(MAX_PRIOR_ERRORS);
    expect(ctx.priorErrors[0]).toBe('Czwarta przyczyna.');
    for (const e of ctx.priorErrors) expect(e).not.toMatch(/^e-\d$/);
  });

  it('ten sam blad powtorzony kilka razy trafia do kontekstu raz', () => {
    const ctx = buildAiContext(input({ recentErrorIds: ['e-1', 'e-1', 'e-1'] }));
    expect(ctx.priorErrors).toEqual(['Pominięta czwórka we wzorze.']);
  });

  it('nieznany identyfikator bledu jest pomijany, a nie wysylany', () => {
    expect(buildAiContext(input({ recentErrorIds: ['nie-ma'] })).priorErrors).toEqual([]);
  });

  it('tok rozumowania jest przycinany do limitu', () => {
    const ctx = buildAiContext(input({ task: 'assess', reasoning: 'x'.repeat(10_000) }));
    expect(ctx.reasoning).toHaveLength(MAX_REASONING_LENGTH);
  });
});

describe('ekran przejrzystosci', () => {
  it('pokazuje kazde wysylane pole, lacznie z poprawna odpowiedzia', () => {
    const lines = describeContext(buildAiContext(input({ hintLevel: 1, recentErrorIds: ['e-1'] })));
    const labels = lines.map((l) => l.label);
    expect(labels).toContain('Treść pytania');
    expect(labels).toContain('Twoja odpowiedź');
    expect(labels).toContain('Poprawna odpowiedź (rubryka)');
    expect(labels).toContain('Podpowiedzi, które już widziałeś');
    expect(labels).toContain('Twoje wcześniejsze błędy w tej kompetencji');
  });

  it('tok rozumowania pojawia sie tylko przy ocenie rozumowania', () => {
    const hint = describeContext(buildAiContext(input({ task: 'hint' }))).map((l) => l.label);
    const assess = describeContext(buildAiContext(input({ task: 'assess' }))).map((l) => l.label);
    expect(hint).not.toContain('Twój tok rozumowania');
    expect(assess).toContain('Twój tok rozumowania');
  });

  it('opis zawiera te same wartosci, ktore trafiaja do AI', () => {
    const ctx = buildAiContext(input({ hintLevel: 1 }));
    const shown = describeContext(ctx).map((l) => l.value).join('\n');
    expect(shown).toContain(ctx.question);
    expect(shown).toContain(ctx.rubric.correctAnswer);
    expect(shown).toContain(ctx.hintsUsed[0]);
  });
});

describe('podpowiedz AI nie moze zdradzac wyniku', () => {
  it('liczba rowna wynikowi w podpowiedzi to przeciek', () => {
    expect(hintLeaksAnswer('Wynik to 16, sprawdź.', question)).toBe(true);
  });

  it('liczby z tresci zadania nie sa przeciekiem', () => {
    expect(hintLeaksAnswer('Zwróć uwagę na współczynnik 6.', question)).toBe(false);
  });

  it('przecinek dziesietny nie ukrywa przecieku', () => {
    const q = makeQuestion({ prompt: 'Podaj.', answer: '0.5' });
    expect(hintLeaksAnswer('To będzie 0,5.', q)).toBe(true);
  });

  it('wynik tekstowy jest wykrywany po normalizacji', () => {
    const q = makeQuestion({ prompt: 'Zapisz binarnie.', format: 'exact-text', answer: '1101' });
    expect(hintLeaksAnswer('Odpowiedź: 1101', q)).toBe(true);
    expect(hintLeaksAnswer('Rozłóż liczbę na potęgi dwójki.', q)).toBe(false);
  });
});

describe('walidacja odpowiedzi AI', () => {
  it('przyjmuje poprawna podpowiedz', () => {
    expect(parseAiHint({ hint: 'Sprawdź znak c.', focus: 'wzór' })).toEqual({
      hint: 'Sprawdź znak c.',
      focus: 'wzór',
    });
  });

  it('odrzuca podpowiedz pusta albo w zlym ksztalcie', () => {
    for (const bad of [null, 'tekst', {}, { hint: '' }, { hint: 42 }]) {
      expect(parseAiHint(bad), JSON.stringify(bad)).toBeNull();
    }
  });

  it('przyjmuje tylko znane werdykty oceny', () => {
    expect(parseAiAssessment({ verdict: 'partial', firstGap: 'krok 2', feedback: 'OK' })?.verdict).toBe(
      'partial',
    );
    expect(parseAiAssessment({ verdict: 'excellent', feedback: 'OK' })).toBeNull();
    expect(parseAiAssessment({ verdict: 'correct', feedback: '' })).toBeNull();
  });
});
