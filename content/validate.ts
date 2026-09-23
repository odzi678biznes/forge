import { describe, expect, it } from 'vitest';
import { grade, normalise, parseNumber } from '@/learning-engine/grading';
import { buildSolution } from '@/learning-engine/run-tests';
import { executeTests, judge } from '@/learning-engine/code-grading';
import { HINT_LADDER, type Question } from '@/data/types';
import type { Corpus } from './math/index';

/**
 * Wspólna walidacja korpusu treści — uruchamiana dla każdego przedmiotu.
 *
 * Błąd w treści jest groźniejszy niż błąd w kodzie: silnik będzie go karnie
 * egzekwował wobec ucznia i zbuduje na nim fałszywy dowód opanowania.
 * Te testy sprawdzają wszystko, co da się sprawdzić maszynowo — nie
 * zastępują weryfikacji merytorycznej (pole `verified`).
 *
 * Wydzielenie do jednej funkcji jest celowe: nowy przedmiot dostaje pełen
 * zestaw reguł automatycznie, zamiast kopiowanego i rozjeżdżającego się pliku.
 */
export function validateCorpus(label: string, corpus: Corpus): void {
  const { topics, skills, questions } = corpus;
  const skillIds = new Set(skills.map((s) => s.id));
  const topicIds = new Set(topics.map((t) => t.id));

  const questionsOfSkill = (id: string) => questions.filter((q) => q.skillId === id);
  const numericQuestions = questions.filter((q) => q.format === 'numeric');
  const codeQuestions = questions.filter((q) => q.format === 'code');
  const gradableQuestions = questions.filter((q) => q.format !== 'code');

  describe(`${label}: struktura`, () => {
    it('identyfikatory dzialow, kompetencji i pytan sa unikalne', () => {
      expect(topicIds.size).toBe(topics.length);
      expect(skillIds.size).toBe(skills.length);
      expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    });

    it('kazdy dzial nalezy do przedmiotu, kazda kompetencja do istniejacego dzialu', () => {
      for (const t of topics) expect(t.subjectId).toBe(corpus.subject.id);
      for (const s of skills) expect(topicIds.has(s.topicId), s.id).toBe(true);
    });

    it('kazde pytanie wskazuje na istniejaca kompetencje', () => {
      for (const q of questions) expect(skillIds.has(q.skillId), q.id).toBe(true);
    });

    it('kazdy dzial ma co najmniej jedna kompetencje', () => {
      for (const t of topics) {
        expect(skills.filter((s) => s.topicId === t.id).length, t.id).toBeGreaterThan(0);
      }
    });

    it('warunki wstepne wskazuja na istniejace kompetencje i nie na siebie', () => {
      for (const s of skills) {
        expect(s.prerequisites).not.toContain(s.id);
        for (const p of s.prerequisites) expect(skillIds.has(p), `${s.id} -> ${p}`).toBe(true);
      }
    });

    it('graf warunkow wstepnych nie zawiera cyklu', () => {
      const byId = new Map(skills.map((s) => [s.id, s]));
      const stan = new Map<string, 'w-trakcie' | 'gotowe'>();

      const odwiedz = (id: string, sciezka: string[]): void => {
        if (stan.get(id) === 'gotowe') return;
        expect(stan.get(id), `cykl: ${[...sciezka, id].join(' -> ')}`).not.toBe('w-trakcie');
        stan.set(id, 'w-trakcie');
        for (const p of byId.get(id)?.prerequisites ?? []) odwiedz(p, [...sciezka, id]);
        stan.set(id, 'gotowe');
      };

      for (const s of skills) odwiedz(s.id, []);
    });

    it('wartosc maturalna miesci sie w 0..1', () => {
      for (const s of skills) {
        expect(s.examValue, s.id).toBeGreaterThanOrEqual(0);
        expect(s.examValue, s.id).toBeLessThanOrEqual(1);
      }
    });
  });

  describe(`${label}: pytania`, () => {
    it('trudnosc miesci sie w 1..5', () => {
      for (const q of questions) {
        expect(q.difficulty, q.id).toBeGreaterThanOrEqual(1);
        expect(q.difficulty, q.id).toBeLessThanOrEqual(5);
      }
    });

    it('kazde pytanie ma tresc, rozwiazanie i zrodlo', () => {
      for (const q of questions) {
        expect(q.prompt.trim(), q.id).not.toBe('');
        expect(q.solution.trim(), q.id).not.toBe('');
        expect(q.source.trim(), q.id).not.toBe('');
      }
    });

    it('odpowiedzi liczbowe daja sie sparsowac', () => {
      for (const q of numericQuestions) {
        expect(parseNumber(normalise(q.answer)), q.id).not.toBeNull();
      }
    });

    it('poprawna odpowiedz i kazdy jej wariant przechodza wlasne ocenianie', () => {
      for (const q of gradableQuestions) {
        expect(grade(q, q.answer).correctness, q.id).toBe('correct');
        for (const v of q.acceptedVariants) {
          expect(grade(q, v).correctness, `${q.id} / ${v}`).toBe('correct');
        }
      }
    });

    it('znaczniki LaTeX sa sparowane', () => {
      for (const q of questions) {
        const dolary = (q.prompt.match(/\$/g) ?? []).length;
        expect(dolary % 2, `${q.id}: nieparzysta liczba znakow $`).toBe(0);
      }
    });

    it('format i zawartosc zadania sa zgodne', () => {
      for (const q of questions) {
        if (q.format === 'code') {
          expect(q.code, `${q.id}: format code bez zadania programistycznego`).toBeDefined();
        } else {
          expect(q.code, `${q.id}: zadanie programistyczne przy formacie ${q.format}`).toBeUndefined();
        }
      }
    });
  });

  describe(`${label}: drabina podpowiedzi`, () => {
    /**
     * Poziomy 1-4 maja naprowadzac. Poziom 5 to z definicji „jeden krok
     * wspolnie", a 6 to pelne rozwiazanie - tam odslona wartosci jest zamierzona.
     */
    const GUIDING_LEVELS = 4;

    const numbersIn = (text: string): number[] =>
      (text.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

    it('poziomy sa rosnace, bez powtorzen i w zakresie drabiny', () => {
      for (const q of questions) {
        const levels = q.hints.map((h) => h.level);
        expect(levels, q.id).toEqual([...levels].sort((a, b) => a - b));
        expect(new Set(levels).size, q.id).toBe(levels.length);
        for (const h of q.hints) {
          expect(h.level, q.id).toBeGreaterThanOrEqual(1);
          expect(h.level, q.id).toBeLessThanOrEqual(HINT_LADDER.length);
          expect(h.text.trim(), q.id).not.toBe('');
        }
      }
    });

    it('kazde pytanie ma pelna drabine naprowadzajaca i krok wspolny', () => {
      for (const q of questions) {
        expect(q.hints.length, q.id).toBeGreaterThanOrEqual(4);
        expect(q.hints.some((h) => h.level >= 5), `${q.id}: brak kroku wspolnego`).toBe(true);
      }
    });

    it('pierwsza podpowiedz jest pytaniem diagnostycznym, nie gotowcem', () => {
      for (const q of questions) {
        const first = q.hints[0];
        expect(first?.level, q.id).toBe(1);
        expect(first?.text, q.id).toContain('?');
      }
    });

    it('podpowiedzi naprowadzajace nie zdradzaja gotowej odpowiedzi', () => {
      for (const q of numericQuestions) {
        const expected = parseNumber(normalise(q.answer));
        // Liczba obecna w tresci zadania to wspolczynnik, nie wynik.
        const fromPrompt = new Set(numbersIn(q.prompt));

        for (const h of q.hints.filter((x) => x.level <= GUIDING_LEVELS)) {
          const leaks = numbersIn(h.text).some((n) => n === expected && !fromPrompt.has(n));
          expect(leaks, `${q.id} / poziom ${h.level}: "${h.text}"`).toBe(false);
        }
      }
    });
  });

  describe(`${label}: typowe bledy`, () => {
    it('identyfikatory bledow sa unikalne w calym korpusie', () => {
      const ids = questions.flatMap((q) => q.commonErrors.map((e) => e.id));
      const duplikaty = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(duplikaty, `powtorzone: ${[...new Set(duplikaty)].join(', ')}`).toEqual([]);
    });

    it('zaden typowy blad nie pokrywa sie z poprawna odpowiedzia', () => {
      for (const q of gradableQuestions) {
        for (const e of q.commonErrors) {
          for (const m of e.matches) {
            expect(grade(q, m).correctness, `${q.id} / ${e.id} / ${m}`).toBe('incorrect');
          }
        }
      }
    });

    it('wpisany typowy blad jest rozpoznawany przez ocenianie', () => {
      for (const q of gradableQuestions) {
        for (const e of q.commonErrors) {
          for (const m of e.matches) {
            expect(grade(q, m).error?.id, `${q.id} / ${m}`).toBe(e.id);
          }
        }
      }
    });

    it('kazdy typowy blad nazywa przyczyne i zlamana zasade', () => {
      for (const q of questions) {
        for (const e of q.commonErrors) {
          expect(e.cause.trim(), e.id).not.toBe('');
          expect(e.rule.trim(), e.id).not.toBe('');
        }
      }
    });

    it('kazde pytanie oceniane tekstem ma zdiagnozowany typowy blad', () => {
      // Zadania programistyczne sa wylaczone: ich diagnostyka to nieprzechodzacy
      // test, a nie dopasowanie odpowiedzi do wzorca.
      for (const q of gradableQuestions) {
        expect(q.commonErrors.length, q.id).toBeGreaterThan(0);
      }
    });
  });

  describe(`${label}: gotowosc do misji`, () => {
    const hasKind = (skillId: string, kind: Question['kind']) =>
      questionsOfSkill(skillId).some((q) => q.kind === kind);

    it('kazda kompetencja ma zadanie fundamentalne, typowe i transferowe', () => {
      for (const id of skillIds) {
        expect(hasKind(id, 'foundation'), `${id}: brak fundamentu`).toBe(true);
        expect(hasKind(id, 'typical'), `${id}: brak zadania typowego`).toBe(true);
        expect(hasKind(id, 'transfer'), `${id}: brak transferu`).toBe(true);
      }
    });

    it('kazdy dzial daje sie przejsc w rosnacej trudnosci', () => {
      for (const t of topics) {
        const trudnosci = skills
          .filter((s) => s.topicId === t.id)
          .flatMap((s) => questionsOfSkill(s.id))
          .map((q) => q.difficulty);
        expect(globalThis.Math.min(...trudnosci), t.id).toBeLessThanOrEqual(2);
        expect(globalThis.Math.max(...trudnosci), t.id).toBeGreaterThanOrEqual(4);
      }
    });

    it('cala tresc jest jawnie oznaczona statusem weryfikacji', () => {
      for (const q of questions) expect(typeof q.verified, q.id).toBe('boolean');
    });
  });

  if (codeQuestions.length > 0) {
    describe(`${label}: zadania programistyczne`, () => {
      it('kazde ma nazwe funkcji, sygnature i kod startowy', () => {
        for (const q of codeQuestions) {
          expect(q.code?.functionName.trim(), q.id).not.toBe('');
          expect(q.code?.signature.trim(), q.id).not.toBe('');
          expect(q.code?.starterCode, q.id).toContain(q.code?.functionName ?? '');
        }
      });

      it('kazde ma testy widoczne i co najmniej jeden ukryty', () => {
        for (const q of codeQuestions) {
          const tests = q.code?.tests ?? [];
          expect(tests.length, q.id).toBeGreaterThanOrEqual(3);
          expect(tests.some((t) => t.hidden !== true), `${q.id}: brak testow widocznych`).toBe(true);
          // Bez testu ukrytego zadanie da sie zaliczyc dopasowaniem do przykladow.
          expect(tests.some((t) => t.hidden === true), `${q.id}: brak testu ukrytego`).toBe(true);
        }
      });

      it('nazwy testow sa unikalne w obrebie zadania', () => {
        for (const q of codeQuestions) {
          const names = (q.code?.tests ?? []).map((t) => t.name);
          expect(new Set(names).size, q.id).toBe(names.length);
        }
      });

      it('kod startowy NIE rozwiazuje zadania', () => {
        // Inaczej uczen zaliczylby zadanie, nie pisząc ani linijki.
        for (const q of codeQuestions) {
          const code = q.code;
          if (!code) continue;
          const { solve } = buildSolution(code.starterCode, code.functionName);
          if (!solve) continue;
          const verdict = judge(executeTests(solve, code.tests));
          expect(verdict.allPassed, `${q.id}: kod startowy przechodzi testy`).toBe(false);
        }
      });

      it('testy sa spojne: istnieje rozwiazanie, ktore przechodzi wszystkie', () => {
        // Sprawdzamy to referencyjnym rozwiazaniem z pola `solution`?
        // Nie - zamiast tego pilnujemy, ze zestaw testow nie jest sprzeczny:
        // dwa testy o tym samym wejsciu nie moga oczekiwac roznych wynikow.
        for (const q of codeQuestions) {
          const seen = new Map<string, string>();
          for (const t of q.code?.tests ?? []) {
            const key = JSON.stringify(t.input);
            const expectedStr = JSON.stringify(t.expected) ?? 'undefined';
            const previous = seen.get(key);
            expect(
              previous === undefined || previous === expectedStr,
              `${q.id}: sprzeczne oczekiwania dla wejscia ${key}`,
            ).toBe(true);
            seen.set(key, expectedStr);
          }
        }
      });
    });
  }
}
