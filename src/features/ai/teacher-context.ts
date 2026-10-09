import type { Lesson, Question, Skill } from '@/data/types';
import type { KontekstNauczyciela } from '@/nauka/nauczyciel-kontekst';
import { grade } from '@/learning-engine/grading';

/** Shared context for the teacher in the regular course and the exercise workspace. */
export function teacherQuestionContext(question: Question, options: {
  skillName?: string; answer?: string; notes?: string; step?: string; hintLevel?: number;
} = {}): KontekstNauczyciela {
  const hints = question.hints.filter(h => h.level < 6).map(h => h.text);
  const confirmedFinal = !options.step && options.answer && question.format !== 'code'
    && grade(question, options.answer).correctness === 'correct';
  return {
    przedmiot: question.format === 'code' ? 'Informatyka' : 'Matematyka',
    lekcja: options.skillName ?? question.skillId,
    zadanie: {
      zrodlo: question.source || 'FORGE', dokument: 'Ćwiczenie', numer: question.id,
      poziom: 'liceum', url: '', tresc: question.prompt,
      ...(question.choices ? { odpowiedzi: question.choices } : {}),
      oficjalnaOdpowiedz: question.answer, zasadyOceniania: 'Samodzielna odpowiedź ucznia; narzędzia rachunkowe nie są podpowiedzią.',
      rozwiazanie: question.steps ?? [question.solution],
    },
    krok: { etap: 'Ćwiczenie', numer: 1, z: 1, pytanie: options.step ?? question.prompt,
      wyjasnienie: hints[0] ?? 'Zapisz dane i ustal, czego szukasz. Wybierz jeden mały krok.',
      kontekst: `Brudnopis ucznia (jeszcze niesprawdzony):\n${(options.notes ?? '').slice(-6000)}` },
    odpowiedzUcznia: options.answer || null, czyPoprawna: confirmedFinal ? true : null, trudnosci: [],
    sesja: { aktywnosc: 'Zadanie z brudnopisem', opanowanie: {}, bledy: [],
      podpowiedziPokazane: question.hints.filter(h => h.level <= (options.hintLevel ?? 0)).map(h => h.text),
      podpowiedzi: hints, proby: [], rozwiazanieUcznia: options.notes ? [options.notes.slice(-6000)] : [],
      znaneBledy: question.commonErrors.map(e => e.id),
      opisyBledow: Object.fromEntries(question.commonErrors.map(e => [e.id, `${e.cause} Reguła: ${e.rule}`])) },
  };
}

export function teacherLessonContext(lesson: Lesson, skill: Skill): KontekstNauczyciela {
  return {
    przedmiot: 'Lekcja', lekcja: skill.name, zadanie: null,
    krok: { etap: 'Czytanie lekcji', numer: 1, z: 1, pytanie: lesson.intro,
      kontekst: [...(lesson.idea ?? []), ...lesson.blocks.flatMap(b => b.kind === 'formula' ? [b.tex] : 'body' in b ? [b.body] : []), ...(lesson.method ?? [])].join('\n').slice(0, 10000),
      wyjasnienie: lesson.method?.[0] ?? lesson.intro },
    odpowiedzUcznia: null, czyPoprawna: null, trudnosci: [],
  };
}
