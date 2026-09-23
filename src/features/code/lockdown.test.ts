import { describe, expect, it } from 'vitest';
import { REVOKED, lockDown } from './lockdown';

/**
 * Blokada działa na prawdziwym zakresie workera w przeglądarce. Tu sprawdzamy
 * jej logikę na atrapie o tym samym kształcie: metody na prototypie, a nie
 * na samym obiekcie globalnym — dokładnie tak, jak w WorkerGlobalScope.
 */
function fakeScope() {
  const base = { fetch: () => 'siec', importScripts: () => 'kod' };
  const middle = Object.create(base) as Record<string, unknown>;
  middle.postMessage = () => 'kanal';
  const scope = Object.create(middle) as Record<string, unknown>;
  scope.XMLHttpRequest = function XHR() {};
  scope.indexedDB = {};
  scope.Math = Math;
  return { scope, base, middle };
}

describe('blokada piaskownicy', () => {
  it('usuwa nazwy z obiektu globalnego', () => {
    const { scope } = fakeScope();
    lockDown(scope);
    expect(scope.XMLHttpRequest).toBeUndefined();
    expect(scope.indexedDB).toBeUndefined();
  });

  it('usuwa nazwy takze z prototypow - inaczej uczen odzyskalby je przez getPrototypeOf', () => {
    const { scope, base, middle } = fakeScope();
    lockDown(scope);
    expect(scope.fetch).toBeUndefined();
    expect(scope.postMessage).toBeUndefined();
    expect((base as Record<string, unknown>).fetch).toBeUndefined();
    expect(middle.postMessage).toBeUndefined();
  });

  it('nie rusza tego, co nie jest na liscie', () => {
    const { scope } = fakeScope();
    lockDown(scope);
    expect(scope.Math).toBe(Math);
  });

  it('zglasza nazwy, ktorych nie udalo sie odebrac', () => {
    const scope: Record<string, unknown> = {};
    Object.defineProperty(scope, 'fetch', { value: () => 1, configurable: false, writable: false });
    expect(lockDown(scope, ['fetch'])).toEqual(['fetch']);
  });

  it('lista obejmuje siec, ladowanie kodu, magazyny i kanal komunikacji', () => {
    for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'importScripts', 'indexedDB', 'postMessage']) {
      expect(REVOKED, name).toContain(name);
    }
  });
});
