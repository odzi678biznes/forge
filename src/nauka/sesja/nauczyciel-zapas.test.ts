import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ZapytanieNauczyciela } from '../nauczyciel-kontekst';
import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Serwer nauczyciela z atrapą SDK: odpowiedź w strukturze, a gdy API odrzuci
 * format JSON — jedno ponowienie bez schematu, żeby dotychczasowy nauczyciel
 * (feed kart CKE) nie przestał działać.
 */

const create = vi.fn();

vi.mock('@anthropic-ai/sdk', async (importOriginal) => {
  const real = (await importOriginal<typeof import('@anthropic-ai/sdk')>()).default;
  class Atrapa {
    beta = { messages: { create } };
  }
  for (const nazwa of ['APIError', 'BadRequestError', 'AuthenticationError', 'RateLimitError', 'APIConnectionError'] as const) {
    (Atrapa as unknown as Record<string, unknown>)[nazwa] = real[nazwa];
  }
  return { default: Atrapa, ...(Atrapa as object) };
});

const { zapytaj, middleware } = await import('../../../server/nauczyciel');
const Anthropic = (await vi.importActual<typeof import('@anthropic-ai/sdk')>('@anthropic-ai/sdk')).default;

const zapytanie = (): ZapytanieNauczyciela => ({
  prosba: 'nie-rozumiem',
  historia: [],
  kontekst: {
    przedmiot: 'Matematyka',
    lekcja: 'Potęgi',
    zadanie: null,
    krok: { etap: 'Wskaż zasadę', numer: 2, z: 9, pytanie: 'Ile to (2^3)^2?', wyjasnienie: 'Wykładniki mnożymy.' },
    odpowiedzUcznia: null,
    czyPoprawna: null,
    trudnosci: [],
  },
});

const wiadomosc = (tekst: string) => ({ model: 'test-model', stop_reason: 'end_turn', content: [{ type: 'text', text: tekst }] });

beforeEach(() => create.mockReset());

describe('serwer nauczyciela — structured output i tryb zapasowy', () => {
  it('pyta ze schematem i zwraca pola struktury', async () => {
    create.mockResolvedValueOnce(wiadomosc(JSON.stringify({ rodzaj: 'wyjasnienie', tekst: 'Potęga potęgi: mnożysz wykładniki.', ujawniaWynik: false, pytanieKontrolne: 'Ile to 3·2?', misconception: '' })));
    const o = await zapytaj(zapytanie());
    expect(o.tekst).toBe('Potęga potęgi: mnożysz wykładniki.');
    expect(o.struktura?.pytanieKontrolne).toBe('Ile to 3·2?');
    expect(create.mock.calls[0]![0].output_config.format.type).toBe('json_schema');
  });

  it('kontrola rachunku rozdziela samo potwierdzenie od wskazówki o następnej metodzie', async () => {
    create.mockResolvedValueOnce(wiadomosc(JSON.stringify({ rodzaj: 'inne', tekst: 'Zamiana potęgi na odwrotność jest poprawna.', ujawniaWynik: false, pytanieKontrolne: '', misconception: '' })));
    const request = { ...zapytanie(), prosba: 'sprawdz-rachunek' as const };
    request.kontekst.krok.kontekst = 'Całość: (1+3*2^(-1))^(-2). OSTATNI ZATWIERDZONY RACHUNEK: 2^(-1) = 0.5.';
    const answer = await zapytaj(request);
    const provider = create.mock.calls[0]![0];
    expect(provider.system).toContain('Ten tryb ma pierwszeństwo przed ogólną zasadą pomagania w następnym kroku');
    expect(provider.system).toContain('WYŁĄCZNIE potwierdź sens wykonanego kroku');
    expect(provider.system).toContain('Zostaw pytanieKontrolne puste');
    expect(provider.system).toContain('wymaga rodzaj=podpowiedz, nigdy rodzaj=inne');
    expect(provider.system).toContain('2^(-1) = 0.5');
    expect(provider.messages.at(-1).content).toContain('ostatni zatwierdzony rachunek');
    expect(answer.struktura).toMatchObject({ rodzaj: 'inne', ujawniaWynik: false, pytanieKontrolne: '' });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('gdy API odrzuci format JSON — ponawia bez schematu i nadal odpowiada', async () => {
    create
      .mockRejectedValueOnce(new Anthropic.BadRequestError(400, { type: 'error', error: { type: 'invalid_request_error', message: 'format' } }, 'format', new Headers()))
      .mockResolvedValueOnce(wiadomosc('Weźmy mniejszy przykład: (2^2)^3.'));
    const o = await zapytaj(zapytanie());
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1]![0].output_config.format).toBeUndefined();
    expect(o.tekst).toBe('Weźmy mniejszy przykład: (2^2)^3.');
    expect(o.struktura?.ujawniaWynik).toBe(true);
  });

  it('nigdy nie pokazuje uczniowi surowego JSON-a', async () => {
    create.mockResolvedValueOnce(wiadomosc('{"rodzaj":"inne","tekst":""}'));
    expect((await zapytaj(zapytanie())).tekst).toMatch(/Nie udało się/);
    create.mockResolvedValueOnce(wiadomosc('```json\n{"rodzaj":"podpowiedz","tekst":"Spójrz na wykładniki.","ujawniaWynik":false,"pytanieKontrolne":"","misconception":""}\n```'));
    expect((await zapytaj(zapytanie())).tekst).toBe('Spójrz na wykładniki.');
  });

  it('inne błędy API nie są ponawiane (limit, klucz)', async () => {
    create.mockRejectedValueOnce(new Anthropic.RateLimitError(429, { type: 'error', error: { type: 'rate_limit_error', message: 'x' } }, 'x', new Headers()));
    await expect(zapytaj(zapytanie())).rejects.toBeInstanceOf(Anthropic.RateLimitError);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('brak usage pozostaje nieznanym kosztem, zamiast fałszywym zerem', async () => {
    create.mockResolvedValueOnce(wiadomosc('Sprawdź regułę potęgowania.'));
    const result = await zapytaj(zapytanie());
    expect(result).not.toHaveProperty('usage');
    create.mockResolvedValueOnce({ ...wiadomosc('Sprawdź regułę.'), usage: { input_tokens: 81, output_tokens: 17 } });
    expect((await zapytaj(zapytanie())).usage).toEqual({ inputTokens: 81, outputTokens: 17, cacheReadTokens: 0, cacheWriteTokens: 0 });
  });

  it('provider 401 unieważnia status połączenia przez callback warstwy lokalnej', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'mock-key');
    try {
      create.mockRejectedValueOnce(new Anthropic.AuthenticationError(401, { type: 'error', error: { type: 'authentication_error', message: 'invalid' } }, 'invalid', new Headers()));
      const req = Object.assign(Readable.from([JSON.stringify(zapytanie())]), { url: '/api/nauczyciel', method: 'POST' });
      const res = { statusCode: 0, setHeader: vi.fn(), end: vi.fn() };
      const invalidate = vi.fn();
      await middleware(req as unknown as IncomingMessage, res as unknown as ServerResponse, vi.fn(), invalidate);
      expect(invalidate).toHaveBeenCalledOnce(); expect(res.statusCode).toBe(502);
    } finally { vi.unstubAllEnvs(); }
  });
});
