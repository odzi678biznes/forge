/**
 * Odebranie workerowi piaskownicy dostępu do sieci, magazynów i kanału
 * komunikacji — Blueprint sek. 12 (minimalne uprawnienia) i sek. 16
 * (ocenianie kodu na złośliwych danych).
 *
 * Kontekst: worker ładowany z pliku NIE dziedziczy CSP strony. Zostało to
 * sprawdzone na zbudowanej aplikacji — kod ucznia wysyłał żądania sieciowe
 * i docierał do punktu IPC Tauri (który odrzucił go dopiero na braku klucza
 * wywołania). Dlatego piaskownica sama odbiera sobie te możliwości, zanim
 * wykona się jakakolwiek linijka ucznia.
 *
 * OGRANICZENIE, którego nie da się tu usunąć: dynamiczne `import(url)` jest
 * składnią języka, a nie właściwością obiektu globalnego — nie da się go
 * skasować. Kod ucznia nadal może więc zainicjować żądanie przez `import()`.
 * Nie ma w workerze nic do wyniesienia (brak bazy, klucza API i stanu
 * aplikacji), a IPC wymaga klucza, którego worker nie zna — ale „brak sieci"
 * jest tu obietnicą częściową, a nie pełną.
 */

/**
 * Nazwy odbierane kodowi ucznia. Kolejność grup:
 * sieć, ładowanie kodu, magazyny tego samego origin, kanały komunikacji.
 */
export const REVOKED = [
  // sieć
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'WebTransport',
  'Request',
  'Response',
  // ładowanie i uruchamianie dalszego kodu
  'importScripts',
  'Worker',
  'SharedWorker',
  // magazyny współdzielone z aplikacją (ten sam origin)
  'indexedDB',
  'caches',
  'navigator',
  // kanały do innych kontekstów tego samego origin
  'BroadcastChannel',
  'MessageChannel',
  'postMessage',
] as const;

/**
 * Usuwa wskazane nazwy z obiektu globalnego i z CAŁEGO łańcucha prototypów.
 *
 * Samo `self.fetch = undefined` nie wystarcza: `fetch` żyje na prototypie
 * zakresu workera, więc uczeń odzyskałby go przez
 * `Object.getPrototypeOf(self).fetch`. Stąd przejście po łańcuchu.
 *
 * Zwraca nazwy, których nie udało się usunąć ani zasłonić — worker może
 * wtedy odmówić uruchomienia kodu.
 */
export function lockDown(scope: object, names: readonly string[] = REVOKED): string[] {
  const survivors: string[] = [];

  for (const name of names) {
    let holder: object | null = scope;
    while (holder !== null) {
      if (Object.prototype.hasOwnProperty.call(holder, name)) {
        const removed = Reflect.deleteProperty(holder, name);
        if (!removed) {
          // Właściwość nieusuwalna — próbujemy ją przynajmniej zasłonić.
          try {
            Object.defineProperty(holder, name, {
              value: undefined,
              writable: false,
              configurable: false,
            });
          } catch {
            // obsłużone niżej: nazwa trafi na listę ocalałych
          }
        }
      }
      holder = Object.getPrototypeOf(holder) as object | null;
    }

    if ((scope as Record<string, unknown>)[name] !== undefined) survivors.push(name);
  }

  return survivors;
}
