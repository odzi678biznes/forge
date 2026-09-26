import type {
  KontekstNauczyciela,
  OdpowiedzNauczyciela,
  Prosba,
  StatusNauczyciela,
  WiadomoscCzatu,
} from './nauczyciel-kontekst';

/**
 * Klient nauczyciela AI. Endpoint działa tylko przy serwerze (npm run dev /
 * preview) z kluczem API. Bez niego — na GitHub Pages, w Tauri albo bez
 * klucza — odpowiada tryb demonstracyjny, który NIE jest AI: składa odpowiedź
 * z podpowiedzi, wyjaśnień i oficjalnego rozwiązania zapisanych przy karcie.
 */

// Public server address only. Provider API keys must never use a VITE_ variable.
const API = (import.meta.env.VITE_NAUCZYCIEL_API_URL?.trim() || `${import.meta.env.BASE_URL}api/nauczyciel`).replace(/\/$/, '');
let accessCode = '';
try { accessCode = sessionStorage.getItem('forge.teacher.access') ?? ''; } catch { /* optional storage */ }
function authorization(): Record<string, string> { return accessCode ? { Authorization: `Bearer ${accessCode}` } : {}; }
export function ustawKodNauczyciela(code: string): void {
  accessCode = code.trim();
  try { sessionStorage.setItem('forge.teacher.access', accessCode); } catch { /* keep in memory */ }
  statusCache = null;
  statusExpires = 0;
}

export interface Odpowiedz {
  tekst: string;
  /** 'ai' — odpowiedział model; 'demo' — tryb demonstracyjny bez AI. */
  tryb: 'ai' | 'demo';
  model: string | null;
  /** Dla trybu demo: czego brakuje do prawdziwego nauczyciela. */
  powod?: string;
}

let statusCache: Promise<StatusNauczyciela> | null = null;
let statusExpires = 0;

export function statusNauczyciela(): Promise<StatusNauczyciela> {
  if (Date.now() >= statusExpires) statusCache = null;
  if (!statusCache) statusExpires = Date.now() + 30_000;
  statusCache ??= fetch(`${API}/status`, { headers: { Accept: 'application/json', ...authorization() }, signal: AbortSignal.timeout(10_000), cache: 'no-store' })
    .then(async (r) => {
      if ((!r.ok && r.status !== 401) || !(r.headers.get('content-type') ?? '').includes('json')) throw new Error(String(r.status));
      const body = await r.json() as StatusNauczyciela;
      if (typeof body.dostepny !== 'boolean') throw new Error('Nieprawidłowy status serwera');
      return body;
    })
    .catch(
      (): StatusNauczyciela => ({
        dostepny: false,
        model: null,
        powod: 'Nie udało się połączyć z serwerem nauczyciela. Sprawdź internet i spróbuj ponownie.',
      }),
    );
  return statusCache;
}

export function odswiezStatusNauczyciela(): Promise<StatusNauczyciela> {
  statusExpires = 0;
  return statusNauczyciela();
}

export async function zapytajNauczyciela(
  kontekst: KontekstNauczyciela,
  prosba: Prosba,
  historia: WiadomoscCzatu[],
  pytanie?: string,
): Promise<Odpowiedz> {
  const s = await statusNauczyciela();
  if (!s.dostepny) return { ...demo(kontekst, prosba), ...(s.powod ? { powod: s.powod } : {}) };
  try {
    const r = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authorization() },
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({ kontekst, prosba, historia, ...(pytanie ? { pytanie } : {}) }),
    });
    if (!r.ok) {
      const blad = ((await r.json().catch(() => ({}))) as { blad?: string }).blad ?? `HTTP ${r.status}`;
      return { ...demo(kontekst, prosba), powod: `Nauczyciel AI nie odpowiedział: ${blad}` };
    }
    const o = (await r.json()) as OdpowiedzNauczyciela;
    if (typeof o.tekst !== 'string' || !o.tekst.trim() || typeof o.model !== 'string') throw new Error('Nieprawidłowa odpowiedź serwera');
    return { tekst: o.tekst, tryb: 'ai', model: o.model };
  } catch {
    return { ...demo(kontekst, prosba), powod: 'Brak połączenia z serwerem nauczyciela.' };
  }
}

/** Tryb demonstracyjny: tylko to, co już jest zapisane przy karcie i zadaniu. */
export function demo(k: KontekstNauczyciela, prosba: Prosba): Odpowiedz {
  const z = k.zadanie;
  const krokRozw = z ? (z.rozwiazanie[Math.min(z.rozwiazanie.length - 1, Math.max(0, k.krok.numer - 2))] ?? '') : '';
  let tekst: string;
  switch (prosba) {
    case 'nastepny-krok':
      tekst = k.odpowiedzUcznia !== null && k.czyPoprawna === false
        ? `Twoja odpowiedź „${k.odpowiedzUcznia}” nie pasuje. ${k.krok.wyjasnienie}`
        : `Spróbuj tak: ${krokRozw || k.krok.wyjasnienie}`;
      break;
    case 'nie-rozumiem':
      tekst = `Weźmy tylko ten jeden krok. ${k.krok.wyjasnienie}`;
      break;
    case 'skad':
      tekst = z ? `W rozwiązaniu tego zadania ten krok wygląda tak: ${krokRozw}` : k.krok.wyjasnienie;
      break;
    case 'inaczej':
      tekst = z ? `Całe rozwiązanie w skrócie: ${z.rozwiazanie.join(' ')}` : k.krok.wyjasnienie;
      break;
    case 'pelne':
      tekst = z
        ? `${z.rozwiazanie.map((r, i) => `${i + 1}. ${r}`).join('\n')}\nOficjalna odpowiedź (klucz CKE): ${z.oficjalnaOdpowiedz}`
        : k.krok.wyjasnienie;
      break;
    case 'pytanie':
      tekst = 'W trybie demonstracyjnym nie odpowiem na własne pytanie — do tego potrzebny jest prawdziwy nauczyciel AI na serwerze.';
      break;
  }
  return { tekst, tryb: 'demo', model: null };
}
