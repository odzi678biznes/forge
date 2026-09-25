import { describe, expect, it } from 'vitest';
import { latexToSpeech, promptToSpeech } from './speech';
import { MATH_QUESTIONS } from '@content/math/index';
import { CS_QUESTIONS } from '@content/cs/index';
import { BIZ_QUESTIONS } from '@content/biz/index';

describe('wzory na tekst mowiony', () => {
  it('potegi maja naturalne polskie nazwy', () => {
    expect(latexToSpeech('x^2')).toBe('x do kwadratu');
    expect(latexToSpeech('x^3')).toBe('x do sześcianu');
    expect(latexToSpeech('2^{n}')).toBe('2 do potęgi n');
  });

  it('ulamki czyta jako "przez"', () => {
    expect(latexToSpeech('\\dfrac{3}{5}')).toBe('3 przez 5');
  });

  it('logarytm czyta z podstawa', () => {
    expect(latexToSpeech('\\log_2 32')).toBe('logarytm o podstawie 2 z 32');
  });

  it('rownanie kwadratowe brzmi jak zdanie', () => {
    expect(latexToSpeech('x^2 - 6x + 5 = 0')).toBe(
      'x do kwadratu minus 6x plus 5 równa się 0',
    );
  });

  it('funkcje trygonometryczne i stopnie', () => {
    expect(latexToSpeech('\\sin 30^\\circ')).toBe('sinus 30 stopni');
  });

  it('wartosc funkcji czyta jako "od", pochodna z primem', () => {
    expect(latexToSpeech('f(x) = x^2')).toBe('f od x równa się x do kwadratu');
    expect(latexToSpeech("f'(2)")).toBe('f prim od 2');
    expect(latexToSpeech('P(A)')).toBe('P od A');
  });

  it('procent, przecinek dziesietny, modul i pierwiastek szescienny', () => {
    expect(latexToSpeech('15\\%')).toBe('15 procent');
    expect(latexToSpeech('7{,}846')).toBe('7,846');
    expect(latexToSpeech('36\\,000\\,000')).toBe('36000000');
    expect(latexToSpeech('|x - 2| < 5')).toContain('wartość bezwzględna z x minus 2');
    expect(latexToSpeech('\\sqrt[3]{8}')).toBe('pierwiastek sześcienny z 8');
    expect(latexToSpeech('0{,}5^{\\circ}\\mathrm{C}')).toBe('0,5 stopni C');
  });

  it('\\left nie jest czytane jako „mniejsze lub rowne”', () => {
    expect(latexToSpeech('\\left(x + 1\\right) \\le 2')).toBe('x plus 1 mniejsze lub równe 2');
    expect(latexToSpeech('x \\leftarrow 5')).toBe('x przyjmuje wartość 5');
  });

  it('sufit, podloga, modulo i macierz', () => {
    expect(latexToSpeech('\\lceil \\frac{m}{l} \\rceil')).toBe('sufit z m przez l');
    expect(latexToSpeech('\\lfloor \\sqrt{n} \\rfloor')).toBe('podłoga z pierwiastek z n');
    expect(latexToSpeech('a^n \\bmod m')).toBe('a do potęgi n modulo m');
    expect(latexToSpeech('\\begin{bmatrix} 1 & 1 \\\\ 1 & 0 \\end{bmatrix}')).toBe('macierz 1 1 oraz 1 0');
  });

  it('nawias po zmiennej to mnozenie, a nie funkcja', () => {
    expect(latexToSpeech('x(10-x)')).not.toContain(' od ');
  });

  it('zbior, prawdopodobienstwo warunkowe i kat', () => {
    expect(latexToSpeech(String.raw`\{1, 2, \ldots, 100\}`)).toBe('1, 2, i tak dalej , 100');
    expect(latexToSpeech(String.raw`P(A \mid B)`)).toBe('P od A pod warunkiem B');
    expect(latexToSpeech(String.raw`|\angle ACB|`)).toContain('kąt ACB');
  });
});

describe('cala tresc zadania', () => {
  it('tekst zostaje, wzor jest czytany', () => {
    expect(promptToSpeech('Oblicz $\\log_2 32$.')).toBe(
      'Oblicz logarytm o podstawie 2 z 32.',
    );
  });

  it('luka w zadaniu z luka jest czytana jako slowo', () => {
    expect(promptToSpeech('To koszt ________.')).toBe('To koszt luka.');
  });

  it('zadne zadanie z korpusu nie zostawia znacznikow LaTeX do przeczytania', () => {
    for (const q of [...MATH_QUESTIONS, ...CS_QUESTIONS, ...BIZ_QUESTIONS]) {
      const spoken = promptToSpeech(q.prompt);
      expect(spoken, q.id).not.toMatch(/[\\${}^_]/);
      expect(spoken.trim().length, q.id).toBeGreaterThan(0);
    }
  });
});
