import { afterEach, expect, it, vi } from 'vitest';
import { beginTeacherRequest, changeTeacherConversation, clearTeacherConversations, finishTeacherRequest, isTeacherRequestCurrent, readTeacherConversation } from './teacher-conversation';

afterEach(() => vi.unstubAllGlobals());

it('keeps a late response and blocks another request while a closed panel is waiting', () => {
  const disk = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => disk.set(k, v) });
  const key = 'test:late-response';
  expect(beginTeacherRequest(key)).toBe(true);
  changeTeacherConversation(key, items => [...items, { id: 'question', rola: 'uczen', tekst: 'Co dalej?' }]);
  // No mounted UI/subscribers: response arrives after closing the modal.
  expect(beginTeacherRequest(key)).toBe(false);
  changeTeacherConversation(key, items => [...items, {
    id: 'response', rola: 'nauczyciel', tekst: 'Spójrz na znak.', pytanieKontrolne: 'Co oznacza minus?',
    helpPending: true, prosba: 'podpowiedz',
  }]);
  finishTeacherRequest(key);
  expect(readTeacherConversation(key)).toHaveLength(2);
  expect(readTeacherConversation(key)[1]).toMatchObject({ helpPending: true, pytanieKontrolne: 'Co oznacza minus?' });
  expect(beginTeacherRequest(key)).toBe(true); finishTeacherRequest(key);
});

it('retains the newer response in memory when writes fail but old localStorage remains readable', () => {
  const key = 'test:quota-response';
  let disk = JSON.stringify([{ id: 'old', rola: 'uczen', tekst: 'Moje pytanie' }]);
  let writeBlocked = true;
  vi.stubGlobal('localStorage', {
    getItem: () => disk,
    setItem: (_k: string, next: string) => { if (writeBlocked) throw new Error('Quota exceeded'); disk = next; },
  });
  changeTeacherConversation(key, items => [...items, { id: 'new', rola: 'nauczyciel', tekst: 'Odpowiedź po zamknięciu', helpPending: true }]);
  expect(readTeacherConversation(key)).toHaveLength(2);
  expect(readTeacherConversation(key)[1]?.tekst).toBe('Odpowiedź po zamknięciu');
  changeTeacherConversation(key, items => items.map(item => ({ ...item, helpPending: false })));
  expect(readTeacherConversation(key)[1]?.helpPending).toBe(false);
  writeBlocked = false;
  changeTeacherConversation(key, items => items);
  expect(JSON.parse(disk)).toHaveLength(2);
  expect(readTeacherConversation(key)[1]?.tekst).toBe('Odpowiedź po zamknięciu');
});

it('preserves the hidden-result flag when a response arrives with no mounted panel', () => {
  const disk = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (k: string) => disk.get(k) ?? null, setItem: (k: string, v: string) => disk.set(k, v) });
  const key = 'test:hidden-result';
  changeTeacherConversation(key, () => [{ id: 'hidden', rola: 'nauczyciel', tekst: 'Wynik to 16.', ukryta: true, helpPending: false, pytanieKontrolne: 'Czy otrzymałeś 16?' }]);
  const reopened = readTeacherConversation(key);
  expect(reopened[0]).toMatchObject({ ukryta: true, helpPending: false });
  expect(reopened.filter(message => !message.ukryta)).toHaveLength(0);
});

it('invalidates a deleted request without letting its late completion unlock a newer request', () => {
  const key = 'forge.teacher.chat:test:delete-while-waiting';
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw new Error('blocked'); } });
  changeTeacherConversation(key, () => [{ rola: 'uczen', tekst: 'Old private question' }]);
  expect(beginTeacherRequest(key, 'old-request')).toBe(true);
  clearTeacherConversations(candidate => candidate === key);
  expect(readTeacherConversation(key)).toEqual([]);
  expect(isTeacherRequestCurrent(key, 'old-request')).toBe(false);
  expect(beginTeacherRequest(key, 'new-request')).toBe(true);
  finishTeacherRequest(key, 'old-request');
  expect(isTeacherRequestCurrent(key, 'new-request')).toBe(true);
  finishTeacherRequest(key, 'new-request');
});
