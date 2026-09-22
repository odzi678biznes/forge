import { describe, expect, it } from 'vitest';
import { grade, normalise, parseNumber } from '@/learning-engine/grading';
import { HINT_LADDER, type Question } from '@/data/types';
import {
  MATH_CORPUS,
  MATH_QUESTIONS,
  MATH_SKILLS,
  MATH_TOPICS,
  questionsOfSkill,
  skillsOfTopic,
} from './index';

/**
 * Kontrola całego korpusu treści.
 *
 * Błąd w treści jest groźniejszy niż błąd w kodzie: silnik będzie go karnie
 * egzekwował wobec ucznia i zbuduje na nim fałszywy dowód opanowania.
 * Te testy sprawdzają wszystko, co da się sprawdzić maszynowo — nie
 * zastępują weryfikacji merytorycznej (pole `verified`).
 */

const skillIds = new Set(MATH_SKILLS.map((s) => s.id));
const topicIds = new Set(MATH_TOPICS.map((t) => t.id));

describe('struktura korpusu', () => {
  it('identyfikatory działów, kompetencji i pytań są unikalne', () => {
    expect(topicIds.size).toBe(MATH_TOPICS.length);
    expect(skillIds.size).toBe(MATH_SKILLS.length);
    expect(new Set(MATH_QUESTIONS.map((q) => q.id)).size).toBe(MATH_QUESTIONS.length);
  });

  it('każdy dział należy do przedmiotu, każda kompetencja do istniejącego działu', () => {
    for (const t of MATH_TOPICS) expect(t.subjectId).toBe(MATH_CORPUS.subject.id);
    for (const s of MATH_SKILLS) expect(topicIds.has(s.topicId), s.id).toBe(true);
  });

  it('każde pytanie wskazuje na istniejącą kompetencję', () => {
    for (const q of MATH_QUESTIONS) expect(skillIds.has(q.skillId), q.id).toBe(true);
  });

  it('każdy dział ma co najmniej jedną kompetencję', () => {
    for (const t of MATH_TOPICS) expect(skillsOfTopic(t.id).length, t.id).toBeGreaterThan(0);
  });

  it('warunki wstępne wskazują na istniejące kompetencje i nie na siebie', () => {
    for (const s of MATH_SKILLS) {
      expect(s.prerequisites).not.toContain(s.id);
      for (const p of s.prerequisites) expect(skillIds.has(p), `${s.id} -> ${p}`).toBe(true);
    }
  });

  it('graf warunków wstępnych nie zawiera cyklu', () => {
    const byId = new Map(MATH_SKILLS.map((s) => [s.id, s]));
    const stan = new Map<string, 'w-trakcie' | 'gotowe'>();

    const odwiedz = (id: string, sciezka: string[]): void => {
      if (stan.get(id) === 'gotowe') return;
      expect(stan.get(id), `cykl: ${[...sciezka, id].join(' -> ')}`).not.toBe('w-trakcie');
      stan.set(id, 'w-trakcie');
      for (const p of byId.get(id)?.prerequisites ?? []) odwiedz(p, [...sciezka, id]);
      stan.set(id, 'gotowe');
    };

    for (const s of MATH_SKILLS) odwiedz(s.id, []);
  });

  it('wartość maturalna mieści się w 0..1', () => {
    for (const s of MATH_SKILLS) {
      expect(s.examValue, s.id).toBeGreaterThanOrEqual(0);
      expect(s.examValue, s.id).toBeLessThanOrEqual(1);
    }
  });
});

describe('pytania', () => {
  it('trudność mieści się w 1..5', () => {
    for (const q of MATH_QUESTIONS) {
      expect(q.difficulty, q.id).toBeGreaterThanOrEqual(1);
      expect(q.difficulty, q.id).toBeLessThanOrEqual(5);
    }
  });

  it('każde pytanie ma treść, rozwiązanie i źródło', () => {
    for (const q of MATH_QUESTIONS) {
      expect(q.prompt.trim(), q.id).not.toBe('');
      expect(q.solution.trim(), q.id).not.toBe('');
      expect(q.source.trim(), q.id).not.toBe('');
    }
  });

  it('odpowiedzi liczbowe dają się sparsować', () => {
    for (const q of MATH_QUESTIONS.filter((x) => x.format === 'numeric')) {
      expect(parseNumber(normalise(q.answer)), q.id).not.toBeNull();
    }
  });

  it('poprawna odpowiedź i każdy jej wariant przechodzą własne ocenianie', () => {
    for (const q of MATH_QUESTIONS) {
      expect(grade(q, q.answer).correctness, q.id).toBe('correct');
      for (const v of q.acceptedVariants) {
        expect(grade(q, v).correctness, `${q.id} / ${v}`).toBe('correct');
      }
    }
  });

  it('znaczniki LaTeX są sparowane', () => {
    for (const q of MATH_QUESTIONS) {
      const dolary = (q.prompt.match(/\$/g) ?? []).length;
      expect(dolary % 2, `${q.id}: nieparzysta liczba znaków $`).toBe(0);
    }
  });
});

