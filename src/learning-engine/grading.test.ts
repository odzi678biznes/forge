import { describe, expect, it } from 'vitest';
import { GRADING_VERSION, grade, normalise, parseNumber } from './grading';
import { makeQuestion } from './testing';

describe('normalizacja zapisu', () => {
  it('zrownuje przecinek i kropke dziesietna', () => {
    expect(normalise('2,5')).toBe('2.5');
  });

  it('usuwa spacje i roznicuje wielkosc liter', () => {
    expect(normalise('  X = 2 ')).toBe('x=2');
  });

  it('sprowadza rozne myslniki do minusa', () => {
    expect(normalise('−3')).toBe('-3');
  });
});

describe('parsowanie liczb', () => {
  it('czyta ulamek zwykly', () => {
    expect(parseNumber('3/4')).toBe(0.75);
  });

  it('odrzuca dzielenie przez zero', () => {
    expect(parseNumber('1/0')).toBeNull();
  });

  it('odrzuca tekst', () => {
    expect(parseNumber('abc')).toBeNull();
  });
});

describe('ocenianie', () => {
  it('przyjmuje rowniez wariant zapisu', () => {
    const q = makeQuestion({
      format: 'exact-text',
      answer: 'x=2',
      acceptedVariants: ['2'],
    });
    expect(grade(q, '2').correctness).toBe('correct');
    expect(grade(q, 'X = 2').correctness).toBe('correct');
  });

  it('stosuje tolerancje liczbowa', () => {
    const q = makeQuestion({ format: 'numeric', answer: '3.14159', tolerance: 0.01 });
    expect(grade(q, '3.14').correctness).toBe('correct');
    expect(grade(q, '3.2').correctness).toBe('incorrect');
  });

  it('bez tolerancji wymaga dokladnej wartosci', () => {
    const q = makeQuestion({ format: 'numeric', answer: '2' });
    expect(grade(q, '2.0001').correctness).toBe('incorrect');
  });

  it('pusta odpowiedz nie jest poprawna', () => {
    expect(grade(makeQuestion(), '   ').correctness).toBe('incorrect');
  });

  it('rozpoznaje typowy blad i nazywa jego przyczyne', () => {
    const q = makeQuestion({
      format: 'numeric',
      answer: '4',
      commonErrors: [
        {
          id: 'err-znak',
          matches: ['-4'],
          cause: 'Zgubiony znak przy przenoszeniu wyrazu na druga strone.',
          rule: 'Przenoszac wyraz przez rownosc, zmieniamy jego znak.',
        },
      ],
    });
    const g = grade(q, '-4');
    expect(g.correctness).toBe('incorrect');
    expect(g.error?.id).toBe('err-znak');
    expect(g.note).toContain('znak');
  });

  it('nierozpoznana pomylka nie udaje zdiagnozowanego bledu', () => {
    const q = makeQuestion({ format: 'numeric', answer: '4' });
    const g = grade(q, '17');
    expect(g.error).toBeNull();
  });

  it('wersja zasad oceniania jest jawna', () => {
    expect(GRADING_VERSION).toMatch(/\S/);
  });
});

describe('zadania programistyczne', () => {
  it('grade() odmawia glosno zamiast cicho ocenic kod jako bledny', () => {
    const q = makeQuestion({ format: 'code' });
    expect(() => grade(q, 'function f(){}')).toThrow(/CodeRunner/);
  });
});

describe('jednostki i zadania zamkniete', () => {
  it('jednostka na koncu nie psuje odpowiedzi liczbowej', () => {
    const q = makeQuestion({ format: 'numeric', answer: '1020' });
    for (const a of ['1020 zł', '1020zl', '1020 PLN']) expect(grade(q, a).correctness, a).toBe('correct');
    const pct = makeQuestion({ format: 'numeric', answer: '25' });
    expect(grade(pct, '25%').correctness).toBe('correct');
    expect(grade(pct, '25 %').correctness).toBe('correct');
  });

  it('jednostka nie ratuje zlej liczby', () => {
    const q = makeQuestion({ format: 'numeric', answer: '25' });
    expect(grade(q, '24%').correctness).toBe('incorrect');
  });

  it('litera w zadaniu zamknietym moze byc zapisana na rozne sposoby', () => {
    const q = makeQuestion({ format: 'choice', answer: 'B', choices: ['1', '2', '3', '4'] });
    for (const a of ['B', 'b', '(B)', 'B)', ' b ']) expect(grade(q, a).correctness, a).toBe('correct');
    expect(grade(q, 'A').correctness).toBe('incorrect');
  });
});
