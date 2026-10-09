import { describe, expect, it } from 'vitest';
import { MATH_CORPUS } from '@content/math';
import { CS_CORPUS } from '@content/cs';
import { BIZ_CORPUS } from '@content/biz';
import { firstLessonSentence, lessonAudio, lessonDigest, naturalAudioParts } from './lesson-audio';

describe('lekcja w pigułce i tekst odczytu', () => {
  it('długie fragmenty mieszczą się w nagraniu i zachowują wszystkie słowa', () => {
    const text = 'Wyjaśnienie '.repeat(500).trim();
    const parts = naturalAudioParts([{ label: 'Zasada', text, start: 20 }]);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.map((part) => part.text).join(' ')).toBe(text);
    expect(parts.every((part) => part.text.length <= 1800)).toBe(true);
  });
  it('nie rozcina wzorów, liczb dziesiętnych, kodu ani skrótów', () => {
    expect(firstLessonSentence('Np. oblicz $x = 3.14$ i `x. metoda()`. Dalej.')).toBe('Np. oblicz $x = 3.14$ i `x. metoda()`.');
    expect(firstLessonSentence('Wzór $a^0 = 1$ dla $a \\ne 0$. Dalej.')).toBe('Wzór $a^0 = 1$ dla $a \\ne 0$.');
  });

  it('skrót pierwszej lekcji zawiera zasadę, wzór i ostrzeżenie zamiast ogólnego wstępu', () => {
    const lesson = MATH_CORPUS.lessons.find((l) => l.skillId === 'num-order')!;
    const digest = lessonDigest(lesson);
    expect(digest).toHaveLength(4);
    expect(digest[0]).toContain('najpierw nawiasy');
    expect(digest[2]).toContain('\\frac{ad + bc}{bd}');
    expect(digest[3]).toContain('Liczba mieszana');
    const audio = lessonAudio(lesson, digest);
    expect(audio.parts).toHaveLength(4);
    expect(audio.text).not.toContain(lesson.intro);
  });

  it('każda lekcja ma krótki skrót z kompletnymi wzorami i kodem', () => {
    for (const corpus of [MATH_CORPUS, CS_CORPUS, BIZ_CORPUS]) {
      for (const lesson of corpus.lessons) {
        const digest = lessonDigest(lesson);
        expect(digest.length, lesson.skillId).toBeGreaterThanOrEqual(2);
        expect(digest.length, lesson.skillId).toBeLessThanOrEqual(4);
        for (const sentence of digest) {
          expect(sentence.trim().length, lesson.skillId).toBeGreaterThan(0);
          expect((sentence.match(/(?<!\\)\$/g) ?? []).length % 2, lesson.skillId).toBe(0);
          expect((sentence.match(/`/g) ?? []).length % 2, lesson.skillId).toBe(0);
        }
      }
    }
  });

  it('punkty przewijania odpowiadają tekstowi już po konwersji LaTeX', () => {
    const lesson = MATH_CORPUS.lessons.find((l) => l.skillId === 'num-order')!;
    const audio = lessonAudio(lesson);
    expect(audio.text).not.toContain('\\frac');
    expect(audio.text).not.toContain('$');
    expect(audio.parts.some((p) => p.label === 'Jak to zrobić · krok 1')).toBe(true);
    expect(audio.parts.some((p) => p.label === 'Pułapka 1')).toBe(true);
    for (const part of audio.parts) expect(audio.text.slice(part.start, part.start + part.text.length)).toBe(part.text);
  });
});
