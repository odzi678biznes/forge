import { afterEach, describe, expect, it, vi } from 'vitest';
import { struktura, waliduj } from '../../../server/nauczyciel';
import type { KontekstNauczyciela } from '../nauczyciel-kontekst';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

const kontekst = (): KontekstNauczyciela => ({
  przedmiot: 'Matematyka',
  lekcja: 'Funkcja kwadratowa — parametr',
  zadanie: null,
  krok: { etap: 'Obliczenia', numer: 4, z: 10, pytanie: 'Oblicz Δ', wyjasnienie: 'Δ = m² − 16' },
  odpowiedzUcznia: 'm^2+8m+24',
  czyPoprawna: false,
  trudnosci: [],
  sesja: {
    aktywnosc: 'pełne zadanie',
    opanowanie: { 'delta i miejsca zerowe': 40 },
    bledy: [],
    podpowiedziPokazane: ['Podstaw a, b, c.'],
    podpowiedzi: ['Podstaw a, b, c.', 'b² = (m+2)²', 'Odejmij 4(m+5).', 'Przykład: (m+1)² − 4m'],
    przyklad: 'Przykład: (m+1)² − 4m',
    proby: ['m^2+8m+24 (źle)'],
    rozwiazanieUcznia: ['Δ > 0'],
    znaneBledy: ['discriminant-sign-error'],
    diagnoza: 'W Δ jest MINUS 4ac.',
  },
});

describe('nauczyciel w sesji — serwer', () => {
  it('przyjmuje nowe prośby i kontekst sesji, odrzuca zepsuty kontekst', () => {
    expect(waliduj({ kontekst: kontekst(), prosba: 'podpowiedz', historia: [] })).not.toBeNull();
    expect(waliduj({ kontekst: kontekst(), prosba: 'co-zle', historia: [] })).not.toBeNull();
    const zly = kontekst() as unknown as { sesja: { opanowanie: unknown } };
    zly.sesja.opanowanie = { x: 'dużo' };
    expect(waliduj({ kontekst: zly, prosba: 'podpowiedz', historia: [] })).toBeNull();
    expect(waliduj({ kontekst: kontekst(), prosba: 'rozwiaz-za-mnie', historia: [] })).toBeNull();
  });

  it('structured output: przyjmuje tylko znane pola i błędy z katalogu', () => {
    const ok = struktura(JSON.stringify({ rodzaj: 'podpowiedz', tekst: 'Zwróć uwagę na znak przed 4ac.', ujawniaWynik: false, pytanieKontrolne: 'Ile to −4·(m+5)?', misconception: 'discriminant-sign-error' }), ['discriminant-sign-error']);
    expect(ok?.misconception).toBe('discriminant-sign-error');
    const wymyslony = struktura(JSON.stringify({ rodzaj: 'diagnoza', tekst: 'x', ujawniaWynik: false, pytanieKontrolne: '', misconception: 'nowy-blad' }), ['discriminant-sign-error']);
    expect(wymyslony?.misconception).toBe('');
    expect(struktura('zwykły tekst zamiast JSON', [])).toBeNull();
    expect(struktura(JSON.stringify({ rodzaj: 'cokolwiek', tekst: 'x', ujawniaWynik: false }), [])).toBeNull();
  });
});

describe('nauczyciel w sesji — klient', () => {
  it('bez AI: kolejna podpowiedź z drabiny, nigdy wynik', async () => {
    const { demo } = await import('../nauczyciel-klient');
    expect(demo(kontekst(), 'podpowiedz').tekst).toBe('b² = (m+2)²');
    expect(demo(kontekst(), 'podobny').tekst).toContain('(m+1)²');
    expect(demo(kontekst(), 'co-zle').tekst).toBe('W Δ jest MINUS 4ac.');
    expect(demo(kontekst(), 'podpowiedz').tekst).not.toContain('m² − 16');
  });

  it('ta sama prośba w tym samym miejscu nie kosztuje drugiego zapytania', async () => {
    const reply = (data: unknown) => new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } });
    const fetch = vi.fn().mockImplementation((url: string) =>
      Promise.resolve(String(url).endsWith('/status')
        ? reply({ dostepny: true, model: 'test-model', powod: null })
        : reply({ tekst: 'Spójrz na znak.', model: 'test-model', struktura: { rodzaj: 'podpowiedz', ujawniaWynik: false, pytanieKontrolne: '', misconception: '' } })));
    vi.stubGlobal('fetch', fetch);
    const client = await import('../nauczyciel-klient');
    const a = await client.zapytajNauczyciela(kontekst(), 'podpowiedz', []);
    const b = await client.zapytajNauczyciela(kontekst(), 'podpowiedz', []);
    expect(a.tryb).toBe('ai');
    expect(b.zPamieci).toBe(true);
    expect(fetch.mock.calls.filter(([u]) => !String(u).endsWith('/status'))).toHaveLength(1);
  });
});
