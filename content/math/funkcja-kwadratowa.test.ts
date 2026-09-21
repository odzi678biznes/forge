import { describe, expect, it } from 'vitest';
import { grade, normalise, parseNumber } from '@/learning-engine/grading';
import { HINT_LADDER, type Question } from '@/data/types';
import {
  QUADRATIC_QUESTIONS,
  QUADRATIC_SKILLS,
  QUADRATIC_TOPIC,
} from './funkcja-kwadratowa';

/**
 * Kontrola tresci.
 *
 * Blad w tresci jest grozniejszy niz blad w kodzie: silnik bedzie go karnie
 * egzekwowal wobec uzytkownika i zbuduje na nim falszywy dowod opanowania.
 * Te testy pilnuja spojnosci, ktora da sie sprawdzic maszynowo - nie zastepuja
 * weryfikacji merytorycznej (pole `verified`).
 */

const skillIds = new Set(QUADRATIC_SKILLS.map((s) => s.id));

describe('spojnosc kompetencji', () => {
  it('identyfikatory kompetencji sa unikalne', () => {
    expect(skillIds.size).toBe(QUADRATIC_SKILLS.length);
  });

  it('kazda kompetencja nalezy do zadeklarowanego dzialu', () => {
    for (const s of QUADRATIC_SKILLS) {
      expect(s.topicId).toBe(QUADRATIC_TOPIC.id);
    }
  });

  it('warunki wstepne wskazuja na istniejace kompetencje', () => {
    for (const s of QUADRATIC_SKILLS) {
      for (const p of s.prerequisites) {
        expect(skillIds.has(p)).toBe(true);
      }
    }
  });

  it('zaden warunek wstepny nie wskazuje na samego siebie', () => {
    for (const s of QUADRATIC_SKILLS) {
      expect(s.prerequisites).not.toContain(s.id);
    }
  });

  it('wartosc maturalna miesci sie w 0..1', () => {
    for (const s of QUADRATIC_SKILLS) {
      expect(s.examValue).toBeGreaterThanOrEqual(0);
      expect(s.examValue).toBeLessThanOrEqual(1);
    }
  });
});

