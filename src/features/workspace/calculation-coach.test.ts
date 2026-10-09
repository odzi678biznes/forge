import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { KontekstNauczyciela } from '@/nauka/nauczyciel-kontekst';
import type { Odpowiedz } from '@/nauka/nauczyciel-klient';
import { clearTeacherConversations, readTeacherConversation } from '@/nauka/teacher-conversation';
import { askCalculationCoach, calculationReviewContext, coachConversationKey, coachResponseIsHelp } from './calculation-coach';

const context: KontekstNauczyciela = { przedmiot: 'Matematyka', lekcja: 'Taksówka', zadanie: null,
  krok: { etap: 'Rachunek', numer: 1, z: 2, pytanie: 'Ile kilometrów?', wyjasnienie: 'Oddziel opłatę stałą.', kontekst: '43 zł, opłata 8 zł, 3,5 zł/km.' },
  odpowiedzUcznia: null, czyPoprawna: null, trudnosci: [] };
const confirmation: Odpowiedz = { tryb: 'ai', model: 'mock', tekst: 'Dobrze: odejmujesz opłatę początkową.',
  struktura: { rodzaj: 'inne', ujawniaWynik: false, pytanieKontrolne: '', misconception: '' } };
beforeEach(() => {
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) });
  clearTeacherConversations();
});
afterEach(() => vi.unstubAllGlobals());
const input = (requestId = 'c1') => ({ storageKey: 'task1', requestId, request: 'sprawdz-rachunek' as const, context, text: '43-8=35' });

it('passes the task and deterministic result without declaring the whole task correct', () => {
  const result = calculationReviewContext(context, { expression: '43-8', result: '35', value: 35 });
  expect(result.krok.kontekst).toContain('43-8 = 35');
  expect(result.krok.kontekst).toContain('3,5 zł/km');
  expect(result.czyPoprawna).toBeNull();
});

it('issues one request and prevents extra cost when the same approved calculation is checked again', async () => {
  const ask = vi.fn().mockResolvedValue(confirmation);
  expect(await askCalculationCoach(input(), ask)).toBe('sent');
  expect(await askCalculationCoach(input(), ask)).toBe('duplicate');
  expect(ask).toHaveBeenCalledTimes(1);
  const response = readTeacherConversation(coachConversationKey('task1')).at(-1);
  expect(response).toMatchObject({ tryb: 'ai', helpPending: false, tekst: confirmation.tekst });
});

it('allows only one in-flight request per task and persists the late response without a mounted view', async () => {
  let finish!: (value: Odpowiedz) => void;
  const ask = vi.fn(() => new Promise<Odpowiedz>(resolve => { finish = resolve; }));
  const pending = askCalculationCoach(input(), ask);
  expect(await askCalculationCoach(input('c2'), ask)).toBe('busy');
  expect(ask).toHaveBeenCalledTimes(1);
  finish(confirmation); await pending;
  expect(readTeacherConversation(coachConversationKey('task1')).at(-1)?.tekst).toBe(confirmation.tekst);
});

it('does not invent a method check when offline and allows a conscious retry', async () => {
  const ask = vi.fn().mockResolvedValueOnce({ tryb: 'demo', model: null, tekst: 'Fallback hint', powod: 'offline' }).mockResolvedValueOnce(confirmation);
  await askCalculationCoach(input(), ask);
  expect(readTeacherConversation(coachConversationKey('task1')).at(-1)).toMatchObject({ tryb: 'demo', helpPending: false, powod: 'offline' });
  expect(readTeacherConversation(coachConversationKey('task1')).at(-1)?.tekst).not.toContain('Fallback hint');
  expect(await askCalculationCoach(input(), ask)).toBe('sent'); expect(ask).toHaveBeenCalledTimes(2);
});

it('distinguishes arithmetic confirmation and transcription from actual method assistance', () => {
  expect(coachResponseIsHelp(confirmation, 'sprawdz-rachunek')).toBe(false);
  const hint: Odpowiedz = { ...confirmation, struktura: { ...confirmation.struktura!, rodzaj: 'diagnoza' } };
  expect(coachResponseIsHelp(hint, 'sprawdz-rachunek')).toBe(true);
  expect(coachResponseIsHelp(hint, 'zapis')).toBe(false);
});

it('keeps an unsolicited result hidden and does not mark unseen assistance as used', async () => {
  await askCalculationCoach(input(), vi.fn().mockResolvedValue({ ...confirmation, struktura: { ...confirmation.struktura!, rodzaj: 'rozwiazanie', ujawniaWynik: true } }));
  expect(readTeacherConversation(coachConversationKey('task1')).at(-1)).toMatchObject({ ukryta: true, helpPending: false });
});

it('does not resurrect a review deleted while the request was running', async () => {
  let finish!: (value: Odpowiedz) => void;
  const request = askCalculationCoach(input(), () => new Promise(resolve => { finish = resolve; }));
  clearTeacherConversations(); finish(confirmation);
  expect(await request).toBe('cancelled');
});
