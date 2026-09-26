import { expect, it } from 'vitest';
import katex from 'katex';
import { splitMath } from '@/components/Math';
import { LEKCJE } from './lekcje';
import { ZADANIA_CKE } from './zadania-cke';

function teksty(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(teksty);
  if (value && typeof value === 'object') return Object.values(value).flatMap(teksty);
  return [];
}

it('wszystkie wzory w kartach, podpowiedziach i rozwiązaniach dają się odczytać', () => {
  for (const text of teksty([LEKCJE, ZADANIA_CKE])) {
    for (const part of splitMath(text)) {
      if (part.math) expect(() => katex.renderToString(part.text, { throwOnError: true }), text).not.toThrow();
    }
  }
});

it('wybory mają rozłączne etykiety i istniejący klucz, a analiza błędu ma kontekst', () => {
  for (const karta of LEKCJE.flatMap(l => l.karty)) {
    if (karta.rodzaj === 'wybor') {
      expect(new Set(karta.opcje.map(x => x.trim())).size, karta.id).toBe(karta.opcje.length);
      expect(karta.opcje.length, karta.id).toBeGreaterThanOrEqual(2);
      expect(karta.opcje.length, karta.id).toBeLessThanOrEqual(4);
      expect(karta.opcje[karta.poprawna], karta.id).toBeTruthy();
    }
    if (karta.rodzaj === 'blad') {
      expect(karta.kontekst, karta.id).toBeTruthy();
      expect(karta.linie[karta.bledna], karta.id).toBeTruthy();
    }
  }
});
