import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { grade, normalise, parseNumber } from '@/learning-engine/grading';
import { buildSolution } from '@/learning-engine/run-tests';
import { executeTests, judge } from '@/learning-engine/code-grading';
import { HINT_LADDER, type Figure, type Question } from '@/data/types';
import type { Corpus } from './corpus';
import { VERIFIERS } from './authoring';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

/** Wszystkie fragmenty $...$ z tekstu. */
function mathSegments(text: string): string[] {
  return [...text.matchAll(/\$([^$]*)\$/g)].map((m) => m[1] ?? '');
}

/** Liczba z prostego zapisu odpowiedzi zamknietej: 12, -0,5, \frac{3}{4}, -\dfrac{1}{2}. */
function choiceValue(choiceText: string): number | null {
  const tex = choiceText
    .replace(/\$/g, '')
    .replace(/\s+/g, '')
    // Odpowiedź zapisana jako przypisanie: "$a = 5$".
    .replace(/^[a-z]=/, '')
    .replace(/\{,\}/g, '.')
    .replace(/,/g, '.')
    // Procent we wzorze ("$19\%$") i jednostka poza wzorem ("$1020$ zł").
    .replace(/\\%$/, '%')
    .replace(/(zł|%|cm|m|kg|°)$/, '');
  const frac =
    /^(-?)\\d?frac\{(\d+(?:\.\d+)?)\}\{(\d+(?:\.\d+)?)\}$/.exec(tex) ??
    /^(-?)\\d?frac(\d)(\d)$/.exec(tex);
  if (frac) return (frac[1] === '-' ? -1 : 1) * (Number(frac[2]) / Number(frac[3]));
  const n = Number(tex);
  return tex !== '' && Number.isFinite(n) ? n : null;
}

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
  const { topics, skills, questions, lessons, flashcards } = corpus;
  const skillIds = new Set(skills.map((s) => s.id));
  const topicIds = new Set(topics.map((t) => t.id));

  const questionsOfSkill = (id: string) => questions.filter((q) => q.skillId === id);
  const numericQuestions = questions.filter((q) => q.format === 'numeric');
  const codeQuestions = questions.filter((q) => q.format === 'code');
  const gradableQuestions = questions.filter((q) => q.format !== 'code');
  const choiceQuestions = questions.filter((q) => q.format === 'choice');
  /** Umiejetnosci kursu - te z poziomem PP/PR - musza miec lekcje i fiszki. */
  const courseSkills = skills.filter((s) => s.level !== undefined);

  /** Kazdy tekst korpusu, ktory trafia na ekran, z etykieta do komunikatu. */
  const allTexts: Array<[string, string]> = [
    ...questions.flatMap((q): Array<[string, string]> => [
      [q.id, q.prompt],
      [q.id, q.solution],
      ...(q.steps ?? []).map((t): [string, string] => [`${q.id}/krok`, t]),
      ...(q.choices ?? []).map((t): [string, string] => [`${q.id}/odp`, t]),
      ...q.hints.map((h): [string, string] => [`${q.id}/podp${h.level}`, h.text]),
      ...q.commonErrors.flatMap((e): Array<[string, string]> => [
        [e.id, e.cause],
        [e.id, e.rule],
      ]),
    ]),
    ...lessons.flatMap((l): Array<[string, string]> => [
      [`lekcja ${l.skillId}`, l.intro],
      ...l.blocks.map((b): [string, string] => [
        `lekcja ${l.skillId}`,
        b.kind === 'formula'
          ? `$${b.tex}$ ${b.caption ?? ''}`
          : b.kind === 'figure'
            ? `${b.figure.alt} ${b.caption ?? ''}`
            : b.kind === 'code'
              ? (b.caption ?? '')
              : b.body,
      ]),
      ...l.examples.flatMap((e): Array<[string, string]> => [
        [`przyklad ${l.skillId}`, e.prompt],
        [`przyklad ${l.skillId}`, e.answer],
        ...e.steps.flatMap((st): Array<[string, string]> => [
          [`przyklad ${l.skillId}`, st.text],
          [`przyklad ${l.skillId}`, st.why ?? ''],
        ]),
      ]),
      ...l.pitfalls.map((t): [string, string] => [`pulapka ${l.skillId}`, t]),
    ]),
    ...flashcards.flatMap((c): Array<[string, string]> => [
      [c.id, c.front],
      [c.id, c.back],
    ]),
  ];

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

    // Wykładnik ($x^2$) to nie wartość, którą uczeń mógłby przepisać jako
    // wynik - pomijamy go, żeby reguła nie zgłaszała fałszywych przecieków.
    // Skrót TeX-a \frac12 to jedna druga, a nie liczba 12.
    const numbersIn = (text: string): number[] =>
      (
        text
          .replace(/\\[dt]?frac(\d)(\d)/g, ' $1 $2 ')
          .replace(/\^\{[^}]*\}|\^\d/g, ' ')
          .match(/-?\d+(?:\.\d+)?/g) ?? []
      ).map(Number);

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
        // W treści liczy się każda liczba, także wykładnik - skoro jest
        // w poleceniu, podpowiedź, która ją powtarza, niczego nie zdradza.
        const fromPrompt = new Set((q.prompt.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number));

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

  describe(`${label}: zapis matematyczny`, () => {
    it('zaden tekst nie zawiera znakow sterujacych - slad zjedzonego ukosnika', () => {
      // '\times' w zwyklym cudzyslowie to tabulator + "imes", '\frac' to
      // znak nowej strony + "rac". KaTeX tego nie zglosi - trzeba szukac tu.
      for (const [where, t] of allTexts) {
        expect(/[\u0000-\u001f]/.test(t), `${where}: "${t}"`).toBe(false);
      }
    });

    it('procent we wzorze jest zapisany jako \\% - goly % to w TeX-u komentarz', () => {
      for (const [where, t] of allTexts) {
        for (const tex of mathSegments(t)) {
          expect(/(^|[^\\])%/.test(tex), `${where}: $${tex}$`).toBe(false);
        }
      }
    });

    it('kazdy tekst ma sparowane znaki $', () => {
      for (const [where, t] of allTexts) {
        expect((t.match(/\$/g) ?? []).length % 2, `${where}: "${t}"`).toBe(0);
      }
    });

    it('kazdy wzor da sie wyrenderowac bez bledu skladni', () => {
      for (const [where, t] of allTexts) {
        for (const tex of mathSegments(t)) {
          expect(
            () => katex.renderToString(tex, { throwOnError: true }),
            `${where}: $${tex}$`,
          ).not.toThrow();
        }
      }
    });
  });

  describe(`${label}: rysunki`, () => {
    const figures: Array<[string, Figure]> = [
      ...questions.flatMap((q): Array<[string, Figure]> => (q.figure ? [[q.id, q.figure]] : [])),
      ...lessons.flatMap((l) =>
        l.blocks.flatMap((b): Array<[string, Figure]> => (b.kind === 'figure' ? [[`lekcja ${l.skillId}`, b.figure]] : [])),
      ),
    ];

    it('kazdy rysunek ma opis dla czytnika ekranu', () => {
      for (const [where, fig] of figures) expect(fig.alt.trim().length, where).toBeGreaterThan(10);
    });

    it('wykres ma poprawne zakresy, a krzywe istnieja w rysowanym obszarze', () => {
      for (const [where, fig] of figures) {
        if (fig.kind !== 'plot') continue;
        expect(fig.x[0] < fig.x[1] && fig.y[0] < fig.y[1], where).toBe(true);
        for (const c of fig.curves ?? []) {
          const from = c.from ?? fig.x[0];
          const to = c.to ?? fig.x[1];
          const visible = Array.from({ length: 50 }, (_, i) => c.fn(from + ((to - from) * i) / 49)).filter(
            (y) => Number.isFinite(y) && y >= fig.y[0] && y <= fig.y[1],
          );
          expect(visible.length, `${where}: krzywa poza wykresem`).toBeGreaterThan(5);
        }
      }
    });

    it('figura geometryczna odwoluje sie tylko do istniejacych punktow', () => {
      for (const [where, fig] of figures) {
        if (fig.kind !== 'geometry') continue;
        const names = new Set(Object.keys(fig.points));
        const used = [
          ...(fig.segments ?? []).flatMap((s) => [s.from, s.to]),
          ...(fig.polygons ?? []).flatMap((p) => p.vertices),
          ...(fig.circles ?? []).map((c) => c.center),
          ...(fig.angles ?? []).flatMap((a) => [a.at, a.from, a.to]),
        ];
        for (const n of used) expect(names.has(n), `${where}: brak punktu ${n}`).toBe(true);
      }
    });
  });

  describe(`${label}: wyniki liczone niezaleznie`, () => {
    it('odpowiedz autora zgadza sie z niezaleznym wyliczeniem', () => {
      for (const q of questions) {
        const verify = VERIFIERS.get(q.id);
        if (!verify) continue;
        const computed = verify();

        if (q.format === 'numeric') {
          const given = parseNumber(normalise(q.answer));
          expect(given, q.id).not.toBeNull();
          const tolerance = Math.max(q.tolerance ?? 0, 1e-9 * Math.max(1, Math.abs(Number(computed))));
          expect(
            Math.abs((given ?? NaN) - Number(computed)),
            `${q.id}: odpowiedz ${q.answer}, wyliczone ${computed}`,
          ).toBeLessThanOrEqual(tolerance);
        } else if (q.format === 'choice') {
          const idx = LETTERS.indexOf(q.answer as (typeof LETTERS)[number]);
          const value = choiceValue(q.choices?.[idx] ?? '');
          expect(value, `${q.id}: odpowiedzi ${q.answer} nie da sie odczytac jako liczby`).not.toBeNull();
          expect(
            Math.abs((value ?? NaN) - Number(computed)),
            `${q.id}: ${q.choices?.[idx]}, wyliczone ${computed}`,
          ).toBeLessThan(1e-9);
        } else {
          expect(normalise(q.answer), q.id).toBe(normalise(String(computed)));
        }
      }
    });
  });

  if (choiceQuestions.length > 0) {
    describe(`${label}: zadania zamkniete`, () => {
      it('maja cztery rozne odpowiedzi i poprawna litere A-D', () => {
        for (const q of choiceQuestions) {
          expect(q.choices?.length, q.id).toBe(4);
          expect(new Set(q.choices).size, `${q.id}: powtorzona odpowiedz`).toBe(4);
          expect(LETTERS as readonly string[], q.id).toContain(q.answer);
        }
      });

      it('kazda bledna litera ma nazwana przyczyne - zly wybor mowi, co poszlo zle', () => {
        for (const q of choiceQuestions) {
          for (const letter of LETTERS.filter((l) => l !== q.answer)) {
            expect(grade(q, letter).error, `${q.id}: litera ${letter} bez przyczyny`).not.toBeNull();
          }
        }
      });
    });
  }

  describe(`${label}: lekcje i fiszki`, () => {
    it('lekcja wskazuje istniejaca umiejetnosc, najwyzej jedna na umiejetnosc', () => {
      for (const l of lessons) expect(skillIds.has(l.skillId), l.skillId).toBe(true);
      const ids = lessons.map((l) => l.skillId);
      expect(new Set(ids).size, 'dwie lekcje do jednej umiejetnosci').toBe(ids.length);
    });

    it('kazda umiejetnosc kursu ma lekcje', () => {
      const withLesson = new Set(lessons.map((l) => l.skillId));
      for (const s of courseSkills) expect(withLesson.has(s.id), `${s.id}: brak lekcji`).toBe(true);
    });

    it('lekcja ma wstep, tresc, rozwiazany przyklad i pulapki', () => {
      for (const l of lessons) {
        expect(l.intro.trim(), l.skillId).not.toBe('');
        expect(l.blocks.length, l.skillId).toBeGreaterThanOrEqual(2);
        expect(l.examples.length, l.skillId).toBeGreaterThanOrEqual(1);
        for (const e of l.examples) expect(e.steps.length, l.skillId).toBeGreaterThanOrEqual(2);
        expect(l.pitfalls.length, l.skillId).toBeGreaterThanOrEqual(1);
        expect(l.minutes, l.skillId).toBeGreaterThanOrEqual(3);
        expect(l.minutes, l.skillId).toBeLessThanOrEqual(30);
      }
    });

    it('fiszki maja unikalne id, istniejaca umiejetnosc i obie strony', () => {
      expect(new Set(flashcards.map((c) => c.id)).size).toBe(flashcards.length);
      for (const c of flashcards) {
        expect(skillIds.has(c.skillId), c.id).toBe(true);
        expect(c.front.trim(), c.id).not.toBe('');
        expect(c.back.trim(), c.id).not.toBe('');
      }
    });

    it('kazda umiejetnosc kursu ma co najmniej dwie fiszki', () => {
      for (const s of courseSkills) {
        expect(flashcards.filter((c) => c.skillId === s.id).length, s.id).toBeGreaterThanOrEqual(2);
      }
    });

    it('umiejetnosc kursu ma zadania od latwych do maturalnych - bez skoku na gleboka wode', () => {
      for (const s of courseSkills) {
        const d = questionsOfSkill(s.id).map((q) => q.difficulty);
        expect(d.length, `${s.id}: za malo zadan`).toBeGreaterThanOrEqual(6);
        expect(Math.min(...d), `${s.id}: brak latwego wejscia`).toBeLessThanOrEqual(2);
        expect(Math.max(...d), `${s.id}: brak zadania na poziomie matury`).toBeGreaterThanOrEqual(4);
      }
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
          // Kod startowy w Pythonie sprawdza content/cs/python.test.ts (Pyodide).
          if (!code || code.language === 'python') continue;
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