describe('spojnosc pytan', () => {
  it('identyfikatory pytan sa unikalne', () => {
    const ids = QUADRATIC_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('kazde pytanie wskazuje na istniejaca kompetencje', () => {
    for (const q of QUADRATIC_QUESTIONS) {
      expect(skillIds.has(q.skillId)).toBe(true);
    }
  });

  it('trudnosc miesci sie w 1..5', () => {
    for (const q of QUADRATIC_QUESTIONS) {
      expect(q.difficulty).toBeGreaterThanOrEqual(1);
      expect(q.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it('kazde pytanie ma tresc, rozwiazanie i zrodlo', () => {
    for (const q of QUADRATIC_QUESTIONS) {
      expect(q.prompt.trim()).not.toBe('');
      expect(q.solution.trim()).not.toBe('');
      expect(q.source.trim()).not.toBe('');
    }
  });

  it('odpowiedzi liczbowe daja sie sparsowac', () => {
    for (const q of QUADRATIC_QUESTIONS.filter((x) => x.format === 'numeric')) {
      expect(parseNumber(normalise(q.answer)), q.id).not.toBeNull();
    }
  });

  it('poprawna odpowiedz faktycznie przechodzi wlasne ocenianie', () => {
    for (const q of QUADRATIC_QUESTIONS) {
      expect(grade(q, q.answer).correctness, q.id).toBe('correct');
      for (const variant of q.acceptedVariants) {
        expect(grade(q, variant).correctness, `${q.id} / ${variant}`).toBe('correct');
      }
    }
  });
});

describe('drabina podpowiedzi', () => {
  it('poziomy podpowiedzi sa rosnace i bez powtorzen', () => {
    for (const q of QUADRATIC_QUESTIONS) {
      const levels = q.hints.map((h) => h.level);
      expect(levels, q.id).toEqual([...levels].sort((a, b) => a - b));
      expect(new Set(levels).size, q.id).toBe(levels.length);
    }
  });

  it('poziomy mieszcza sie w drabinie z sek. 5', () => {
    for (const q of QUADRATIC_QUESTIONS) {
      for (const h of q.hints) {
        expect(h.level).toBeGreaterThanOrEqual(1);
        expect(h.level).toBeLessThanOrEqual(HINT_LADDER.length);
        expect(h.text.trim()).not.toBe('');
      }
    }
  });

  it('pierwsza podpowiedz jest pytaniem diagnostycznym, nie gotowcem', () => {
    for (const q of QUADRATIC_QUESTIONS) {
      const first = q.hints[0];
      if (!first) continue;
      expect(first.level, q.id).toBe(1);
      expect(first.text, q.id).toContain('?');
    }
  });

  /**
   * Poziomy 1-4 maja naprowadzac. Poziom 5 to z definicji "jeden krok
   * wspolnie", a 6 to pelne rozwiazanie - tam odslona wartosci jest zamierzona.
   */
  const GUIDING_LEVELS = 4;

  const numbersIn = (text: string): number[] =>
    (text.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

  it('podpowiedzi naprowadzajace nie zdradzaja gotowej odpowiedzi', () => {
    for (const q of QUADRATIC_QUESTIONS.filter((x) => x.format === 'numeric')) {
      const expected = parseNumber(normalise(q.answer));
      // Liczba obecna w tresci zadania to wspolczynnik, nie wynik - jej
      // powtorzenie w podpowiedzi niczego nie zdradza.
      const fromPrompt = new Set(numbersIn(q.prompt));

      for (const h of q.hints.filter((x) => x.level <= GUIDING_LEVELS)) {
        const leaks = numbersIn(h.text).some(
          (n) => n === expected && !fromPrompt.has(n),
        );
        expect(leaks, `${q.id} / poziom ${h.level}: "${h.text}"`).toBe(false);
      }
    }
  });
});

describe('typowe bledy', () => {
  it('identyfikatory bledow sa unikalne w calym zbiorze', () => {
    const ids = QUADRATIC_QUESTIONS.flatMap((q) => q.commonErrors.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('zaden typowy blad nie pokrywa sie z poprawna odpowiedzia', () => {
    for (const q of QUADRATIC_QUESTIONS) {
      for (const e of q.commonErrors) {
        for (const m of e.matches) {
          expect(grade(q, m).correctness, `${q.id} / ${e.id} / ${m}`).toBe('incorrect');
        }
      }
    }
  });

  it('kazdy typowy blad nazywa przyczyne i zlamana zasade', () => {
    for (const q of QUADRATIC_QUESTIONS) {
      for (const e of q.commonErrors) {
        expect(e.cause.trim(), e.id).not.toBe('');
        expect(e.rule.trim(), e.id).not.toBe('');
      }
    }
  });

  it('wpisany typowy blad jest rozpoznawany przez ocenianie', () => {
    for (const q of QUADRATIC_QUESTIONS) {
      for (const e of q.commonErrors) {
        for (const m of e.matches) {
          expect(grade(q, m).error?.id, `${q.id} / ${m}`).toBe(e.id);
        }
      }
    }
  });
});

describe('gotowosc do misji', () => {
  const byKind = (kind: Question['kind']) =>
    QUADRATIC_QUESTIONS.filter((q) => q.kind === kind);

  it('jest dosc pytan na misje z sek. 18 (piec zadan)', () => {
    expect(QUADRATIC_QUESTIONS.length).toBeGreaterThanOrEqual(5);
  });

  it('kazda kompetencja ma zadanie typowe', () => {
    for (const id of skillIds) {
      expect(byKind('typical').some((q) => q.skillId === id), id).toBe(true);
    }
  });

  it('kazda kompetencja ma zadanie transferowe - inaczej poziom 4 jest nieosiagalny', () => {
    for (const id of skillIds) {
      expect(byKind('transfer').some((q) => q.skillId === id), id).toBe(true);
    }
  });

  it('kazda kompetencja ma zadanie fundamentalne - inaczej naprawa bledu nie ma czego podac', () => {
    for (const id of skillIds) {
      expect(byKind('foundation').some((q) => q.skillId === id), id).toBe(true);
    }
  });

  it('tresc niezweryfikowana merytorycznie jest tak oznaczona', () => {
    // Swiadomy stan: material autorski czeka na weryfikacje wzgledem CKE.
    for (const q of QUADRATIC_QUESTIONS) {
      expect(typeof q.verified).toBe('boolean');
    }
  });
});