describe('drabina podpowiedzi', () => {
  /**
   * Poziomy 1-4 mają naprowadzać. Poziom 5 to z definicji „jeden krok
   * wspólnie", a 6 to pełne rozwiązanie — tam odsłona wartości jest zamierzona.
   */
  const GUIDING_LEVELS = 4;

  const numbersIn = (text: string): number[] =>
    (text.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

  it('poziomy są rosnące, bez powtórzeń i w zakresie drabiny', () => {
    for (const q of MATH_QUESTIONS) {
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

  it('każde pytanie ma pełną drabinę naprowadzającą i krok wspólny', () => {
    for (const q of MATH_QUESTIONS) {
      expect(q.hints.length, q.id).toBeGreaterThanOrEqual(4);
      expect(q.hints.some((h) => h.level >= 5), `${q.id}: brak kroku wspólnego`).toBe(true);
    }
  });

  it('pierwsza podpowiedź jest pytaniem diagnostycznym, nie gotowcem', () => {
    for (const q of MATH_QUESTIONS) {
      const first = q.hints[0];
      expect(first?.level, q.id).toBe(1);
      expect(first?.text, q.id).toContain('?');
    }
  });

  it('podpowiedzi naprowadzające nie zdradzają gotowej odpowiedzi', () => {
    for (const q of MATH_QUESTIONS.filter((x) => x.format === 'numeric')) {
      const expected = parseNumber(normalise(q.answer));
      // Liczba obecna w treści zadania to współczynnik, nie wynik — jej
      // powtórzenie w podpowiedzi niczego nie zdradza.
      const fromPrompt = new Set(numbersIn(q.prompt));

      for (const h of q.hints.filter((x) => x.level <= GUIDING_LEVELS)) {
        const leaks = numbersIn(h.text).some((n) => n === expected && !fromPrompt.has(n));
        expect(leaks, `${q.id} / poziom ${h.level}: "${h.text}"`).toBe(false);
      }
    }
  });
});

describe('typowe błędy', () => {
  it('identyfikatory błędów są unikalne w całym korpusie', () => {
    const ids = MATH_QUESTIONS.flatMap((q) => q.commonErrors.map((e) => e.id));
    const duplikaty = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplikaty, `powtórzone: ${[...new Set(duplikaty)].join(', ')}`).toEqual([]);
  });

  it('żaden typowy błąd nie pokrywa się z poprawną odpowiedzią', () => {
    for (const q of MATH_QUESTIONS) {
      for (const e of q.commonErrors) {
        for (const m of e.matches) {
          expect(grade(q, m).correctness, `${q.id} / ${e.id} / ${m}`).toBe('incorrect');
        }
      }
    }
  });

  it('wpisany typowy błąd jest rozpoznawany przez ocenianie', () => {
    for (const q of MATH_QUESTIONS) {
      for (const e of q.commonErrors) {
        for (const m of e.matches) {
          expect(grade(q, m).error?.id, `${q.id} / ${m}`).toBe(e.id);
        }
      }
    }
  });

  it('każdy typowy błąd nazywa przyczynę i złamaną zasadę', () => {
    for (const q of MATH_QUESTIONS) {
      for (const e of q.commonErrors) {
        expect(e.cause.trim(), e.id).not.toBe('');
        expect(e.rule.trim(), e.id).not.toBe('');
      }
    }
  });

  it('każde pytanie ma co najmniej jeden zdiagnozowany typowy błąd', () => {
    for (const q of MATH_QUESTIONS) {
      expect(q.commonErrors.length, q.id).toBeGreaterThan(0);
    }
  });
});

describe('gotowość do diagnozy i misji', () => {
  const hasKind = (skillId: string, kind: Question['kind']) =>
    questionsOfSkill(skillId).some((q) => q.kind === kind);

  it('każda kompetencja ma zadanie fundamentalne, typowe i transferowe', () => {
    for (const id of skillIds) {
      expect(hasKind(id, 'foundation'), `${id}: brak fundamentu`).toBe(true);
      expect(hasKind(id, 'typical'), `${id}: brak zadania typowego`).toBe(true);
      expect(hasKind(id, 'transfer'), `${id}: brak transferu`).toBe(true);
    }
  });

  it('korpus pokrywa przekrój działów wymagany przez diagnozę', () => {
    // Sek. 15, Etap 3: diagnoza ma dotykać wszystkich działów, nie jednego.
    expect(MATH_TOPICS.length).toBeGreaterThanOrEqual(5);
    expect(MATH_SKILLS.length).toBeGreaterThanOrEqual(15);
  });

  it('każdy dział daje się przejść w rosnącej trudności', () => {
    for (const t of MATH_TOPICS) {
      const trudnosci = skillsOfTopic(t.id)
        .flatMap((s) => questionsOfSkill(s.id))
        .map((q) => q.difficulty);
      expect(globalThis.Math.min(...trudnosci), t.id).toBeLessThanOrEqual(2);
      expect(globalThis.Math.max(...trudnosci), t.id).toBeGreaterThanOrEqual(4);
    }
  });

  it('cała treść jest jawnie oznaczona statusem weryfikacji', () => {
    for (const q of MATH_QUESTIONS) expect(typeof q.verified, q.id).toBe('boolean');
  });
});
